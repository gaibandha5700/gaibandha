import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/app/statistics/page.tsx", import.meta.url), "utf8");
const directory = readFileSync(new URL("../src/lib/directory.ts", import.meta.url), "utf8");

test("statistics page fetches administrative collections in four bounded streams", () => {
  assert.match(page, /getAllPublicUnions/);
  assert.match(page, /getAllPublicMunicipalities/);
  assert.match(page, /getAllPublicMunicipalWards/);
  assert.match(page, /const \[upazilas, publicUnions, publicMunicipalities, publicMunicipalWards\] = await Promise\.all/);
  assert.match(page, /publicUnions\.filter\(union => union\.upazila_id === u\.id\)/);
  assert.match(page, /publicMunicipalities\.filter\(municipality => municipality\.upazila_id === u\.id\)/);
  assert.match(page, /publicMunicipalWards\.filter\(ward => ward\.municipality_id === municipality\.id\)/);
  assert.doesNotMatch(page, /getUnionsByUpazila/);
  assert.doesNotMatch(page, /getMunicipalitiesByUpazila/);
  assert.doesNotMatch(page, /getWardsByMunicipality/);
});

test("municipal-ward batch helper uses bounded pagination and public verification filters", () => {
  assert.match(directory, /export async function getAllPublicMunicipalWards\(\): Promise<Ward\[]>/);
  assert.match(directory, /municipality_id=not\.is\.null/);
  assert.match(directory, /is_published=eq\.true&is_verified=eq\.true/);
  assert.match(directory, /order=municipality_id\.asc,ward_number\.asc,id\.asc&limit=\$\{pageSize\}&offset=\$\{offset\}/);
  assert.match(directory, /const pageSize = 500/);
  assert.match(directory, /if \(page\.length < pageSize\) return rows/);
});
