import type { BillingMe, SubscriptionPlan } from "../api/billing";

export type WorkspacePlanId = string;

const FALLBACK_STARTER: SubscriptionPlan = {
  id: "starter",
  name: "Free",
  description: "Build a simple daily English habit and discover how AI practice works for you.",
  priceVndMonthly: 0,
  creditsPerPeriod: 0,
  features: [
    "Daily AI speaking practice",
    "Listening, speaking, reading and writing exercises",
    "Starter A2–B1 learning path",
    "English corrections explained in Vietnamese",
  ],
  benefits: [
    "Daily AI speaking practice",
    "Listening, speaking, reading and writing exercises",
    "Starter A2–B1 learning path",
    "English corrections explained in Vietnamese",
  ],
  cta: "Start speaking practice",
  imageUrl: "/images/plan-starter.png",
  featured: false,
  isFree: true,
};

export const STARTER_PLAN = FALLBACK_STARTER;

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

export const PERIOD_LABEL: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

function planBullets(plan: Pick<SubscriptionPlan, "benefits" | "features">): string[] {
  if (plan.benefits?.length) return plan.benefits;
  return plan.features ?? [];
}

function isFreePlan(plan: Pick<SubscriptionPlan, "id" | "priceVndMonthly" | "isFree">): boolean {
  return Boolean(plan.isFree) || plan.priceVndMonthly <= 0 || plan.id === "starter" || plan.id === "free";
}

export function currentPlanId(data: BillingMe | undefined): WorkspacePlanId {
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
  if (id === "starter") return STARTER_PLAN;
  return { id, name: id, description: "", features: [] };
}

export function allPlansForCompare(subscriptionPlans: SubscriptionPlan[]): Array<{
  id: WorkspacePlanId;
  name: string;
  description: string;
  priceVndMonthly: number;
  creditsPerPeriod: number;
  features: string[];
  featured?: boolean;
  isFree: boolean;
}> {
  const mapped = subscriptionPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceVndMonthly: plan.priceVndMonthly,
    creditsPerPeriod: plan.creditsPerPeriod,
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
        creditsPerPeriod: STARTER_PLAN.creditsPerPeriod,
        features: STARTER_PLAN.features,
        isFree: true,
      },
      ...mapped,
    ];
  }

  return mapped;
}
