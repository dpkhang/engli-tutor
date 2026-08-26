import type { BillingMe, SubscriptionPlan } from "../api/billing";

export type WorkspacePlanId = "starter" | "growth" | "scale";

export const STARTER_PLAN = {
  id: "starter" as const,
  name: "Free",
  description: "Limited conversation minutes per day — explore EngliTutor.",
  features: [
    "Limited AI speaking practice minutes per day",
    "Placement test & learner profile",
    "Basic CEFR learning path",
    "Error feedback in Vietnamese",
  ],
};

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

export function currentPlanId(data: BillingMe | undefined): WorkspacePlanId {
  if (!data?.hasPaidPlan) return "starter";
  return data.subscription.planId === "free" ? "starter" : data.subscription.planId;
}

export function currentPlanDetails(data: BillingMe | undefined): {
  id: WorkspacePlanId;
  name: string;
  description: string;
  features: string[];
} {
  const id = currentPlanId(data);
  if (id === "starter") return STARTER_PLAN;

  const fromApi = data?.subscriptionPlans.find((p) => p.id === id);
  if (fromApi) {
    return {
      id,
      name: fromApi.name,
      description: fromApi.description,
      features: fromApi.features,
    };
  }

  return { id, name: id, description: "", features: [] };
}

export function allPlansForCompare(
  subscriptionPlans: SubscriptionPlan[],
): Array<{
  id: WorkspacePlanId;
  name: string;
  description: string;
  priceVndMonthly: number;
  creditsPerPeriod: number;
  features: string[];
  featured?: boolean;
  isFree: boolean;
}> {
  return [
    {
      id: "starter",
      name: STARTER_PLAN.name,
      description: STARTER_PLAN.description,
      priceVndMonthly: 0,
      creditsPerPeriod: 0,
      features: STARTER_PLAN.features,
      isFree: true,
    },
    ...subscriptionPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceVndMonthly: plan.priceVndMonthly,
      creditsPerPeriod: plan.creditsPerPeriod,
      features: plan.features,
      featured: plan.featured,
      isFree: false,
    })),
  ];
}
