import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { summarizePublicSourceCoverage } from "../src/lib/source-coverage.mjs";

const directorySource = readFileSync(new URL("../src/lib/directory.ts", import.meta.url), "utf8");
const sourcesPage = readFileSync(new URL("../src/app/sources/page.tsx", import.meta.url), "utf8");

 test("source coverage summarizes census levels, source links, dates and directory categories", () => {
  const census = [
    { district_id: "d", source_url: "https://source.test/d", source_checked_at: "2026-11-15T00:00:00Z" },
    { upazila_id: "u", source_url: "https://source.test/u", source_checked_at: "2026-11-16T00:00:00Z" },
    { union_id: "un", source_url: "https://source.test/un", source_checked_at: "2026-11-15T12:00:00Z" },
    { municipality_id: "m", source_url: "https://source.test/m", source_checked_at: "2026-11-15T00:00:00Z" },
    { ward_id: "w", municipality_id: "m", source_url: "https://source.test/w", source_checked_at: "2026-11-15T00:00:00Z" },
    { ward_id: "uw", union_id: "un", source_url: null, source_checked_at: null },
  ];
  const directory = [
    { category: "education", source_url: "https://source.test/e", source_checked_at: "2026-11-15T00:00:00Z" },
    { category: "health", source_url: "https://source.test/h", source_checked_at: "2026-11-14T00:00:00Z" },
    { category: "health", source_url: null, source_checked_at: null },
  ];
  const summary = summarizePublicSourceCoverage(census, directory);
  assert.equal(summary.census.total, 6);
  assert.equal(summary.census.sourceUrlCount, 5);
  assert.equal(summary.census.checkedCount, 5);
  assert.deepEqual(summary.census.levels, { district: 1, upazila: 1, union: 1, municipality: 1, municipal_ward: 1, union_ward: 1, other: 0 });
  assert.equal(summary.census.latestCheckedAt, "2026-11-16T00:00:00Z");
  assert.equal(summary.directory.total, 3);
  assert.equal(summary.directory.sourceUrlCount, 2);
  assert.equal(summary.directory.checkedCount, 2);
  assert.deepEqual(summary.directory.categories, { education: 1, health: 2 });
});

test("source coverage does not count invalid timestamps or blank URLs", () => {
  const summary = summarizePublicSourceCoverage(
    [{ district_id: "d", source_url: "  ", source_checked_at: "invalid" }],
    [{ category: "education", source_url: "https://source.test", source_checked_at: "invalid" }],
  );
  assert.equal(summary.census.sourceUrlCount, 0);
  assert.equal(summary.census.checkedCount, 0);
  assert.equal(summary.census.latestCheckedAt, null);
  assert.equal(summary.directory.sourceUrlCount, 1);
  assert.equal(summary.directory.checkedCount, 0);
  assert.equal(summary.directory.latestCheckedAt, null);
});

test("public source metadata helpers select only metadata and preserve publication filters and pagination", () => {
  const censusStart = directorySource.indexOf("export async function getAllPublicCensusSourceRecords");
  const directoryStart = directorySource.indexOf("export async function getAllPublicDirectorySourceRecords");
  assert.notEqual(censusStart, -1);
  assert.notEqual(directoryStart, -1);
  const censusHelper = directorySource.slice(censusStart, directoryStart);
  const directoryHelper = directorySource.slice(directoryStart);
  assert.match(censusHelper, /census_statistics\?select=id,district_id,upazila_id,union_id,municipality_id,ward_id,source_url,source_checked_at/);
  assert.match(censusHelper, /is_published=eq\.true&is_verified=eq\.true/);
  assert.match(censusHelper, /limit=\$\{pageSize\}&offset=\$\{offset\}/);
  assert.match(directoryHelper, /directory_entries\?select=id,category,source_url,source_checked_at/);
  assert.match(directoryHelper, /is_published=eq\.true&is_verified=eq\.true/);
  assert.match(directoryHelper, /limit=\$\{pageSize\}&offset=\$\{offset\}/);
  assert.doesNotMatch(censusHelper + directoryHelper, /phone|email|submitter|contact/i);
});

test("source page gracefully separates unavailable snapshots from empty datasets", () => {
  assert.match(sourcesPage, /Promise\.allSettled/);
  assert.match(sourcesPage, /coverage তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না/);
  assert.match(sourcesPage, /সর্বশেষ উৎস যাচাই/);
});
