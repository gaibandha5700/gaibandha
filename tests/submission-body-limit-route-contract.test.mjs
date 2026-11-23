import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");

test("submission API enforces the streaming body ceiling and returns 413", () => {
  assert.match(source, /MAX_SUBMISSION_BODY_BYTES = 32 \* 1024/);
  assert.match(source, /readLimitedJsonObject\(request, MAX_SUBMISSION_BODY_BYTES\)/);
  assert.match(source, /status: tooLarge \? 413 : 400/);
});
