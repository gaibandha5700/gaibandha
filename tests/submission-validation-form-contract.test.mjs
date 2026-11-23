import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/submission-form.tsx", import.meta.url), "utf8");

test("submission form uses the shared validator and normalizes before POST", () => {
  assert.match(source, /validateSubmissionText\(name, message\)/);
  assert.match(source, /item_name: validation\.normalizedItemName/);
  assert.match(source, /message: validation\.normalizedMessage/);
  assert.match(source, /aria-invalid/);
  assert.match(source, /aria-describedby/);
  assert.match(source, /aria-pressed/);
});

test("text fields rely on code-point validation instead of UTF-16 maxlength", () => {
  assert.match(source, /id="submission-item-name"/);
  assert.match(source, /id="submission-message"/);
  assert.doesNotMatch(source, /id="submission-item-name"[^>]*maxLength/);
  assert.doesNotMatch(source, /id="submission-message"[^>]*maxLength/);
  assert.match(source, /নামটি ১৮০ অক্ষরের মধ্যে রাখুন/);
  assert.match(source, /বিবরণ ৩,০০০ অক্ষরের মধ্যে রাখুন/);
});
