import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");

test("API preserves JSON-object guard before accessing payload fields", () => {
  assert.match(source, /isJsonObject\(parsed\)/);
  assert.match(source, /validateSubmissionText\(body\.item_name, body\.message\)/);
  assert.match(source, /!textValidation\.itemNameValid/);
  assert.match(source, /!textValidation\.messageValid/);
  assert.doesNotMatch(source, /clean\(body\.item_name/);
  assert.doesNotMatch(source, /clean\(body\.message/);
});
