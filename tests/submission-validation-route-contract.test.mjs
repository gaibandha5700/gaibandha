import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");
const parser = await readFile(new URL("../src/lib/submission-body-limit.mjs", import.meta.url), "utf8");

test("API uses the bounded JSON-object parser before accessing payload fields", () => {
  assert.match(route, /readLimitedJsonObject\(request, MAX_SUBMISSION_BODY_BYTES\)/);
  assert.match(parser, /isJsonObject\(parsed\)/);
  assert.match(parser, /totalBytes > maxBytes/);
  assert.match(route, /validateSubmissionText\(body\.item_name, body\.message\)/);
  assert.match(route, /!textValidation\.itemNameValid/);
  assert.match(route, /!textValidation\.messageValid/);
  assert.doesNotMatch(route, /clean\(body\.item_name/);
  assert.doesNotMatch(route, /clean\(body\.message/);
});
