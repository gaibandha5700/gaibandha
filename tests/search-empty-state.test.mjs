import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const searchPage = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");

test("search no-results guidance has a labelled section and clear heading", () => {
  assert.match(searchPage, /query && resultCount === 0/);
  assert.match(searchPage, /aria-labelledby="search-empty-title"/);
  assert.match(searchPage, /id="search-empty-title"/);
  assert.match(searchPage, /কোনো ফলাফল পাওয়া যায়নি/);
});

test("search no-results guidance offers area, directory and submission recovery links", () => {
  for (const path of ["/upazila", "/municipality", "/directory", "/submit"]) {
    assert.ok(searchPage.includes(`href="${path}"`), `missing recovery link: ${path}`);
  }
  assert.match(searchPage, /বাংলা ও ইংরেজি নাম/);
  assert.match(searchPage, /প্রকাশের আগে তথ্য যাচাই করা হবে/);
});
