import test from "node:test";
import assert from "node:assert/strict";
import { validateSubmissionText } from "../src/lib/submission-validation.mjs";

test("normalizes trimmed strings and counts code points", () => {
  const result = validateSubmissionText("  স্কুল  ", "  একটি যাচাইযোগ্য তথ্য বিবরণ  ");
  assert.equal(result.normalizedItemName, "স্কুল");
  assert.equal(result.normalizedMessage, "একটি যাচাইযোগ্য তথ্য বিবরণ");
  assert.equal(result.itemNameLength, Array.from(result.normalizedItemName).length);
  assert.equal(result.messageLength, Array.from(result.normalizedMessage).length);
  assert.equal(result.itemNameValid, true);
  assert.equal(result.messageValid, true);
});

test("enforces name boundaries from 2 to 180 code points", () => {
  assert.equal(validateSubmissionText("x", "একটি বৈধ বিবরণ লিখুন").itemNameValid, false);
  assert.equal(validateSubmissionText("x".repeat(2), "একটি বৈধ বিবরণ লিখুন").itemNameValid, true);
  assert.equal(validateSubmissionText("x".repeat(180), "একটি বৈধ বিবরণ লিখুন").itemNameValid, true);
  assert.equal(validateSubmissionText("x".repeat(181), "একটি বৈধ বিবরণ লিখুন").itemNameValid, false);
});

test("enforces detail boundaries from 10 to 3000 code points", () => {
  assert.equal(validateSubmissionText("সঠিক নাম", "123456789").messageValid, false);
  assert.equal(validateSubmissionText("সঠিক নাম", "1234567890").messageValid, true);
  assert.equal(validateSubmissionText("সঠিক নাম", "x".repeat(3000)).messageValid, true);
  assert.equal(validateSubmissionText("সঠিক নাম", "x".repeat(3001)).messageValid, false);
});

test("normalizes non-string inputs to empty text and rejects them", () => {
  const result = validateSubmissionText(null, { unexpected: true });
  assert.equal(result.normalizedItemName, "");
  assert.equal(result.normalizedMessage, "");
  assert.equal(result.itemNameValid, false);
  assert.equal(result.messageValid, false);
});

test("supplementary Unicode characters count as one code point", () => {
  const result = validateSubmissionText("😀😀", "😀".repeat(10));
  assert.equal(result.itemNameLength, 2);
  assert.equal(result.messageLength, 10);
  assert.equal(result.messageValid, true);
  assert.equal(validateSubmissionText("😀".repeat(180), "😀".repeat(10)).itemNameValid, true);
  assert.equal(validateSubmissionText("😀".repeat(181), "😀".repeat(10)).itemNameValid, false);
});
