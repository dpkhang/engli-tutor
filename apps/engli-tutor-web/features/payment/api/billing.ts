import { marketingApiClient } from "@/lib/marketing-api-client";

export type PaidPlanId = string;
export type BillingPeriod = "monthly" | "yearly";
export type PlanId = string;

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export type BillingMe = {
  balance: number;
  signupBonus: number;
  subscription: {
    planId: string;
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
  upgrade: (planId: PaidPlanId) =>
    marketingApiClient.post<{ url: string }>("/api/billing/upgrade", {
      planId,
      returnOrigin: clientReturnOrigin(),
    }),
  confirm: (input: { sessionId?: string; planId?: string }) =>
    marketingApiClient.post<{
      subscribed?: boolean;
      upgraded?: boolean;
      planId?: string;
      balanceAfter?: number;
    }>("/api/billing/confirm", input),
};
