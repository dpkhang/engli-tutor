import type { BillingCatalog } from "@/features/payment/api/billing";

export type PlanId = string;

export type PaidPlanId = string;

export type BillingPeriod = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  imageUrl: string;
  features: string[];
  cta: string;
  featured: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "0đ",
    priceValue: 0,
    period: "forever",
    description: "Limited conversation minutes each day — a good way to explore EngliTutor.",
    imageUrl: "/images/plan-starter.png",
    features: [
      "Limited AI speaking practice minutes per day",
      "4-skill placement test (listening–speaking–reading–writing)",
      "Full CEFR A2–B1 path across all four skills",
      "Error feedback in Vietnamese",
    ],
    cta: "Start speaking practice",
    featured: false,
  },
];

const STARTER_PLAN = PLANS[0]!;

/** Convert the backend billing catalog into the presentation model used by marketing/payment UI. */
export function plansFromCatalog(catalog: BillingCatalog | null | undefined): Plan[] {
  if (!catalog) return [STARTER_PLAN];
  return [
    STARTER_PLAN,
    ...catalog.subscriptionPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: formatVnd(plan.priceVndMonthly),
      priceValue: plan.priceVndMonthly,
      period: "/ month",
      description: plan.description,
      imageUrl:
        plan.id === "growth" || plan.id === "scale"
          ? `/images/plan-${plan.id}.png`
          : "/images/plan-growth.png",
      features: plan.features,
      cta: `Choose ${plan.name}`,
      featured: Boolean(plan.featured),
    })),
  ];
}

export const BILLING_PERIODS: {
  id: BillingPeriod;
  label: string;
  hint: string;
}[] = [
  { id: "monthly", label: "Monthly", hint: "Billed every month" },
  { id: "yearly", label: "Yearly", hint: "Save ~2 months" },
];

export function getPlanById(id: string | null | undefined, plans: Plan[] = PLANS): Plan {
  return plans.find((plan) => plan.id === id) ?? plans.find((plan) => plan.featured) ?? plans[0]!;
}

export function isPaidPlan(id: PlanId): id is PaidPlanId {
  return id !== "starter" && id !== "free";
}

export function planCheckoutHref(planId: PlanId): string {
  if (planId === "starter") return "/auth";
  return `/payment/checkout?plan=${planId}`;
}

export function formatVnd(value: number): string {
  if (value === 0) return "0đ";
  return `${value.toLocaleString("vi-VN")}đ`;
}

/** Yearly = 10× monthly (2 months free). */
export function getBillingTotal(plan: Plan, period: BillingPeriod): {
  total: number;
  label: string;
  periodLabel: string;
} {
  if (plan.priceValue === 0) {
    return { total: 0, label: "0đ", periodLabel: "forever" };
  }

  if (period === "yearly") {
    const total = plan.priceValue * 10;
    return {
      total,
      label: formatVnd(total),
      periodLabel: "/ year",
    };
  }

  return {
    total: plan.priceValue,
    label: formatVnd(plan.priceValue),
    periodLabel: "/ month",
  };
}
