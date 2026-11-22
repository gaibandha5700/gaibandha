import test from "node:test";
import assert from "node:assert/strict";
import { isNavigationItemActive } from "../src/lib/navigation-active.mjs";

test("home is active only on the root route", () => {
  assert.equal(isNavigationItemActive("/", "/"), true);
  assert.equal(isNavigationItemActive("/district", "/"), false);
});

test("exact section routes are active", () => {
  assert.equal(isNavigationItemActive("/map", "/map"), true);
  assert.equal(isNavigationItemActive("/statistics", "/statistics"), true);
});

test("parent navigation remains active on nested routes", () => {
  assert.equal(isNavigationItemActive("/directory/health", "/directory"), true);
  assert.equal(isNavigationItemActive("/upazila/sadar/union", "/upazila"), true);
});

test("path matching respects segment boundaries", () => {
  assert.equal(isNavigationItemActive("/directory-health", "/directory"), false);
  assert.equal(isNavigationItemActive("/searching", "/search"), false);
});

test("trailing slashes are normalized", () => {
  assert.equal(isNavigationItemActive("/directory/health/", "/directory"), true);
  assert.equal(isNavigationItemActive("/statistics/", "/statistics"), true);
});

test("empty or invalid route inputs are inactive", () => {
  assert.equal(isNavigationItemActive("", "/search"), false);
  assert.equal(isNavigationItemActive("/search", ""), false);
});
