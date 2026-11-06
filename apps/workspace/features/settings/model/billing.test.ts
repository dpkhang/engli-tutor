import assert from "node:assert/strict";
import { test } from "node:test";
import { billingHistory, resolveBillingSummary } from "./billing";
import type { BillingMe } from "@/features/payments/api/billing";

const limits = { tutorChatPerDay: null, ttsPerDay: null, enforcement: "throttle", proScenarios: true } as const;

function me(overrides: {
  subscription?: Partial<BillingMe["subscription"]>;
  entitlements?: Partial<BillingMe["entitlements"]>;
  hasPaidPlan?: boolean;
}): BillingMe {
  return {
    subscription: {
      planId: "free",
      status: "",
      billingPeriod: null,
      currentPeriodEnd: null,
      isPaid: false,
      ...overrides.subscription,
    },
    hasPaidPlan: overrides.hasPaidPlan ?? false,
    entitlements: {
      planId: "starter",
      source: "free",
      limits,
      proUntil: null,
      trialAvailable: true,
      ...overrides.entitlements,
    },
    usage: { tutor_chat: 0, tts: 0, ai_translate: 0, game_session: 0, vocab_review: 0 },
    trialDays: 7,
    subscriptionPlans: [
      { id: "starter", name: "Free" },
      { id: "premium", name: "Premium" },
    ] as BillingMe["subscriptionPlans"],
    stripeConfigured: true,
  };
}

const active = {
  hasPaidPlan: true,
  subscription: {
    planId: "premium",
    status: "active",
    billingPeriod: "monthly" as const,
    currentPeriodEnd: "2026-12-01T00:00:00.000Z",
    isPaid: true,
  },
  entitlements: { planId: "premium", source: "subscription" as const },
};

test("undefined data yields no summary and no history", () => {
  assert.equal(resolveBillingSummary(undefined), null);
  assert.deepEqual(billingHistory(undefined), []);
});

test("free account: no expiry, can upgrade, empty history", () => {
  const data = me({});
  const summary = resolveBillingSummary(data);
  assert.equal(summary?.planName, "Free");
  assert.equal(summary?.isPremium, false);
  assert.equal(summary?.expiry, null);
  assert.equal(summary?.canUpgrade, true);
  assert.deepEqual(billingHistory(data), []);
});

test("active subscription renews and cannot upgrade", () => {
  const data = me(active);
  const summary = resolveBillingSummary(data);
  assert.equal(summary?.planName, "Premium");
  assert.equal(summary?.status, "active");
  assert.equal(summary?.period, "monthly");
  assert.deepEqual(summary?.expiry, { date: "2026-12-01T00:00:00.000Z", kind: "renews" });
  assert.equal(summary?.canUpgrade, false);
  const history = billingHistory(data);
  assert.equal(history.length, 1);
  assert.equal(history[0].kind, "subscription");
  assert.equal(history[0].dateKind, "renews");
});

test("canceled subscription ends", () => {
  const data = me({ ...active, subscription: { ...active.subscription, status: "canceled" } });
  assert.equal(resolveBillingSummary(data)?.expiry?.kind, "ends");
  assert.equal(billingHistory(data)[0].dateKind, "ends");
});

test("trial ends at proUntil and can upgrade", () => {
  const data = me({ entitlements: { planId: "premium", source: "trial", proUntil: "2026-11-05T00:00:00.000Z" } });
  const summary = resolveBillingSummary(data);
  assert.equal(summary?.isPremium, true);
  assert.equal(summary?.status, null);
  assert.deepEqual(summary?.expiry, { date: "2026-11-05T00:00:00.000Z", kind: "ends" });
  assert.equal(summary?.canUpgrade, true);
  const history = billingHistory(data);
  assert.deepEqual(history.map((entry) => entry.kind), ["trial"]);
});

test("bonus ends at proUntil", () => {
  const data = me({ entitlements: { planId: "premium", source: "bonus", proUntil: "2026-11-20T00:00:00.000Z" } });
  assert.equal(resolveBillingSummary(data)?.expiry?.kind, "ends");
  assert.deepEqual(billingHistory(data).map((entry) => entry.kind), ["bonus"]);
});
