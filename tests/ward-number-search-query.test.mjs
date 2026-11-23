import test from "node:test";
import assert from "node:assert/strict";
import { parseExactWardNumberSearch } from "../src/lib/ward-number-search.mjs";

test("parses exact numeric ward queries", () => {
  assert.equal(parseExactWardNumberSearch("3"), 3);
  assert.equal(parseExactWardNumberSearch("০৩"), 3);
  assert.equal(parseExactWardNumberSearch("009"), 9);
});

test("parses common English and Bengali ward prefixes", () => {
  assert.equal(parseExactWardNumberSearch("ward 3"), 3);
  assert.equal(parseExactWardNumberSearch("Ward No. 3"), 3);
  assert.equal(parseExactWardNumberSearch("ward number 3"), 3);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড ৩"), 3);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড নং ৩"), 3);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড-৩"), 3);
  assert.equal(parseExactWardNumberSearch("ওয়ার্ড ৩ নম্বর"), 3);
});

test("parses reverse-order ward queries in Bengali and English", () => {
  assert.equal(parseExactWardNumberSearch("3 ward"), 3);
  assert.equal(parseExactWardNumberSearch("3 number ward"), 3);
  assert.equal(parseExactWardNumberSearch("3 no. ward"), 3);
  assert.equal(parseExactWardNumberSearch("৩ নং ওয়ার্ড"), 3);
  assert.equal(parseExactWardNumberSearch("৩ নম্বর ওয়ার্ড"), 3);
  assert.equal(parseExactWardNumberSearch("9 নম্বর ওয়ার্ড"), 9);
});

test("does not treat non-exact or empty text as an exact ward query", () => {
  assert.equal(parseExactWardNumberSearch("3 ward"), null);
  assert.equal(parseExactWardNumberSearch("ward"), null);
  assert.equal(parseExactWardNumberSearch("ward 3 east"), null);
  assert.equal(parseExactWardNumberSearch(""), null);
});
