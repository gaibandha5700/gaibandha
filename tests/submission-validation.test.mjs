import test from "node:test";
import assert from "node:assert/strict";
import { validateSubmissionText } from "../src/lib/submission-validation.mjs";

test("trims whitespace and returns database-aligned effective lengths", () => {
  const result = validateSubmissionText("  স্কুল  ", "  একটি যাচাইযোগ্য তথ্য বিবরণ  ");
  assert.equal(result.normalizedItemName, "স্কুল");
  assert.equal(result.normalizedMessage, "একটি যাচাইযোগ্য তথ্য বিবরণ");
  assert.equal(result.itemNameLength, 4);
  assert.equal(result.messageLength, result.normalizedMessage.length);
  assert.equal(result.itemNameValid, true);
  assert.equal(result.messageValid, true);
});

test("rejects item names shorter than two trimmed characters", () => {
  assert.equal(validateSubmissionText(" ", "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameValid, false);
  assert.equal(validateSubmissionText("x", "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameValid, false);
  assert.equal(validateSubmissionText("  ", "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameLength, 0);
});

test("accepts item-name length boundaries after trimming", () => {
  assert.equal(validateSubmissionText("ab", "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameValid, true);
  assert.equal(validateSubmissionText("x".repeat(180), "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameValid, true);
  assert.equal(validateSubmissionText("x".repeat(181), "কমপক্ষে দশ অক্ষরের বিবরণ").itemNameValid, false);
});

test("rejects details shorter than ten trimmed characters", () => {
  assert.equal(validateSubmissionText("সঠিক নাম", " ৯ অক্ষর ").messageValid, false);
  assert.equal(validateSubmissionText("সঠিক নাম", "         ").messageLength, 0);
});

test("accepts detail length boundaries after trimming", () => {
  assert.equal(validateSubmissionText("সঠিক নাম", "1234567890").messageValid, true);
  assert.equal(validateSubmissionText("সঠিক নাম", "x".repeat(3000)).messageValid, true);
  assert.equal(validateSubmissionText("সঠিক নাম", "x".repeat(3001)).messageValid, false);
});
