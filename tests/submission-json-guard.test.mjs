import test from "node:test";
import assert from "node:assert/strict";
import { isJsonObject } from "../src/lib/submission-json-guard.mjs";

test("accepts JSON object payloads", () => {
  assert.equal(isJsonObject({}), true);
  assert.equal(isJsonObject({ submission_type: "new_entry" }), true);
});

test("rejects JSON values that are not object records", () => {
  for (const value of [null, [], "text", 42, true]) {
    assert.equal(isJsonObject(value), false);
  }
});
