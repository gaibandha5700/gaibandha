import test from "node:test";
import assert from "node:assert/strict";
import { readLimitedJsonObject } from "../src/lib/submission-body-limit.mjs";

const makeRequest = (body, headers = {}) => new Request("https://example.test/api/submissions", { method: "POST", body, headers });

test("accepts an object within the byte limit and preserves Bengali text", async () => {
  const payload = JSON.stringify({ item_name: "গাইবান্ধা", message: "যাচাইযোগ্য তথ্য" });
  const result = await readLimitedJsonObject(makeRequest(payload), new TextEncoder().encode(payload).byteLength);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.item_name, "গাইবান্ধা");
});

test("rejects declared content length above the limit before reading", async () => {
  const result = await readLimitedJsonObject(makeRequest("{}", { "content-length": "100" }), 10);
  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("rejects streamed body bytes above the limit", async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode("{\\"a\\":\\"long\\"}")); controller.close(); } });
  const request = new Request("https://example.test/api/submissions", { method: "POST", body: stream, duplex: "half" });
  const result = await readLimitedJsonObject(request, 5);
  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("rejects malformed JSON and non-object JSON", async () => {
  assert.deepEqual(await readLimitedJsonObject(makeRequest("{")), { ok: false, reason: "invalid" });
  assert.deepEqual(await readLimitedJsonObject(makeRequest("[]")), { ok: false, reason: "invalid" });
  assert.deepEqual(await readLimitedJsonObject(makeRequest("null")), { ok: false, reason: "invalid" });
});

test("rejects invalid length headers", async () => {
  assert.deepEqual(await readLimitedJsonObject(makeRequest("{}", { "content-length": "2.5" })), { ok: false, reason: "invalid" });
});
