import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/administrative-map.tsx", import.meta.url), "utf8");

test("map layer and zoom controls have accessible labels", () => {
  assert.ok(source.includes("<span>মানচিত্রের স্তর</span>"));
  assert.ok(source.includes('aria-label="মানচিত্র জুম"'));
  assert.ok(source.includes('aria-label="জুম কমান"'));
  assert.ok(source.includes('aria-label="জুম বাড়ান"'));
  assert.ok(source.includes('aria-label="পূর্ণ মানচিত্রে ফিরুন"'));
});

test("map SVG describes the map interaction and exposes a group", () => {
  assert.ok(source.includes('role="group"'));
  assert.ok(source.includes("প্রকাশিত প্রশাসনিক সীমানার মানচিত্র। জুম করার পর টেনে সরানো যায়; এলাকা নির্বাচন করতে ক্লিক বা কীবোর্ড ব্যবহার করুন।"));
});

test("boundary paths are keyboard-operable pressed buttons", () => {
  assert.ok(source.includes('role="button"'));
  assert.ok(source.includes("tabIndex={0}"));
  assert.ok(source.includes("aria-pressed={selected?.id === feature.id}"));
  assert.ok(source.includes('if (e.key === "Enter" || e.key === " ")'));
  assert.ok(source.includes("setSelectedId(feature.id)"));
});

test("arrow keys pan only when zoomed and the instructions explain the gesture", () => {
  assert.ok(source.includes('else if (zoom > 1 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))'));
  assert.ok(source.includes("panBy("));
  assert.ok(source.includes("১×-এর বেশি জুমে মানচিত্র টেনে বা নির্বাচিত এলাকার ওপর কীবোর্ডের তীর দিয়ে সরানো যাবে"));
});

test("selection status and the alternative area list remain available", () => {
  assert.ok(source.includes('aria-live="polite"'));
  assert.ok(source.includes('aria-atomic="true"'));
  assert.ok(source.includes("<details className="border-t border-[#d8dfd3] pt-4">"));
  assert.ok(source.includes("মানচিত্রের বিকল্প তালিকা"));
  assert.ok(source.includes("setSelectedId(f.id)"));
});
