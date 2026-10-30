import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SETTINGS_NAV,
  getSettingsNavGroups,
  getSettingsSection,
  isSettingsNavActive,
  isSettingsOverview,
} from "./nav";

test("getSettingsNavGroups returns ordered groups with expected items", () => {
  const groups = getSettingsNavGroups().map((g) => [
    g.id,
    g.items.map((i) => i.href.split("/").at(-1)),
  ]);
  assert.deepEqual(groups, [
    ["account", ["account", "security"]],
    ["learning", ["learning", "notifications"]],
    ["app", ["appearance"]],
    ["plan", ["billing", "referrals"]],
  ]);
});

test("every nav item belongs to exactly one group", () => {
  const hrefs = getSettingsNavGroups().flatMap((g) => g.items.map((i) => i.href));
  assert.equal(hrefs.length, SETTINGS_NAV.length);
  assert.equal(new Set(hrefs).size, SETTINGS_NAV.length);
});

test("isSettingsOverview matches only /settings", () => {
  assert.equal(isSettingsOverview("/settings"), true);
  assert.equal(isSettingsOverview("/settings/"), true);
  assert.equal(isSettingsOverview("/settings/appearance"), false);
});

test("getSettingsSection is undefined on overview and resolves sections", () => {
  assert.equal(getSettingsSection("/settings"), undefined);
  assert.equal(getSettingsSection("/settings/appearance")?.group, "app");
  assert.equal(getSettingsSection("/settings/billing/history")?.group, "plan");
});

test("appearance is no longer active on /settings", () => {
  const appearance = SETTINGS_NAV.find((i) => i.href === "/settings/appearance")!;
  assert.equal(isSettingsNavActive("/settings", appearance), false);
  assert.equal(isSettingsNavActive("/settings/appearance", appearance), true);
});
