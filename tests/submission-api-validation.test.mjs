import test from "node:test";
import assert from "node:assert/strict";
import { validateSubmissionTextForApi } from "../src/lib/submission-api-validation.mjs";

test("normalizes whitespace and counts Unicode code points", () => {
  const result = validateSubmissionTextForApi("  স্থান 😀  ", "  যাচাইযোগ্য বিবরণ এখানে  ");
  assert.equal(result.normalizedItemName, "স্থান 😀");
  assert.equal(result.normalizedMessage, "যাচাইযোগ্য বিবরণ এখানে");
  assert.equal(result.itemNameLength, Array.from("স্থান 😀").length);
  assert.equal(result.messageLength, Array.from("যাচাইযোগ্য বিবরণ এখানে").length);
  assert.equal(result.itemNameValid, true);
  assert.equal(result.messageValid, true);
});

test("rejects names below the minimum or above the maximum", () => {
  assert.equal(validateSubmissionTextForApi("x", "একটি বৈধ বিবরণ লিখুন").itemNameValid, false);
  assert.equal(validateSubmissionTextForApi("x".repeat(181), "একটি বৈধ বিবরণ লিখুন").itemNameValid, false);
  assert.equal(validateSubmissionTextForApi("😀".repeat(180), "একটি বৈধ বিবরণ লিখুন").itemNameValid, true);
  assert.equal(validateSubmissionTextForApi("😀".repeat(181), "একটি বৈধ বিবরণ লিখুন").itemNameValid, false);
});

test("rejects details below the minimum or above the maximum", () => {
  assert.equal(validateSubmissionTextForApi("সঠিক নাম", "123456789").messageValid, false);
  assert.equal(validateSubmissionTextForApi("সঠিক নাম", "x".repeat(3001)).messageValid, false);
  assert.equal(validateSubmissionTextForApi("সঠিক নাম", "😀".repeat(3000)).messageValid, true);
  assert.equal(validateSubmissionTextForApi("সঠিক নাম", "😀".repeat(3001)).messageValid, false);
});

test("non-string inputs normalize to empty text and fail validation", () => {
  const result = validateSubmissionTextForApi(null, { unexpected: true });
  assert.equal(result.normalizedItemName, "");
  assert.equal(result.normalizedMessage, "");
  assert.equal(result.itemNameValid, false);
  assert.equal(result.messageValid, false);
});
