import test from "node:test";
import assert from "node:assert/strict";
import { buildMetricHref, buildShareUrl, escapeCsvCell, buildStatisticsCsv } from "../src/lib/statistics-export.mjs";

test("metric URL updates preserve unrelated query values and hash", () => {
  assert.equal(buildMetricHref("https://example.test/statistics?ref=home&metric=female#table", "male"), "/statistics?ref=home&metric=male#table");
});

test("population uses the clean default URL while retaining other state", () => {
  assert.equal(buildMetricHref("https://example.test/statistics?metric=male&ref=home#chart", "population"), "/statistics?ref=home#chart");
});

test("share URLs are absolute and preserve the rest of the URL", () => {
  assert.equal(buildShareUrl("https://example.test/statistics?ref=home#chart", "households"), "https://example.test/statistics?ref=home&metric=households#chart");
});

test("CSV contains a BOM, Bengali headings, and provenance", () => {
  const csv = buildStatisticsCsv([{ name: "গাইবান্ধা সদর", population: 123, households: 45, male: 67, female: 56 }], "population", "জনসংখ্যা", "BBS", "https://example.test/source", "2026-11-22");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"উপজেলা","সূচক","মান"'));
  assert.ok(csv.includes('"BBS","https://example.test/source","2026-11-22"'));
});

test("CSV formula guard catches whitespace-prefixed text formulas", () => {
  assert.equal(escapeCsvCell("\t=1+1"), '"\'\t=1+1"');
  assert.equal(escapeCsvCell("\u00a0+CMD"), '"\'\u00a0+CMD"');
  assert.equal(escapeCsvCell(" @SUM(A1)"), '"\' @SUM(A1)"');
  assert.equal(escapeCsvCell("Gaibandha"), '"Gaibandha"');
});

test("CSV quoting escapes quotes, commas, and embedded line breaks", () => {
  assert.equal(escapeCsvCell('A,"B"\nC'), '"A,""B""\nC"');
});

test("numeric values remain numeric text without formula-prefixing", () => {
  assert.equal(escapeCsvCell(-123), '"-123"');
  assert.equal(escapeCsvCell(0), '"0"');
  assert.equal(escapeCsvCell(null), '""');
});
