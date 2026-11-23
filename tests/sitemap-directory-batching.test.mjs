import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sitemap = await readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
const directory = await readFile(new URL("../src/lib/directory.ts", import.meta.url), "utf8");

test("sitemap uses one paginated directory helper instead of per-category database reads", () => {
  assert.match(sitemap, /getAllDirectoryEntries\(\)/);
  assert.match(sitemap, /const directoryEntries = await getAllDirectoryEntries\(\)/);
  assert.doesNotMatch(sitemap, /getDirectoryEntries\(/);
  assert.match(directory, /export async function getAllDirectoryEntries\(\): Promise<DirectoryEntry\[]>/);
  assert.match(directory, /getDirectoryEntries\(\{ limit: pageSize, offset \}/);
  assert.match(directory, /if \(page\.length < pageSize\) return rows/);
});

test("sitemap groups directory details and category indexes from the batch result", () => {
  assert.match(sitemap, /directoryEntriesByCategory/);
  assert.match(sitemap, /directoryEntriesByCategory\.get\(item\.category\)/);
  assert.match(sitemap, /directoryEntriesByCategory\.get\(category\.slug\)/);
  assert.match(sitemap, /latestUpdatedAt\(items\)/);
  assert.match(sitemap, /latestUpdatedAt\(directoryEntries\)/);
  assert.match(sitemap, /if \(items\.length > 0\)/);
  assert.match(sitemap, /new URL\(\`\/directory\/\$\{category\.slug\}\/\$\{item\.slug\}\`, siteUrl\)/);
  assert.doesNotMatch(sitemap, /getDirectoryEntries\(\s*\{\s*category:/);
});
