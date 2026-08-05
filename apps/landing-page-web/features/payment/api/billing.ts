import { marketingApiClient } from "@/lib/marketing-api-client";

export type PaidPlanId = "growth" | "scale";
export type BillingPeriod = "monthly" | "yearly";
export type PlanId = "free" | "starter" | "growth" | "scale";

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export type BillingMe = {
  balance: number;
  aiGenerateCost: number;
  signupBonus: number;
  subscription: {
    planId: "free" | "growth" | "scale";
    status: string;
    billingPeriod: BillingPeriod | null;
    currentPeriodEnd: string | null;
    creditsPerPeriod: number;
    isPaid: boolean;
  };
  hasPaidPlan: boolean;
  subscriptionPlans: Array<{
    id: PaidPlanId;
    name: string;
    description: string;
    priceVndMonthly: number;
    creditsPerPeriod: number;
    features: string[];
    featured?: boolean;
  }>;
  stripeConfigured: boolean;
};

export type BillingCatalog = {
  subscriptionPlans: BillingMe["subscriptionPlans"];
  topupPacks: unknown[];
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
  confirm: (sessionId: string) =>
    marketingApiClient.post<{ subscribed?: boolean; planId?: string }>("/api/billing/confirm", {
      sessionId,
    }),
};
