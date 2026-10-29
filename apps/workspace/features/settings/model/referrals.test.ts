import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeReferralCode, referralRewardStatus } from "./referrals";

test("normalizeReferralCode trims, uppercases and strips symbols", () => {
  assert.equal(normalizeReferralCode("  ab-12 cd "), "AB12CD");
  assert.equal(normalizeReferralCode(""), "");
});

test("referralRewardStatus reports earning while reward remains", () => {
  assert.deepEqual(referralRewardStatus({ referrerDays: 7, referrerMaxDays: 90 }), {
    kind: "earning",
    days: 7,
    maxDays: 90,
  });
});

test("referralRewardStatus reports limit when cap reached", () => {
  assert.deepEqual(referralRewardStatus({ referrerDays: 0, referrerMaxDays: 90 }), { kind: "limit", maxDays: 90 });
});
