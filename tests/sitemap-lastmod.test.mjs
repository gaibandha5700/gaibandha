import test from "node:test";
import assert from "node:assert/strict";
import { latestUpdatedAt } from "../src/lib/sitemap-lastmod.mjs";

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

test("does not mutate the input records", () => {
  const records = [{ updated_at: "2026-02-01T00:00:00Z" }, { updated_at: "2026-01-01T00:00:00Z" }];
  const original = structuredClone(records);
  latestUpdatedAt(records);
  assert.deepEqual(records, original);
});
