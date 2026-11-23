import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const component = await readFile(new URL("../src/components/submission-form.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/api/submissions/route.ts", import.meta.url), "utf8");

test("submission honeypot is present in markup but excluded from user focus and accessibility tree", () => {
  assert.match(component, /<label className="sr-only" aria-hidden="true">ওয়েবসাইট/);
  assert.match(component, /name="website"/);
  assert.match(component, /tabIndex={-1}/);
  assert.match(component, /autoComplete="off"/);
  assert.match(component, /website,\s*$/m);
  assert.doesNotMatch(component, /<label className="hidden" aria-hidden="true">ওয়েবসাইট/);
});

test("filled honeypot is silently accepted before any Supabase persistence attempt", () => {
  const honeypotGuard = route.indexOf("if (clean(body.website, 200)) return NextResponse.json({ ok: true });");
  const persistenceConfig = route.indexOf("const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;");
  assert.ok(honeypotGuard >= 0, "honeypot guard should be present");
  assert.ok(persistenceConfig > honeypotGuard, "the honeypot must return before persistence configuration");
  assert.match(route, /if \(clean\(body\.website, 200\)\) return NextResponse\.json\(\{ ok: true \}\);/);
});
