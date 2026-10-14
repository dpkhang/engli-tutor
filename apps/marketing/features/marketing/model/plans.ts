import type { Translator } from "@engli-tutor/i18n";
import type { BillingCatalog, PeriodPrice } from "@/features/payments";

export type PlanId = string;

export type PaidPlanId = string;

export type BillingPeriod = "monthly" | "quarterly" | "yearly";

export type Plan = {
  periodPrices?: Record<BillingPeriod, PeriodPrice>;
  id: PlanId;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  imageUrl: string;
  features: string[];
  cta: string;
  isEntry: boolean;
  featured: boolean;
};

const STARTER_FEATURE_KEYS = [
  "plans.starter.featureChat",
  "plans.starter.featurePlacement",
  "plans.starter.featurePath",
  "plans.starter.featureFeedback",
];

function starterPlan(t: Translator): Plan {
  return {
    id: "starter",
    name: t("plans.starter.name"),
    price: "0đ",
    priceValue: 0,
    period: t("plans.forever"),
    description: t("plans.starter.description"),
    imageUrl: "/images/plan-starter.png",
    features: STARTER_FEATURE_KEYS.map((key) => t(key)),
    cta: t("header.startLesson"),
    isEntry: true,
    featured: false,
  };
}

/** Convert the backend billing catalog into the presentation model used by marketing/payment UI. */
export function plansFromCatalog(catalog: BillingCatalog | null | undefined, t: Translator): Plan[] {
  if (!catalog?.subscriptionPlans.length) return [starterPlan(t)];

  const mapped = catalog.subscriptionPlans.map((plan) => {
    const isFree = Boolean(plan.isFree) || plan.priceVndMonthly <= 0 || plan.id === "starter";
    const benefits = plan.benefits?.length ? plan.benefits : plan.features;
    const isEntry = isFree || /^start speaking\b/i.test(plan.cta || "");
    return {
      id: plan.id,
      name: plan.name,
      price: formatVnd(plan.priceVndMonthly),
      priceValue: plan.priceVndMonthly,
      period: isFree ? t("plans.forever") : t("billing.periodSuffix.monthly"),
      description: plan.description,
      imageUrl: plan.imageUrl || (plan.id === "scale" ? "/images/plan-scale.png" : `/images/plan-${plan.id}.png`),
      features: benefits,
      periodPrices: plan.periodPrices,
      cta: isEntry ? t("header.startLesson") : plan.cta || t("plans.choose", { name: plan.name }),
      isEntry,
      featured: Boolean(plan.featured),
    } satisfies Plan;
  });

  if (mapped.some((plan) => plan.priceValue <= 0)) return mapped;
  return [starterPlan(t), ...mapped];
}

export const BILLING_PERIODS: {
  id: BillingPeriod;
  labelKey: string;
  hintKey: string;
}[] = [
  { id: "monthly", labelKey: "billing.period.monthly", hintKey: "plans.period.monthlyHint" },
  { id: "quarterly", labelKey: "billing.period.quarterly", hintKey: "plans.period.quarterlyHint" },
  { id: "yearly", labelKey: "billing.period.yearly", hintKey: "plans.period.yearlyHint" },
];

const PERIOD_TERMS: Record<BillingPeriod, { months: number; discount: number; labelKey: string }> = {
  monthly: { months: 1, discount: 0, labelKey: "billing.periodSuffix.monthly" },
  quarterly: { months: 3, discount: 0.15, labelKey: "billing.periodSuffix.quarterly" },
  yearly: { months: 12, discount: 0.4, labelKey: "billing.periodSuffix.yearly" },
};

export function getPlanById(id: string | null | undefined, plans: Plan[]): Plan {
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

/** Mirrors the backend period pricing when the catalog has no `periodPrices`. */
export function getBillingTotal(plan: Plan, period: BillingPeriod, t: Translator): {
  total: number;
  label: string;
  periodLabel: string;
} {
  if (plan.priceValue === 0) {
    return { total: 0, label: "0đ", periodLabel: t("plans.forever") };
  }

  const terms = PERIOD_TERMS[period];
  const total =
    plan.periodPrices?.[period]?.totalVnd ??
    Math.round((plan.priceValue * terms.months * (1 - terms.discount)) / 1000) * 1000;
  return { total, label: formatVnd(total), periodLabel: t(terms.labelKey) };
}

export function billingPeriodLabel(period: BillingPeriod | null | undefined, t: Translator): string {
  return t(BILLING_PERIODS.find((item) => item.id === period)?.labelKey ?? "billing.period.monthly");
}
