import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fallback = await readFile(new URL("../src/components/shared/error-fallback.tsx", import.meta.url), "utf8");
const routeBoundary = await readFile(new URL("../src/app/error.tsx", import.meta.url), "utf8");
const globalBoundary = await readFile(new URL("../src/app/global-error.tsx", import.meta.url), "utf8");

test("shared fallback provides an accessible, non-technical recovery message", () => {
  assert.match(fallback, /role="alert"/);
  assert.match(fallback, /aria-labelledby/);
  assert.match(fallback, /আবার চেষ্টা করুন/);
  assert.match(fallback, /হোমে ফিরুন/);
  assert.doesNotMatch(fallback, /error\.message/);
});

test("route and root-layout error boundaries reuse the recovery UI", () => {
  assert.match(routeBoundary, /ErrorFallback/);
  assert.match(routeBoundary, /reset/);
  assert.match(globalBoundary, /ErrorFallback/);
  assert.match(globalBoundary, /<html lang="bn">/);
  assert.match(globalBoundary, /globals\.css/);
});
