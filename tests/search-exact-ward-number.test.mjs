import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const searchPage = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");
const directory = await readFile(new URL("../src/lib/directory.ts", import.meta.url), "utf8");

const start = directory.indexOf("export async function getPublicWardsByNumber");
const end = directory.indexOf("\nexport async function ", start + 1);
const helper = directory.slice(start, end);

test("numeric search requests only the exact ward-number dataset", () => {
  assert.match(searchPage, /const numericQuery = \/\^\[0-9\]\+\$\/\.test\(query\) \? Number\(query\) : null/);
  assert.match(searchPage, /numericQuery !== null \? getPublicWardsByNumber\(numericQuery\) : getAllPublicWards\(\)/);
});

test("exact ward helper validates the input and filters verified public rows", () => {
  assert.notEqual(start, -1, "missing exact-number helper");
  assert.match(helper, /Number\.isSafeInteger\(wardNumber\)/);
  assert.match(helper, /wardNumber < 1/);
  assert.match(helper, /ward_number=eq\.\$\{wardNumber\}/);
  assert.match(helper, /is_published=eq\.true&is_verified=eq\.true/);
});

test("exact ward helper paginates without unbounded responses", () => {
  assert.match(helper, /limit=\$\{pageSize\}&offset=\$\{offset\}/);
  assert.match(helper, /while \(true\)/);
  assert.match(helper, /if \(page\.length < pageSize\) return rows/);
});
