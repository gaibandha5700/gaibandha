import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sitemap = await readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");

test("sitemap loads unions and municipalities through shared paginated batch helpers", () => {
  assert.match(sitemap, /getAllPublicUnions\(\)/);
  assert.match(sitemap, /getAllPublicMunicipalities\(\)/);
  assert.doesNotMatch(sitemap, /getUnionsByUpazila|getMunicipalitiesByUpazila/);
});

test("sitemap groups fetched administrative rows by their upazila", () => {
  assert.match(sitemap, /union\.upazila_id/);
  assert.match(sitemap, /municipality\.upazila_id/);
  assert.match(sitemap, /unionsByUpazila\.get\(upazila\.id\)/);
  assert.match(sitemap, /municipalitiesByUpazila\.get\(upazila\.id\)/);
});
