import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const searchPage = await readFile(new URL("../src/app/search/page.tsx", import.meta.url), "utf8");

test("search landing initializes data collections empty", () => {
  for (const declaration of [
    /let entries: Awaited<ReturnType<typeof getAllDirectoryEntries>> = \[\]/,
    /let upazilas: Awaited<ReturnType<typeof getUpazilas>> = \[\]/,
    /let wardRows: Awaited<ReturnType<typeof getAllPublicWards>> = \[\]/,
    /let unionRows: Awaited<ReturnType<typeof getAllPublicUnions>> = \[\]/,
    /let municipalityRows: Awaited<ReturnType<typeof getAllPublicMunicipalities>> = \[\]/,
  ]) assert.match(searchPage, declaration);
});

test("search-page database reads run only inside the non-empty query guard", () => {
  const guard = searchPage.match(/if \(query\) \{([\s\S]*?)\n  \}/);
  assert.ok(guard, "missing query guard");
  assert.match(guard[1], /Promise\.all/);
  for (const functionName of [
    "getAllDirectoryEntries",
    "getUpazilas",
    "getAllPublicWards",
    "getAllPublicUnions",
    "getAllPublicMunicipalities",
  ]) assert.match(guard[1], new RegExp(functionName));
});
