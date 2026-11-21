#!/usr/bin/env node
/**
 * LEGACY / ARCHIVED: read-only validator for sourced union-ward GeoJSON.
 * Union-ward GIS is no longer an active public-map completion target (see docs/gis/map-scope.md).
 * It does not import, publish, verify or modify database records.
 *
 * Usage:
 *   node scripts/validate-union-ward-geojson.mjs candidate.geojson manifest.json
 *
 * Inventory: docs/gis/union-ward-coverage.csv (live database entity IDs)
 * Required feature properties: upazila_slug, union_slug, ward_number
 * Required manifest: sourceName, sourceUrl, sourceEdition, acquisitionDate, license, notes
 */
import fs from "node:fs";
import path from "node:path";

const [geojsonPath, manifestPath] = process.argv.slice(2);
if (!geojsonPath || !manifestPath) {
  console.error("Usage: node scripts/validate-union-ward-geojson.mjs candidate.geojson manifest.json");
  process.exit(2);
}
const inventoryPath = path.join(process.cwd(), "docs/gis/union-ward-coverage.csv");
const parseCsv = (text) => {
  const rows=[]; let row=[], field="", quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==="\\" && text[i+1]==='"'){field+='"';i++;}
      else if(ch==='"' && text[i+1]==='"'){field+='"';i++;}
      else if(ch==='"') quoted=false;
      else field+=ch;
    } else if(ch==='"') quoted=true;
    else if(ch===","){row.push(field);field="";}
    else if(ch==="\n"){row.push(field);rows.push(row);row=[];field="";}
    else if(ch!=="\r")field+=ch;
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows;
};
const inventoryRows=parseCsv(fs.readFileSync(inventoryPath,"utf8"));
const headers=inventoryRows.shift();
const expected=new Map(inventoryRows.map(row=>{
  const obj=Object.fromEntries(headers.map((h,i)=>[h,row[i]]));
  return [`${obj.upazila_slug}/${obj.union_slug}/${obj.ward_number}`,obj];
}));
const geojson=JSON.parse(fs.readFileSync(geojsonPath,"utf8"));
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const errors=[];
for(const key of ["sourceName","sourceUrl","sourceEdition","acquisitionDate","license","notes"]){
  if(!String(manifest[key]??"").trim())errors.push(`Manifest missing ${key}`);
}
if(!/^https:\/\//.test(String(manifest.sourceUrl??"")))errors.push("Manifest sourceUrl must be HTTPS");
if(geojson.type!=="FeatureCollection"||!Array.isArray(geojson.features))errors.push("Input must be a GeoJSON FeatureCollection");
const features=geojson.features??[];
const seen=new Set(), counts=new Map();
let vertices=0;
const checkCoord=(coord,key)=>{
  if(!Array.isArray(coord)||coord.length<2||typeof coord[0]!=="number"||typeof coord[1]!=="number"){
    errors.push(`${key}: malformed coordinate`);return;
  }
  const [lon,lat]=coord;
  if(lon<88||lon>93||lat<20||lat>27)errors.push(`${key}: coordinate outside Gaibandha/Bangladesh extent (${lon}, ${lat})`);
  vertices++;
};
const checkRing=(ring,key)=>{
  if(!Array.isArray(ring)||ring.length<4){errors.push(`${key}: ring has fewer than 4 coordinates`);return;}
  ring.forEach(c=>checkCoord(c,key));
  const first=ring[0],last=ring[ring.length-1];
  if(!Array.isArray(first)||!Array.isArray(last)||first[0]!==last[0]||first[1]!==last[1])errors.push(`${key}: ring is not closed`);
};
const checkGeometry=(geometry,key)=>{
  if(!geometry||!["Polygon","MultiPolygon"].includes(geometry.type)){errors.push(`${key}: geometry must be Polygon or MultiPolygon`);return;}
  if(!Array.isArray(geometry.coordinates)||!geometry.coordinates.length){errors.push(`${key}: empty coordinates`);return;}
  const polygons=geometry.type==="Polygon"? [geometry.coordinates]:geometry.coordinates;
  for(const poly of polygons){
    if(!Array.isArray(poly)||!poly.length){errors.push(`${key}: empty polygon ring list`);continue;}
    poly.forEach(ring=>checkRing(ring,key));
  }
};
for(const feature of features){
  const props=feature?.properties??{};
  const ward=Number(props.ward_number);
  const key=`${props.upazila_slug}/${props.union_slug}/${ward}`;
  if(!props.upazila_slug||!props.union_slug||!Number.isInteger(ward))errors.push("Feature missing upazila_slug, union_slug or integer ward_number");
  if(!expected.has(key))errors.push(`Unexpected ward key ${key}`);
  if(seen.has(key))errors.push(`Duplicate ward key ${key}`);
  seen.add(key);
  const unionKey=`${props.upazila_slug}/${props.union_slug}`;
  counts.set(unionKey,(counts.get(unionKey)??0)+1);
  if(!feature.id&&props.source_feature_id==null)errors.push(`${key}: preserve Feature.id or source_feature_id`);
  checkGeometry(feature.geometry,key);
}
for(const key of expected.keys())if(!seen.has(key))errors.push(`Missing ${key}`);
for(const [unionKey,count] of counts)if(count!==9)errors.push(`${unionKey}: expected 9 features, received ${count}`);
const summary={
  expectedWardKeys:expected.size,
  featuresReceived:features.length,
  uniqueKeys:seen.size,
  unionsWithFeatures:counts.size,
  coordinatePairsChecked:vertices,
  source:manifest.sourceName??null,
};
console.log(JSON.stringify(summary,null,2));
if(errors.length){
  console.error(`Validation failed with ${errors.length} error(s):`);
  for(const error of errors.slice(0,100))console.error("- "+error);
  if(errors.length>100)console.error(`- ... ${errors.length-100} additional errors`);
  process.exit(1);
}
console.log("Preliminary structural validation passed. PostGIS ST_IsValid/ST_IsEmpty/SRID checks, union-parent spatial containment, cross-union overlap/gap/topology checks, source review and human verification remain mandatory before staging/import.");
