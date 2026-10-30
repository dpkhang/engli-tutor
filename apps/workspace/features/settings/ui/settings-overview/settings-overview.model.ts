import type { Entitlements } from "@/features/payments/api/billing";

export type OverviewPlan = {
  name: string;
  sourceKey: string;
  /** ISO date for renewal/expiry, or null when none applies. */
  date: string | null;
  /** True when `date` is an end date rather than a renewal. */
  ends: boolean;
};

const SOURCE_KEYS: Record<Entitlements["source"], string> = {
  subscription: "settings.overview.sourceSubscription",
  trial: "settings.overview.sourceTrial",
  bonus: "settings.overview.sourceBonus",
  free: "settings.overview.sourceFree",
};

export function resolveOverviewPlan(
  me: {
    subscription: { currentPeriodEnd: string | null; status: string };
    entitlements: Pick<Entitlements, "planId" | "source" | "proUntil">;
    subscriptionPlans?: { id: string; name: string }[];
  } | undefined,
): OverviewPlan | null {
  if (!me) return null;
  const { entitlements, subscription } = me;
  const name = me.subscriptionPlans?.find((p) => p.id === entitlements.planId)?.name ?? entitlements.planId;
  const isSub = entitlements.source === "subscription";
  const date = isSub ? subscription.currentPeriodEnd : entitlements.proUntil;
  return {
    name,
    sourceKey: SOURCE_KEYS[entitlements.source],
    date: entitlements.source === "free" ? null : date,
    ends: !isSub || subscription.status === "canceled",
  };
}

export function profileInitials(name: string | undefined, email: string | undefined) {
  const source = (name?.trim() || email?.trim() || "?").split(/\s+/).filter(Boolean);
  const letters = source.length > 1 ? source[0][0] + source[source.length - 1][0] : source[0].slice(0, 2);
  return letters.toUpperCase();
}

export type OverviewProfile = {
  name: string | undefined;
  email: string | undefined;
  image: string | null;
  initials: string;
  loading: boolean;
  error: boolean;
};

export type OverviewPlanState = {
  value: OverviewPlan | null;
  loading: boolean;
  error: boolean;
};
