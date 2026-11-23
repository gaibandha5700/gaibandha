import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseExactWardNumberSearch } from "../src/lib/ward-number-search.mjs";

const searchPage = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");
const directory = await readFile(new URL("../src/lib/directory.ts", import.meta.url), "utf8");

const start = directory.indexOf("export async function getPublicWardsByNumber");
const end = directory.indexOf("\nexport async function ", start + 1);
const helper = directory.slice(start, end);

test("exact ward query parser supports digits and common Bengali/English prefixes", () => {
  assert.equal(parseExactWardNumberSearch("1"), 1);
  assert.equal(parseExactWardNumberSearch("০১"), 1);
  assert.equal(parseExactWardNumberSearch("ward 1"), 1);
  assert.equal(parseExactWardNumberSearch("WARD NO. 1"), 1);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড নং ১"), 1);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড-৯"), 9);
  assert.equal(parseExactWardNumberSearch("1 ward"), 1);
  assert.equal(parseExactWardNumberSearch("১ নম্বর ওয়ার্ড"), 1);
  assert.equal(parseExactWardNumberSearch("ward"), null);
  assert.equal(parseExactWardNumberSearch(""), null);
});

test("ward-prefix queries use the exact-number dataset instead of loading all wards", () => {
  assert.match(searchPage, /parseExactWardNumberSearch\(query\)/);
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
