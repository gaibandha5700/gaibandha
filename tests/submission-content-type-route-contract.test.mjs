import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");

test("submission API rejects non-JSON requests before reading the body", () => {
  const guard = route.indexOf("if (!isJsonContentType(request.headers.get(\"content-type\"))");
  const parser = route.indexOf("readLimitedJsonObject(request, MAX_SUBMISSION_BODY_BYTES)");
  assert.ok(guard >= 0);
  assert.ok(parser > guard);
  assert.match(route, /status: 415/);
  assert.match(route, /সঠিক JSON format-এ তথ্য পাঠানো হয়নি/);
});
