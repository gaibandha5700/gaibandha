import test from "node:test";
import assert from "node:assert/strict";
import { latestUpdatedAt, dateFromTimestamp } from "../src/lib/sitemap-lastmod.mjs";

test("returns the latest valid update timestamp", () => {
  const records = [
    { updated_at: "2026-01-01T00:00:00Z" },
    { updated_at: "2026-03-15T10:30:00+06:00" },
    { updated_at: "invalid" },
    { updated_at: null },
  ];
  assert.equal(latestUpdatedAt(records), "2026-03-15T04:30:00.000Z");
});

test("returns null when no valid timestamps exist", () => {
  assert.equal(latestUpdatedAt([]), null);
  assert.equal(latestUpdatedAt([{ updated_at: null }, { updated_at: "not-a-date" }]), null);
});

test("converts valid sitemap timestamps to Date values", () => {
  assert.equal(dateFromTimestamp("2026-03-15T04:30:00.000Z")?.toISOString(), "2026-03-15T04:30:00.000Z");
});

test("omits empty and invalid timestamps", () => {
  assert.equal(dateFromTimestamp(null), undefined);
  assert.equal(dateFromTimestamp(undefined), undefined);
  assert.equal(dateFromTimestamp(" "), undefined);
  assert.equal(dateFromTimestamp("not-a-date"), undefined);
});

test("does not mutate the input records", () => {
  const records = [{ updated_at: "2026-02-01T00:00:00Z" }, { updated_at: "2026-01-01T00:00:00Z" }];
  const original = structuredClone(records);
  latestUpdatedAt(records);
  assert.deepEqual(records, original);
});
