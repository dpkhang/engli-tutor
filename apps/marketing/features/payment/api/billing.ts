import { marketingApiClient } from "@/lib/marketing-api-client";

export type PaidPlanId = string;
export type BillingPeriod = "monthly" | "quarterly" | "yearly";
export type PlanId = string;

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export type PlanLimits = {
  tutorChatPerDay: number | null;
  ttsPerDay: number | null;
  enforcement: "block" | "throttle";
  proScenarios: boolean;
};

export type PeriodPrice = {
  totalVnd: number;
  months: number;
  discountPercent: number;
};

export type Entitlements = {
  planId: string;
  source: "subscription" | "trial" | "bonus" | "free";
  limits: PlanLimits;
  proUntil: string | null;
  trialAvailable: boolean;
};

export type BillingMe = {
  subscription: {
    planId: string;
    status: string;
    billingPeriod: BillingPeriod | null;
    currentPeriodEnd: string | null;
    isPaid: boolean;
  };
  hasPaidPlan: boolean;
  entitlements: Entitlements;
  usage: Record<"tutor_chat" | "tts", number>;
  trialDays: number;
  subscriptionPlans: Array<{
    id: PaidPlanId;
    name: string;
    description: string;
    priceVndMonthly: number;
    limits?: PlanLimits;
    periodPrices?: Record<BillingPeriod, PeriodPrice>;
    features: string[];
    benefits?: string[];
    cta?: string;
    imageUrl?: string;
    featured?: boolean;
    isFree?: boolean;
  }>;
  stripeConfigured: boolean;
};

export type BillingCatalog = {
  subscriptionPlans: BillingMe["subscriptionPlans"];
  trialDays?: number;
  stripeConfigured: boolean;
};

function clientReturnOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

export const billingApi = {
  me: () => marketingApiClient.get<BillingMe>("/api/billing/me", { cache: "no-store" }),
  catalog: () =>
    marketingApiClient.get<BillingCatalog>("/api/billing/catalog", { cache: "no-store" }),
  subscribe: (planId: PaidPlanId, period: BillingPeriod = "monthly") =>
    marketingApiClient.post<CheckoutResponse>("/api/billing/subscribe", {
      planId,
      period,
      returnOrigin: clientReturnOrigin(),
    }),
  upgrade: (planId: PaidPlanId) =>
    marketingApiClient.post<{ url: string }>("/api/billing/upgrade", {
      planId,
      returnOrigin: clientReturnOrigin(),
    }),
  confirm: (input: { sessionId?: string; planId?: string }) =>
    marketingApiClient.post<{
      subscribed?: boolean;
      upgraded?: boolean;
      planId?: string | null;
    }>("/api/billing/confirm", input),
};
