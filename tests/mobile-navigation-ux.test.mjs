import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const navigation = readFileSync(new URL("../src/components/primary-navigation.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const mobilePanel = [...styles.matchAll(/\.site-mobile-panel\s*\{[^}]*\}/g)].at(-1)?.[0] ?? "";

test("mobile navigation closes after route changes and link selection", () => {
  assert.match(navigation, /useEffect\(\(\) => \{\s*if \(mobileMenuRef\.current\) mobileMenuRef\.current\.open = false;\s*\}, \[pathname\]\);/);
  assert.match(navigation, /<details ref=\{mobileMenuRef\} className="site-mobile-nav">/);
  const mobileLinks = navigation.split('<nav className="site-mobile-panel" aria-label="মোবাইল নেভিগেশন">')[1] ?? "";
  assert.ok(mobileLinks.includes("onClick={closeMobileMenu}"), "mobile links should close the panel");
});

test("mobile menu panel is viewport-constrained and vertically scrollable", () => {
  assert.match(mobilePanel, /max-height:\s*min\(70vh,calc\(100vh\s*-\s*120px\)\);/);
  assert.match(mobilePanel, /overflow-y:\s*auto;/);
  assert.match(mobilePanel, /overscroll-behavior:\s*contain;/);
  assert.match(styles, /@supports \(height: 100dvh\) \{\s*\.site-mobile-panel \{\s*max-height: min\(70dvh, calc\(100dvh - 120px\)\);/);
});
