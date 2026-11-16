#!/usr/bin/env node
/**
 * Import Gaibandha administrative polygons from the BBS-2022-labelled
 * ArcGIS layers into public.administrative_boundaries.
 *
 * Safe by default: dry-run only. Pass --apply to write.
 * Requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
 * SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 * Imported rows remain unpublished and unverified until checked against
 * official LGED/BBS boundary files. No ward polygons are available in these
 * three layers, so wards are intentionally excluded.
 */

const ARCGIS_BASE =
  "https://www.arcgisbd.com/server/rest/services/ADB005/CRIIPS/MapServer";
const SOURCE_NAME =
  "ArcGIS Bangladesh CRIIPS — BBS 2022 administrative boundary layers";
const EXPECTED = { district: 1, upazila: 7, union: 81, municipality: 4 };

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apply = process.argv.includes("--apply");

if (!supabaseUrl || !serviceKey) {
  throw new Error(
    "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const municipalityName = (value) =>
  normalize(value)
    .replace(/pourashava|paurashava|municipality|municipal/g, "");

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
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
    throw new Error(`ArcGIS layer ${layerId} did not return GeoJSON features.`);
  }
  return result.features;
}

function toMultiPolygon(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    throw new Error("A boundary feature has no polygon coordinates.");
  }
  if (geometry.type === "MultiPolygon") return geometry;
  if (geometry.type === "Polygon") {
    return { type: "MultiPolygon", coordinates: [geometry.coordinates] };
  }
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function validateCoordinates(geometry) {
  const visit = (value) => {
    if (
      Array.isArray(value) &&
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      const [longitude, latitude] = value;
      if (
        longitude < 88 ||
        longitude > 93 ||
        latitude < 20 ||
        latitude > 27
      ) {
        throw new Error(
          `Coordinate outside expected Bangladesh extent: ${longitude}, ${latitude}`,
        );
      }
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
  };
  visit(geometry.coordinates);
}

function featureRecord(level, feature, entity) {
  const geometry = toMultiPolygon(feature.geometry);
  validateCoordinates(geometry);

  return {
    ...entity,
    boundary: geometry,
    source_name: SOURCE_NAME,
    source_url: `${ARCGIS_BASE}/${level.layerId}`,
    source_checked_at: new Date().toISOString(),
    is_current: true,
    is_published: false,
    is_verified: false,
    verified_at: null,
  };
}

function findUnique(records, sourceName, targetMap, normalizeName = normalize) {
  const key = normalizeName(sourceName);
  const matches = targetMap.get(key) ?? [];
  if (matches.length !== 1) {
    throw new Error(
      `Could not uniquely match source name "${sourceName}" (matches: ${matches.length}).`,
    );
  }
  return matches[0];
}

const [districts, upazilas, unions, municipalities, currentBoundaries] =
  await Promise.all([
    supabase("districts?select=id,name_en,slug&slug=eq.gaibandha"),
    supabase("upazilas?select=id,name_en,slug"),
    supabase("unions?select=id,name_en,slug,upazila_id"),
    supabase("municipalities?select=id,name_en,slug,upazila_id"),
    supabase(
      "administrative_boundaries?select=id,district_id,upazila_id,union_id,municipality_id,ward_id&is_current=eq.true",
    ),
  ]);

if (districts.length !== 1) throw new Error("Expected exactly one Gaibandha district row.");

const upazilaMap = new Map();
for (const item of upazilas) {
  const key = normalize(item.name_en);
  upazilaMap.set(key, [...(upazilaMap.get(key) ?? []), item]);
}
const unionMap = new Map();
for (const item of unions) {
  const key = normalize(item.name_en);
  unionMap.set(key, [...(unionMap.get(key) ?? []), item]);
}
const municipalityMap = new Map();
for (const item of municipalities) {
  const key = municipalityName(item.name_en);
  municipalityMap.set(key, [...(municipalityMap.get(key) ?? []), item]);
}

const [districtFeatures, upazilaFeatures, localFeatures] = await Promise.all([
  arcgisFeatures(121),
  arcgisFeatures(122),
  arcgisFeatures(123),
]);

const records = [];
const counts = { district: 0, upazila: 0, union: 0, municipality: 0 };

for (const feature of districtFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;
  records.push(
    featureRecord({ layerId: 121 }, feature, { district_id: districts[0].id }),
  );
  counts.district++;
}

for (const feature of upazilaFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;
  const entity = findUnique(
    upazilas,
    props.Upazila,
    upazilaMap,
  );
  records.push(
    featureRecord({ layerId: 122 }, feature, { upazila_id: entity.id }),
  );
  counts.upazila++;
}

for (const feature of localFeatures) {
  const props = feature.properties ?? {};
  if (normalize(props.District) !== normalize("Gaibandha")) continue;

  if (props.Municipal) {
    const entity = findUnique(
      municipalities,
      props.Municipal,
      municipalityMap,
      municipalityName,
    );
    records.push(
      featureRecord({ layerId: 123 }, feature, {
        municipality_id: entity.id,
      }),
    );
    counts.municipality++;
  } else if (props.UnName) {
    const entity = findUnique(unions, props.UnName, unionMap);
    const parent = upazilas.find((item) => item.id === entity.upazila_id);
    if (!parent || normalize(parent.name_en) !== normalize(props.Upazila)) {
      throw new Error(
        `Parent upazila mismatch for union "${props.UnName}" in "${props.Upazila}".`,
      );
    }
    records.push(
      featureRecord({ layerId: 123 }, feature, { union_id: entity.id }),
    );
    counts.union++;
  }
}

for (const [level, expected] of Object.entries(EXPECTED)) {
  if (counts[level] !== expected) {
    throw new Error(
      `Validation stopped: expected ${expected} ${level} features, received ${counts[level]}. No database rows were written.`,
    );
  }
}

const seenEntities = new Set();
for (const record of records) {
  const key =
    record.district_id ??
    record.upazila_id ??
    record.union_id ??
    record.municipality_id;
  if (seenEntities.has(key)) {
    throw new Error(`Duplicate boundary feature for entity ${key}.`);
  }
  seenEntities.add(key);
}

const existingByEntity = new Map();
for (const row of currentBoundaries) {
  const key =
    row.district_id ??
    row.upazila_id ??
    row.union_id ??
    row.municipality_id ??
    row.ward_id;
  if (key) existingByEntity.set(key, row.id);
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "APPLY" : "DRY RUN",
      source: SOURCE_NAME,
      expected: EXPECTED,
      matched: counts,
      total: records.length,
      existingCurrentBoundaries: currentBoundaries.length,
      publicStatus: "All imported rows remain unpublished and unverified.",
    },
    null,
    2,
  ),
);

if (!apply) {
  console.log("Dry run only. Re-run with --apply after reviewing the counts.");
  process.exit(0);
}

const inserts = [];
const updates = [];
for (const record of records) {
  const entityId =
    record.district_id ??
    record.upazila_id ??
    record.union_id ??
    record.municipality_id;
  const existingId = existingByEntity.get(entityId);
  if (existingId) updates.push({ id: existingId, ...record });
  else inserts.push(record);
}

if (inserts.length) {
  await supabase("administrative_boundaries", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(inserts),
  });
}

for (const record of updates) {
  const { id, ...payload } = record;
  await supabase(
    `administrative_boundaries?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    },
  );
}

const verification = await supabase(
  "administrative_boundaries?select=id,district_id,upazila_id,union_id,municipality_id,ward_id,is_published,is_verified&is_current=eq.true",
);
const importedIds = new Set(
  records.map(
    (record) =>
      record.district_id ??
      record.upazila_id ??
      record.union_id ??
      record.municipality_id,
  ),
);
const verifiedCount = verification.filter((row) =>
  [
    row.district_id,
    row.upazila_id,
    row.union_id,
    row.municipality_id,
  ].some((id) => id && importedIds.has(id)),
).length;

if (verifiedCount !== records.length) {
  throw new Error(
    `Post-import verification mismatch: expected ${records.length}, found ${verifiedCount}.`,
  );
}

console.log(
  JSON.stringify(
    {
      inserted: inserts.length,
      updated: updates.length,
      verifiedCurrentBoundaryRows: verifiedCount,
      published: 0,
      verified: 0,
    },
    null,
    2,
  ),
);
