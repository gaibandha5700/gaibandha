import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/statistics-comparison.tsx", import.meta.url), "utf8");

test("comparison chart exposes a keyboard-scroll region with linked guidance", () => {
  assert.match(source, /role="region"/);
  assert.match(source, /aria-label="উপজেলা তুলনা বার চার্ট; আড়াআড়ি স্ক্রল করে দেখুন"/);
  assert.ok(source.includes("tabIndex={0}"));
  assert.match(source, /aria-describedby="upazila-chart-scroll-help"/);
  assert.match(source, /id="upazila-chart-scroll-help"/);
  assert.match(source, /কিবোর্ড ফোকাস নিয়ে আড়াআড়ি স্ক্রল করতে তীরচিহ্নের কী ব্যবহার করুন/);
});

test("chart keeps a native disclosure with an accessible data-table alternative", () => {
  assert.match(source, /<details className="mt-3 rounded-xl border bg-white">/);
  assert.match(source, /<caption className="sr-only">/);
  assert.match(source, /scope="row"/);
});
