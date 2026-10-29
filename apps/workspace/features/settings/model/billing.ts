import type { BillingMe } from "@/features/payments/api/billing";

type BillingSource = BillingMe["entitlements"]["source"];

export type BillingExpiry = { date: string; kind: "renews" | "ends" };

export type BillingSummary = {
  planId: string;
  planName: string;
  source: BillingSource;
  isPremium: boolean;
  /** Raw subscription status, or null when there is no subscription status to show. */
  status: string | null;
  period: BillingMe["subscription"]["billingPeriod"];
  expiry: BillingExpiry | null;
  canUpgrade: boolean;
};

export type BillingHistoryEntry = {
  id: string;
  kind: "subscription" | "trial" | "bonus";
  planName: string;
  date: string | null;
  dateKind: "renews" | "ends" | null;
  status: string | null;
};

type BillingInput = Pick<
  BillingMe,
  "subscription" | "hasPaidPlan" | "entitlements" | "subscriptionPlans"
>;

function isCanceled(status: string | null | undefined) {
  return status?.toLowerCase() === "canceled";
}

function isFreePlanId(planId: string) {
  return planId === "starter" || planId === "free";
}

function planNameFor(me: BillingInput, planId: string) {
  return me.subscriptionPlans?.find((plan) => plan.id === planId)?.name ?? planId;
}

export function resolveBillingSummary(me: BillingInput | undefined): BillingSummary | null {
  if (!me) return null;
  const { entitlements, subscription } = me;
  const source = entitlements.source;
  let expiry: BillingExpiry | null = null;
  if (source === "subscription" && subscription.currentPeriodEnd) {
    expiry = {
      date: subscription.currentPeriodEnd,
      kind: isCanceled(subscription.status) ? "ends" : "renews",
    };
  } else if ((source === "trial" || source === "bonus") && entitlements.proUntil) {
    expiry = { date: entitlements.proUntil, kind: "ends" };
  }
  return {
    planId: entitlements.planId,
    planName: planNameFor(me, entitlements.planId),
    source,
    isPremium: source !== "free",
    status: source === "subscription" ? subscription.status || null : null,
    period: source === "subscription" ? subscription.billingPeriod : null,
    expiry,
    canUpgrade: !me.hasPaidPlan,
  };
}

/** Activity derived from `/billing/me` only; the API has no billing history endpoint. */
export function billingHistory(me: BillingInput | undefined): BillingHistoryEntry[] {
  if (!me) return [];
  const { subscription, entitlements } = me;
  const entries: BillingHistoryEntry[] = [];
  const hasSubscription =
    me.hasPaidPlan || (!isFreePlanId(subscription.planId) && Boolean(subscription.status));
  if (hasSubscription) {
    entries.push({
      id: `subscription-${subscription.planId}`,
      kind: "subscription",
      planName: planNameFor(me, subscription.planId),
      date: subscription.currentPeriodEnd,
      dateKind: subscription.currentPeriodEnd
        ? isCanceled(subscription.status)
          ? "ends"
          : "renews"
        : null,
      status: subscription.status || null,
    });
  }
  if ((entitlements.source === "trial" || entitlements.source === "bonus") && entitlements.proUntil) {
    entries.push({
      id: `${entitlements.source}-${entitlements.planId}`,
      kind: entitlements.source,
      planName: planNameFor(me, entitlements.planId),
      date: entitlements.proUntil,
      dateKind: "ends",
      status: null,
    });
  }
  return entries;
}
