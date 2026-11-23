import test from "node:test";
import assert from "node:assert/strict";
import { isJsonContentType } from "../src/lib/submission-content-type.mjs";

test("accepts application/json with optional parameters and casing", () => {
  assert.equal(isJsonContentType("application/json"), true);
  assert.equal(isJsonContentType(" application/json ; charset=utf-8 "), true);
  assert.equal(isJsonContentType("APPLICATION/JSON; CHARSET=UTF-8"), true);
});

test("rejects absent, malformed and non-json media types", () => {
  for (const value of [null, undefined, "", "text/plain", "application/jsonp", "application/x-www-form-urlencoded", "application/problem+json"]) {
    assert.equal(isJsonContentType(value), false, String(value));
  }
});
