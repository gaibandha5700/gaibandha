import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fetchWithTransientRetry } from "../src/lib/fetch-retry.mjs";

const response = (status, headers = {}) => new Response("upstream", { status, headers });

test("retries transient upstream statuses with bounded exponential backoff", async () => {
  const statuses = [502, 503, 200];
  const waits = [];
  let calls = 0;
  const result = await fetchWithTransientRetry("https://example.test", undefined, {
    fetchImpl: async () => response(statuses[calls++]),
    sleep: async (ms) => waits.push(ms),
  });
  assert.equal(result.status, 200);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test("respects numeric Retry-After while capping delay at two seconds", async () => {
  const waits = [];
  let calls = 0;
  const result = await fetchWithTransientRetry("https://example.test", undefined, {
    fetchImpl: async () => calls++ === 0 ? response(429, { "retry-after": "8" }) : response(200),
    sleep: async (ms) => waits.push(ms),
  });
  assert.equal(result.status, 200);
  assert.deepEqual(waits, [2000]);
});

test("retries a network error and then succeeds", async () => {
  const waits = [];
  let calls = 0;
  const result = await fetchWithTransientRetry("https://example.test", undefined, {
    fetchImpl: async () => {
      if (calls++ === 0) throw new Error("temporary network failure");
      return response(200);
    },
    sleep: async (ms) => waits.push(ms),
  });
  assert.equal(result.status, 200);
  assert.equal(calls, 2);
  assert.deepEqual(waits, [250]);
});

test("does not retry non-transient responses", async () => {
  const waits = [];
  let calls = 0;
  const result = await fetchWithTransientRetry("https://example.test", undefined, {
    fetchImpl: async () => { calls++; return response(400); },
    sleep: async (ms) => waits.push(ms),
  });
  assert.equal(result.status, 400);
  assert.equal(calls, 1);
  assert.deepEqual(waits, []);
});

test("stops after the configured retry count", async () => {
  const waits = [];
  let calls = 0;
  const result = await fetchWithTransientRetry("https://example.test", undefined, {
    maxRetries: 2,
    fetchImpl: async () => { calls++; return response(502); },
    sleep: async (ms) => waits.push(ms),
  });
  assert.equal(result.status, 502);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test("directory fetch uses the retry helper and preserves Next revalidation", async () => {
  const source = await readFile(new URL("../src/lib/directory.ts", import.meta.url), "utf8");
  assert.match(source, /fetchWithTransientRetry/);
  assert.match(source, /maxRetries:\s*2/);
  assert.match(source, /baseDelayMs:\s*250/);
  assert.match(source, /next:\s*\{\s*revalidate:\s*60\s*\}/);
});
