import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const searchPage = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");
const directory = await readFile(new URL("../src/lib/directory.ts", import.meta.url), "utf8");

test("search page loads unions and municipalities through batched helpers", () => {
  assert.match(searchPage, /getAllPublicUnions/);
  assert.match(searchPage, /getAllPublicMunicipalities/);
  assert.doesNotMatch(searchPage, /getUnionsByUpazila|getMunicipalitiesByUpazila/);
});

test("batched union and municipality helpers paginate verified public rows", () => {
  for (const functionName of ["getAllPublicUnions", "getAllPublicMunicipalities"]) {
    const start = directory.indexOf(`export async function ${functionName}`);
    assert.notEqual(start, -1, `missing helper: ${functionName}`);
    const end = directory.indexOf("\nexport async function ", start + 1);
    const section = directory.slice(start, end === -1 ? directory.length : end);
    assert.match(section, /is_published=eq\.true&is_verified=eq\.true/);
    assert.match(section, /limit=\$\{pageSize\}&offset=\$\{offset\}/);
    assert.match(section, /while \(true\)/);
  }
});
