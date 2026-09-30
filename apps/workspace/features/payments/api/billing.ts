import { workspaceApiClient } from "@/lib/workspace-api-client";

export type BillingPeriod = "monthly" | "quarterly" | "yearly";

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

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  priceVndMonthly: number;
  limits: PlanLimits;
  periodPrices: Record<BillingPeriod, PeriodPrice>;
  features: string[];
  benefits?: string[];
  cta?: string;
  imageUrl?: string;
  featured?: boolean;
  isFree?: boolean;
};

export type Entitlements = {
  planId: string;
  source: "subscription" | "trial" | "bonus" | "free";
  limits: PlanLimits;
  proUntil: string | null;
  trialAvailable: boolean;
};

export type UsageMetric = "tutor_chat" | "tts";

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
  usage: Record<UsageMetric, number>;
  trialDays: number;
  subscriptionPlans: SubscriptionPlan[];
  stripeConfigured: boolean;
};

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export const billingApi = {
  me: () => workspaceApiClient.get<BillingMe>("/api/billing/me", { cache: "no-store" }),
  subscribe: (planId: SubscriptionPlan["id"], period: BillingPeriod = "monthly") =>
    workspaceApiClient.post<CheckoutResponse>("/api/billing/subscribe", {
      planId,
      period,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    }),
  upgrade: (planId: SubscriptionPlan["id"]) =>
    workspaceApiClient.post<{ url: string }>("/api/billing/upgrade", {
      planId,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    }),
  startTrial: () =>
    workspaceApiClient.post<{ trialEndsAt: string; entitlements: Entitlements }>("/api/billing/trial", {}),
  confirm: (input: { sessionId?: string; planId?: string }) =>
    workspaceApiClient.post<{
      subscribed?: boolean;
      upgraded?: boolean;
      planId?: string | null;
    }>("/api/billing/confirm", input),
};
