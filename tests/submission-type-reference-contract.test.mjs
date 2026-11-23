import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");

test("correction submissions require an existing-entry reference before persistence", () => {
  const guard = route.indexOf('if (submissionType === "correction" && !entryId)');
  const databaseWrite = route.indexOf("rest/v1/information_submissions");
  assert.ok(guard >= 0);
  assert.ok(databaseWrite > guard);
  assert.match(route, /সংশোধনের জন্য বর্তমান প্রতিষ্ঠানের রেফারেন্স প্রয়োজন/);
  assert.match(route, /status: 400/);
});

test("new-entry submissions reject an existing-entry reference", () => {
  const guard = route.indexOf('if (submissionType === "new_entry" && entryId)');
  const databaseWrite = route.indexOf("rest/v1/information_submissions");
  assert.ok(guard >= 0);
  assert.ok(databaseWrite > guard);
  assert.match(route, /নতুন তথ্যের সঙ্গে বিদ্যমান প্রতিষ্ঠানের রেফারেন্স দেওয়া যাবে না/);
});
