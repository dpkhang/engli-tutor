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
    "10 AI tutor messages a day",
    "20 AI voice replays a day",
    "Listening, speaking, reading and writing exercises",
    "English corrections explained in Vietnamese",
  ],
  cta: "Start speaking practice",
  imageUrl: "/images/plan-starter.png",
  featured: false,
  isFree: true,
};

export const STARTER_PLAN = FALLBACK_STARTER;

export const BILLING_PERIODS: BillingPeriod[] = ["monthly", "quarterly", "yearly"];

export const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  ACTIVE: "Active",
  past_due: "Past due",
  PAST_DUE: "Past due",
  canceled: "Canceled",
  CANCELED: "Canceled",
  incomplete: "Incomplete",
  INCOMPLETE: "Incomplete",
};

export const PERIOD_LABEL: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  quarterly: "3 months",
  yearly: "Yearly",
};

export const PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  monthly: "/ month",
  quarterly: "/ 3 months",
  yearly: "/ year",
};

export const USAGE_LABEL: Record<UsageMetric, string> = {
  tutor_chat: "AI tutor messages",
  tts: "AI voice",
  ai_translate: "AI translations",
  game_session: "Game plays",
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

export function metricLimit(limits: PlanLimits, metric: UsageMetric) {
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
  return (Object.keys(USAGE_LABEL) as UsageMetric[]).map((metric) => {
    const limit = metricLimit(limits, metric);
    const hardCap = limits.enforcement === "block" && limit !== null;
    return {
      metric,
      label: USAGE_LABEL[metric],
      used: data.usage?.[metric] ?? 0,
      limit: hardCap ? limit : null,
    };
  });
}

function planBullets(plan: Pick<SubscriptionPlan, "benefits" | "features" | "limits">): string[] {
  const benefits = plan.benefits?.length ? plan.benefits : plan.features ?? [];
  const { limits } = plan;
  const allowance = (metric: UsageMetric, label: string) => {
    const limit = metricLimit(limits, metric);
    return limits.enforcement === "block" && limit !== null
      ? `${limit} ${label} a day`
      : `Unlimited ${label}${limits.enforcement === "throttle" && metric !== "game_session" ? " (fair use)" : ""}`;
  };
  return [...new Set([
    ...benefits,
    allowance("ai_translate", "AI translations"),
    allowance("game_session", "game plays"),
    limits.fullVocabModes ? "Vocabulary: Flip, Picture quiz and Listen & pick" : "Vocabulary: Flip mode",
    limits.proScenarios ? "Interview and Standup scenarios included" : "Everyday tutor scenarios (Interview and Standup require Premium)",
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

export function currentPlanDetails(data: BillingMe | undefined): {
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
      features: planBullets(fromApi),
    };
  }
  if (id === "starter") return { ...STARTER_PLAN, features: planBullets(STARTER_PLAN) };
  return { id, name: id, description: "", features: [] };
}

export function hasPremiumAccess(data: BillingMe | undefined) {
  if (!data) return false;
  if (!data.entitlements) return data.hasPaidPlan;
  return data.entitlements.source !== "free";
}

/** Compact header label: remaining free chats, or the active plan name. */
export function planBadgeLabel(data: BillingMe | undefined): string | undefined {
  if (!data) return undefined;
  const chat = usageRows(data).find((row) => row.metric === "tutor_chat");
  if (chat && chat.limit !== null) {
    return `${Math.max(0, chat.limit - chat.used)} chats left`;
  }
  return currentPlanDetails(data).name;
}

/** Label for trial / bonus access, e.g. "Trial until Oct 6, 2026". */
export function accessNote(data: BillingMe | undefined): string | null {
  const entitlements = data?.entitlements;
  if (!entitlements?.proUntil) return null;
  const until = formatBillingDate(entitlements.proUntil);
  return entitlements.source === "trial" ? `Trial until ${until}` : `Bonus access until ${until}`;
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

export function allPlansForCompare(subscriptionPlans: SubscriptionPlan[]): ComparePlan[] {
  const mapped = subscriptionPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceVndMonthly: plan.priceVndMonthly,
    periodPrices: plan.periodPrices,
    features: planBullets(plan),
    featured: plan.featured,
    isFree: isFreePlan(plan),
  }));

  if (!mapped.some((plan) => plan.isFree)) {
    return [
      {
        id: STARTER_PLAN.id,
        name: STARTER_PLAN.name,
        description: STARTER_PLAN.description,
        priceVndMonthly: 0,
        periodPrices: STARTER_PLAN.periodPrices,
        features: planBullets(STARTER_PLAN),
        isFree: true,
      },
      ...mapped,
    ];
  }

  return mapped;
}
