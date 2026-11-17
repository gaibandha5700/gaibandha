#!/usr/bin/env node
/**
 * Import Gaibandha district, upazila, union and municipality polygons.
 * Default mode is a read-only dry run. Use --apply to call the protected
 * Supabase RPC; imported rows always remain unpublished and unverified.
 */
const ARCGIS_BASE = "https://www.arcgisbd.com/server/rest/services/ADB005/CRIIPS/MapServer";
const SOURCE_NAME = "ArcGIS Bangladesh CRIIPS — BBS 2022 administrative boundary layers";
const EXPECTED = { district: 1, upazila: 7, union: 81 };
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

if (!supabaseUrl || !serviceKey) {
  throw new Error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
}

const normalize = (value) => String(value ?? "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const normalizeMunicipality = (value) =>
  normalize(value).replace(/pourashava|paurashava|municipality|municipal/g, "");

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}

async function supabase(path, options = {}) {
  return getJson(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

async function arcgisFeatures(layerId) {
  const url = new URL(`${ARCGIS_BASE}/${layerId}/query`);
  url.search = new URLSearchParams({
    where: "District='Gaibandha'",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  }).toString();
  const result = await getJson(url);
  if (result?.type !== "FeatureCollection" || !Array.isArray(result.features)) {
    throw new Error(`ArcGIS layer ${layerId} did not return a GeoJSON FeatureCollection.`);
  }
  return result.features;
}

function toMultiPolygon(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    throw new Error("A source feature has no geometry coordinates.");
  }
  if (geometry.type === "MultiPolygon") return geometry;
  if (geometry.type === "Polygon") return { type: "MultiPolygon", coordinates: [geometry.coordinates] };
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function validateCoordinates(geometry) {
  let coordinateCount = 0;
  const visit = (value) => {
    if (Array.isArray(value) && value.length >= 2 &&
        typeof value[0] === "number" && typeof value[1] === "number") {
      const [longitude, latitude] = value;
      if (longitude < 88 || longitude > 93 || latitude < 20 || latitude > 27) {
        throw new Error(`Coordinate outside expected Bangladesh extent: ${longitude}, ${latitude}`);
      }
      coordinateCount++;
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
  };
  visit(geometry.coordinates);
  if (coordinateCount < 4) throw new Error("Geometry contains too few coordinates.");
}

function uniqueMatch(name, map, label, normalizer = normalize) {
  const matches = map.get(normalizer(name)) ?? [];
  if (matches.length !== 1) {
    throw new Error(`Could not uniquely match ${label} "${name}" (matches: ${matches.length}).`);
  }
  return matches[0];
}

function recordFor(feature, entity, layerId) {
  const boundary = toMultiPolygon(feature.geometry);
  validateCoordinates(boundary);
  return {
    ...entity,
    boundary,
    source_name: SOURCE_NAME,
    source_url: `${ARCGIS_BASE}/${layerId}`,
    source_checked_at: new Date().toISOString(),
  };
}

const districts = await supabase("districts?select=id,name_en,slug&slug=eq.gaibandha");
if (districts.length !== 1) throw new Error("Expected exactly one Gaibandha district row.");
const district = districts[0];

const [upazilas, unions, municipalities, currentBoundaries] = await Promise.all([
  supabase(`upazilas?select=id,name_en,slug,district_id&district_id=eq.${district.id}`),
  supabase("unions?select=id,name_en,slug,upazila_id"),
  supabase("municipalities?select=id,name_en,slug,upazila_id"),
  supabase("administrative_boundaries?select=id,district_id,upazila_id,union_id,municipality_id,ward_id&is_current=eq.true"),
]);

if (upazilas.length !== EXPECTED.upazila) throw new Error(`Expected 7 Gaibandha upazilas; found ${upazilas.length}.`);
const upazilaMap = new Map();
for (const item of upazilas) {
  const key = normalize(item.name_en);
  upazilaMap.set(key, [...(upazilaMap.get(key) ?? []), item]);
}
const upazilaById = new Map(upazilas.map((item) => [item.id, item]));
const unionMapByUpazila = new Map();
for (const item of unions) {
  if (!upazilaById.has(item.upazila_id)) continue;
  const key = `${item.upazila_id}:${normalize(item.name_en)}`;
  unionMapByUpazila.set(key, [...(unionMapByUpazila.get(key) ?? []), item]);
}
const municipalityMap = new Map();
for (const item of municipalities) {
  const key = normalizeMunicipality(item.name_en);
  municipalityMap.set(key, [...(municipalityMap.get(key) ?? []), item]);
}

const [districtFeatures, upazilaFeatures, localFeatures] = await Promise.all([
  arcgisFeatures(121), arcgisFeatures(122), arcgisFeatures(123),
]);

const records = [];
const counts = { district: 0, upazila: 0, union: 0 };

for (const feature of districtFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;
  records.push(recordFor(feature, { district_id: district.id }, 121));
  counts.district++;
}

for (const feature of upazilaFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;
  const entity = uniqueMatch(props.Upazila, upazilaMap, "upazila");
  records.push(recordFor(feature, { upazila_id: entity.id }, 122));
  counts.upazila++;
}

for (const feature of localFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;

  // BBS 2022 layer 123 is a Union Boundary layer, not a Pourashava layer.
  // Never infer municipal polygons from union attributes.
  if (props.UnName) {
    const parent = uniqueMatch(props.Upazila, upazilaMap, "parent upazila");
    const key = `${parent.id}:${normalize(props.UnName)}`;
    const entity = uniqueMatch(props.UnName, new Map([[normalize(props.UnName), unionMapByUpazila.get(key) ?? []]]), "union within parent upazila");
    records.push(recordFor(feature, { union_id: entity.id }, 123));
    counts.union++;
  }
}

for (const [level, expected] of Object.entries(EXPECTED)) {
  if (counts[level] !== expected) {
    throw new Error(`Validation stopped: expected ${expected} ${level} features, received ${counts[level]}. No database rows were written.`);
  }
}
const entityIds = records.map((r) => r.district_id ?? r.upazila_id ?? r.union_id ?? r.municipality_id);
if (new Set(entityIds).size !== records.length) throw new Error("Duplicate boundary feature detected.");

console.log(JSON.stringify({
  mode: apply ? "APPLY" : "DRY RUN",
  source: SOURCE_NAME,
  expected: EXPECTED,
  matched: counts,
  total: records.length,
  existingCurrentBoundaries: currentBoundaries.length,
  publicStatus: "All imported rows remain unpublished and unverified.",
}, null, 2));

if (!apply) {
  console.log("Dry run only. Review all counts and matches before using --apply.");
  process.exit(0);
}

const result = await supabase("rpc/import_administrative_boundaries", {
  method: "POST",
  body: JSON.stringify({ p_records: records }),
});
const verification = await supabase(
  "administrative_boundaries?select=id,district_id,upazila_id,union_id,municipality_id,is_published,is_verified&is_current=eq.true",
);
const imported = new Set(entityIds);
const verifiedRows = verification.filter((row) =>
  [row.district_id, row.upazila_id, row.union_id, row.municipality_id]
    .some((id) => id && imported.has(id))
);
if (verifiedRows.length !== records.length ||
    verifiedRows.some((row) => row.is_published || row.is_verified)) {
  throw new Error(`Post-import verification failed: expected ${records.length} unpublished/unverified rows, found ${verifiedRows.length}.`);
}
console.log(JSON.stringify({ ...result, verifiedCurrentBoundaryRows: verifiedRows.length }, null, 2));
