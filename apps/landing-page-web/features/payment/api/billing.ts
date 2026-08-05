import { marketingApiClient } from "@/lib/marketing-api-client";

export type PaidPlanId = "growth" | "scale";
export type BillingPeriod = "monthly" | "yearly";

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export type BillingCatalog = {
  subscriptionPlans: Array<{
    id: PaidPlanId;
    name: string;
    description: string;
    priceVndMonthly: number;
    creditsPerPeriod: number;
    features: string[];
    featured?: boolean;
  }>;
  topupPacks: unknown[];
  stripeConfigured: boolean;
};

function clientReturnOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

export const billingApi = {
  catalog: () =>
    marketingApiClient.get<BillingCatalog>("/api/billing/catalog", { cache: "no-store" }),
  subscribe: (planId: PaidPlanId, period: BillingPeriod = "monthly") =>
    marketingApiClient.post<CheckoutResponse>("/api/billing/subscribe", {
      planId,
      period,
      returnOrigin: clientReturnOrigin(),
    }),
};
