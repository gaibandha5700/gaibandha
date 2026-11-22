import test from "node:test";
import assert from "node:assert/strict";
import { parseDirectoryAreaFilter } from "../src/lib/directory-area-filter.mjs";

const id = "67e55c5e-36e7-4877-a555-9885dfd7e2f3";

test("empty area means no area filter", () => {
  assert.deepEqual(parseDirectoryAreaFilter(""), { type: "all", id: null });
});

test("union prefix extracts a canonical UUID", () => {
  assert.deepEqual(parseDirectoryAreaFilter("union:" + id), { type: "union", id });
});

test("municipality prefix uses the full 13-character prefix", () => {
  assert.deepEqual(parseDirectoryAreaFilter("municipality:" + id), { type: "municipality", id });
});

test("unknown prefixes are rejected", () => {
  assert.equal(parseDirectoryAreaFilter("district:" + id), null);
});

test("malformed UUIDs and extra suffixes are rejected", () => {
  assert.equal(parseDirectoryAreaFilter("union::" + id), null);
  assert.equal(parseDirectoryAreaFilter("municipality:" + id + ":extra"), null);
  assert.equal(parseDirectoryAreaFilter("union:not-a-uuid"), null);
});
