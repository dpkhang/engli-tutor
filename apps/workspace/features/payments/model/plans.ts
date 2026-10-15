import type { Translator } from "@engli-tutor/i18n";
import type { BillingMe, BillingPeriod, PlanLimits, SubscriptionPlan, UsageMetric } from "../api/billing";

export type WorkspacePlanId = string;

const FREE_LIMITS: PlanLimits = {
  tutorChatPerDay: 10,
  ttsPerDay: 20,
  aiTranslatePerDay: 30,
  enforcement: "block",
  proScenarios: false,
  gameSessionsPerDay: 5,
  vocabReviewsPerDay: 50,
  fullVocabModes: false,
  advancedProgress: false,
  deepFeedback: false,
  customPractice: false,
};

const FALLBACK_STARTER: SubscriptionPlan = {
  id: "starter",
  name: "Free",
  description: "Build a simple daily English habit and discover how AI practice works for you.",
  priceVndMonthly: 0,
  limits: FREE_LIMITS,
  periodPrices: {
    monthly: { totalVnd: 0, months: 1, discountPercent: 0 },
    quarterly: { totalVnd: 0, months: 3, discountPercent: 0 },
    yearly: { totalVnd: 0, months: 12, discountPercent: 0 },
  },
  features: [
    "billing.starter.featureChat",
    "billing.starter.featureVoice",
    "billing.starter.featureSkills",
    "billing.starter.featureCorrections",
  ],
  cta: "Start speaking practice",
  imageUrl: "/images/plan-starter.png",
  featured: false,
  isFree: true,
};

function starterPlan(t: Translator): SubscriptionPlan {
  return {
    ...FALLBACK_STARTER,
    name: t("workspace.free"),
    description: t("billing.starter.description"),
    features: FALLBACK_STARTER.features.map((key) => t(key)),
  };
}

export const BILLING_PERIODS: BillingPeriod[] = ["monthly", "quarterly", "yearly"];

export const STATUS_LABEL_KEY: Record<string, string> = {
  active: "checkout.active",
  ACTIVE: "checkout.active",
  past_due: "billing.status.pastDue",
  PAST_DUE: "billing.status.pastDue",
  canceled: "billing.status.canceled",
  CANCELED: "billing.status.canceled",
  incomplete: "billing.status.incomplete",
  INCOMPLETE: "billing.status.incomplete",
};

export const PERIOD_LABEL_KEY: Record<BillingPeriod, string> = {
  monthly: "billing.period.monthly",
  quarterly: "billing.period.quarterly",
  yearly: "billing.period.yearly",
};

export const PERIOD_SUFFIX_KEY: Record<BillingPeriod, string> = {
  monthly: "billing.periodSuffix.monthly",
  quarterly: "billing.periodSuffix.quarterly",
  yearly: "billing.periodSuffix.yearly",
};

export const USAGE_LABEL_KEY: Record<UsageMetric, string> = {
  tutor_chat: "billing.usage.tutorChat",
  tts: "workspace.aiVoice",
  ai_translate: "billing.usage.aiTranslate",
  game_session: "billing.usage.gameSession",
};

export function formatVnd(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

export function formatBillingDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export function formatBillingDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function planPeriodPrice(plan: Pick<SubscriptionPlan, "priceVndMonthly" | "periodPrices">, period: BillingPeriod) {
  return plan.periodPrices?.[period]?.totalVnd ?? plan.priceVndMonthly;
}

function fallbackLimitsForPlan(planId: string): PlanLimits {
  if (planId === "starter" || planId === "free") return FREE_LIMITS;
  return {
    tutorChatPerDay: null,
    ttsPerDay: null,
    aiTranslatePerDay: null,
    gameSessionsPerDay: null,
    vocabReviewsPerDay: null,
    enforcement: "throttle",
    proScenarios: true,
    fullVocabModes: true,
    advancedProgress: true,
    deepFeedback: true,
    customPractice: true,
  };
}

function normalizedLimits(planId: string, limits: PlanLimits | undefined): PlanLimits {
  return limits ?? fallbackLimitsForPlan(planId);
}

export function metricLimit(limits: PlanLimits | undefined, metric: UsageMetric) {
  if (!limits) return null;
  if (metric === "tutor_chat") return limits.tutorChatPerDay;
  if (metric === "tts") return limits.ttsPerDay;
  if (metric === "game_session") return limits.gameSessionsPerDay ?? null;
  return limits.aiTranslatePerDay ?? null;
}

export type PlanFlag = "proScenarios" | "fullVocabModes";

/** Unknown plan state stays unlocked; the API remains the source of truth for paid features. */
export function planAllows(data: BillingMe | undefined, flag: PlanFlag): boolean {
  const limits = data?.entitlements?.limits;
  if (!limits) return true;
  return Boolean(limits[flag]);
}

/** Units left today under a hard cap, or null when the metric is not capped. */
export function dailyRemaining(data: BillingMe | undefined, metric: UsageMetric): number | null {
  const limits = data?.entitlements?.limits;
  if (!data || !limits || limits.enforcement !== "block") return null;
  const limit = metricLimit(limits, metric);
  if (limit === null) return null;
  return Math.max(0, limit - (data.usage?.[metric] ?? 0));
}

/** Rows for "today's usage": hard caps show `used / limit`; fair-use shows unlimited. */
export function usageRows(data: BillingMe | undefined) {
  const limits = data?.entitlements?.limits;
  if (!data || !limits) return [];
  return (Object.keys(USAGE_LABEL_KEY) as UsageMetric[]).map((metric) => {
    const limit = metricLimit(limits, metric);
    const hardCap = limits.enforcement === "block" && limit !== null;
    return {
      metric,
      labelKey: USAGE_LABEL_KEY[metric],
      used: data.usage?.[metric] ?? 0,
      limit: hardCap ? limit : null,
    };
  });
}

function planBullets(
  plan: Pick<SubscriptionPlan, "id" | "benefits" | "features" | "limits">,
  t: Translator,
): string[] {
  const benefits = plan.benefits?.length ? plan.benefits : plan.features ?? [];
  const limits = normalizedLimits(plan.id, plan.limits);
  const allowance = (metric: UsageMetric, labelKey: string) => {
    const limit = metricLimit(limits, metric);
    const label = t(labelKey);
    if (limits.enforcement === "block" && limit !== null) {
      return t("billing.bullet.dailyAllowance", { count: limit, label });
    }
    return limits.enforcement === "throttle" && metric !== "game_session"
      ? t("billing.bullet.unlimitedFairUse", { label })
      : t("billing.bullet.unlimited", { label });
  };
  return [...new Set([
    ...benefits,
    allowance("ai_translate", "billing.bullet.aiTranslations"),
    allowance("game_session", "billing.bullet.gamePlays"),
    t(limits.fullVocabModes ? "billing.bullet.vocabAllModes" : "billing.bullet.vocabFlipOnly"),
    t(limits.proScenarios ? "billing.bullet.proScenarios" : "billing.bullet.everydayScenarios"),
  ])];
}

function isFreePlan(plan: Pick<SubscriptionPlan, "id" | "priceVndMonthly" | "isFree">): boolean {
  return Boolean(plan.isFree) || plan.priceVndMonthly <= 0 || plan.id === "starter" || plan.id === "free";
}

/** Plan currently in effect, including trial / bonus Pro access. */
export function currentPlanId(data: BillingMe | undefined): WorkspacePlanId {
  if (data?.entitlements) return data.entitlements.planId;
  if (!data?.hasPaidPlan) {
    const free = data?.subscriptionPlans.find((plan) => isFreePlan(plan));
    return free?.id ?? "starter";
  }
  return data.subscription.planId === "free" ? "starter" : data.subscription.planId;
}

export function currentPlanDetails(
  data: BillingMe | undefined,
  t: Translator,
): {
  id: WorkspacePlanId;
  name: string;
  description: string;
  features: string[];
} {
  const id = currentPlanId(data);
  const fromApi = data?.subscriptionPlans.find((plan) => plan.id === id);
  if (fromApi) {
    return {
      id,
      name: fromApi.name,
      description: fromApi.description,
      features: planBullets(fromApi, t),
    };
  }
  if (id === "starter") {
    const starter = starterPlan(t);
    return { ...starter, features: planBullets(starter, t) };
  }
  return { id, name: id, description: "", features: [] };
}

export function hasPremiumAccess(data: BillingMe | undefined) {
  if (!data) return false;
  if (!data.entitlements) return data.hasPaidPlan;
  return data.entitlements.source !== "free";
}

/** Compact header label: remaining free chats, or the active plan name. */
export function planBadgeLabel(data: BillingMe | undefined, t: Translator): string | undefined {
  if (!data) return undefined;
  const chat = usageRows(data).find((row) => row.metric === "tutor_chat");
  if (chat && chat.limit !== null) {
    return t("billing.chatsLeft", { count: Math.max(0, chat.limit - chat.used) });
  }
  return currentPlanDetails(data, t).name;
}

/** Label for trial / bonus access, e.g. "Trial until Oct 6, 2026". */
export function accessNote(data: BillingMe | undefined, t: Translator): string | null {
  const entitlements = data?.entitlements;
  if (!entitlements?.proUntil) return null;
  const date = formatBillingDate(entitlements.proUntil);
  return t(entitlements.source === "trial" ? "billing.trialUntil" : "billing.bonusUntil", { date });
}

export type ComparePlan = {
  id: WorkspacePlanId;
  name: string;
  description: string;
  priceVndMonthly: number;
  periodPrices: SubscriptionPlan["periodPrices"];
  features: string[];
  featured?: boolean;
  isFree: boolean;
};

export function allPlansForCompare(
  subscriptionPlans: SubscriptionPlan[],
  t: Translator,
): ComparePlan[] {
  const mapped = subscriptionPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceVndMonthly: plan.priceVndMonthly,
    periodPrices: plan.periodPrices,
    features: planBullets(plan, t),
    featured: plan.featured,
    isFree: isFreePlan(plan),
  }));

  if (!mapped.some((plan) => plan.isFree)) {
    const starter = starterPlan(t);
    return [
      {
        id: starter.id,
        name: starter.name,
        description: starter.description,
        priceVndMonthly: 0,
        periodPrices: starter.periodPrices,
        features: planBullets(starter, t),
        isFree: true,
      },
      ...mapped,
    ];
  }

  return mapped;
}
