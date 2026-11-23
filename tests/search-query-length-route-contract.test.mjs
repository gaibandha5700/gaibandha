import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");

test("search page guards long queries before its data-fetch condition", () => {
  assert.match(page, /isSearchQueryTooLong\(q\)/);
  assert.match(page, /const query = tooLong \? "" : normalizeSearchText\(q\)/);
  assert.ok(page.indexOf("const tooLong =") < page.indexOf("if (query)"));
});

test("search input is bounded and long queries announce a Bengali error", () => {
  assert.match(page, /maxLength=\{MAX_SEARCH_QUERY_LENGTH\}/);
  assert.match(page, /defaultValue=\{truncateSearchQuery\(q\)\}/);
  assert.match(page, /tooLong \? <p role="alert"/);
});
