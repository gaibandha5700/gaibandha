import test from "node:test";
import assert from "node:assert/strict";
import { MAX_SEARCH_QUERY_LENGTH, searchQueryLength, isSearchQueryTooLong, truncateSearchQuery } from "../src/lib/search-query-length.mjs";

test("search query length counts Unicode code points after trimming", () => {
  assert.equal(searchQueryLength("  গাইবান্ধা  "), 9);
  assert.equal(searchQueryLength("😀"), 1);
  assert.equal(searchQueryLength(123), 0);
});

test("120 code points are accepted and longer queries are rejected", () => {
  assert.equal(isSearchQueryTooLong("ক".repeat(MAX_SEARCH_QUERY_LENGTH)), false);
  assert.equal(isSearchQueryTooLong("ক".repeat(MAX_SEARCH_QUERY_LENGTH + 1)), true);
});

test("truncateSearchQuery preserves Unicode characters and caps the input", () => {
  const truncated = truncateSearchQuery("😀".repeat(MAX_SEARCH_QUERY_LENGTH + 2));
  assert.equal(Array.from(truncated).length, MAX_SEARCH_QUERY_LENGTH);
  assert.equal(truncated, "😀".repeat(MAX_SEARCH_QUERY_LENGTH));
});
