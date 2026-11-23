import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const form = await readFile(new URL("../src/components/submission-form.tsx", import.meta.url), "utf8");

test("submission form handles WAF 429 before parsing response JSON", () => {
  const rateLimit = form.indexOf("if (response.status === 429)");
  const jsonParse = form.indexOf("const result = await response.json();");
  assert.ok(rateLimit >= 0);
  assert.ok(jsonParse > rateLimit);
  assert.match(form, /অল্প সময়ে অনেকবার তথ্য জমা দেওয়ার চেষ্টা হয়েছে/);
  assert.match(form, /role=\{status\.ok \? "status" : "alert"\}/);
});
