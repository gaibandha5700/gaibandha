import test from "node:test";
import assert from "node:assert/strict";
import { parseDirectoryAreaFilter, validateDirectoryAreaSelection, validateDirectoryWardSelection } from "../src/lib/directory-area-filter.mjs";

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

const unionArea = "union:" + id;
const municipalityArea = "municipality:" + id;

test("area context rejects a valid UUID outside the selected upazila options", () => {
  assert.deepEqual(validateDirectoryAreaSelection(unionArea, parseDirectoryAreaFilter(unionArea), [municipalityArea]), { valid: false, value: "", parsed: null });
});

test("area context accepts a matching available union or municipality", () => {
  assert.deepEqual(validateDirectoryAreaSelection(unionArea, parseDirectoryAreaFilter(unionArea), [unionArea]), { valid: true, value: unionArea, parsed: { type: "union", id } });
});

test("invalid ward context is ignored when no area is selected", () => {
  assert.deepEqual(validateDirectoryWardSelection(id, "", [id]), { valid: false, value: "" });
});

test("ward context only accepts a ward in the currently selected area", () => {
  assert.deepEqual(validateDirectoryWardSelection(id, unionArea, [id]), { valid: true, value: id });
  assert.deepEqual(validateDirectoryWardSelection("another-ward", unionArea, [id]), { valid: false, value: "" });
});
