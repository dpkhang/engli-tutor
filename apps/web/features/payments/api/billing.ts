import { workspaceApiClient } from "@/lib/workspace-api-client";

export type CreditLedgerEntry = {
  id: string;
  delta: number;
  balanceAfter: number;
  reason:
    | "SIGNUP_BONUS"
    | "PURCHASE"
    | "SUBSCRIPTION_GRANT"
    | "AI_GENERATE"
    | "AI_GENERATE_REFUND"
    | "ADJUST";
  reference: string | null;
  createdAt: string;
};

export type SubscriptionPlan = {
  id: "growth" | "scale";
  name: string;
  description: string;
  priceVndMonthly: number;
  creditsPerPeriod: number;
  features: string[];
  featured?: boolean;
};

export type TopupPack = {
  id: "boost-100" | "boost-500" | "boost-1500";
  name: string;
  credits: number;
  priceVnd: number;
};

export type BillingMe = {
  balance: number;
  signupBonus: number;
  ledger: CreditLedgerEntry[];
  subscription: {
    planId: "free" | "growth" | "scale";
    status: string;
    billingPeriod: "monthly" | "yearly" | null;
    currentPeriodEnd: string | null;
    creditsPerPeriod: number;
    isPaid: boolean;
  };
  hasPaidPlan: boolean;
  subscriptionPlans: SubscriptionPlan[];
  topupPacks: TopupPack[];
  stripeConfigured: boolean;
};

export type CheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export const billingApi = {
  me: () => workspaceApiClient.get<BillingMe>("/api/billing/me", { cache: "no-store" }),
  subscribe: (planId: SubscriptionPlan["id"], period: "monthly" | "yearly" = "monthly") =>
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
  topup: (packId: TopupPack["id"]) =>
    workspaceApiClient.post<CheckoutResponse>("/api/billing/topup", {
      packId,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    }),
  confirm: (sessionId: string) =>
    workspaceApiClient.post<{
      subscribed?: boolean;
      topup?: boolean;
      planId?: string | null;
      balanceAfter?: number;
      creditsAdded?: number;
    }>("/api/billing/confirm", {
      sessionId,
    }),
};
