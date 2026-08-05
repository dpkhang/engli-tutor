import { workspaceApiClient } from "@/lib/workspace-api-client";
import type { BillingMe, TopupPack } from "./billing";

export type CreditsMe = Pick<
  BillingMe,
  "balance" | "aiGenerateCost" | "signupBonus" | "ledger"
>;

export type CreditPacksResponse = {
  packs: TopupPack[];
  currency?: string;
  stripeConfigured: boolean;
};

export type CreditsCheckoutResponse = {
  url: string | null;
  sessionId: string;
};

export const creditsApi = {
  me: () => workspaceApiClient.get<BillingMe>("/api/billing/me", { cache: "no-store" }),
  packs: () =>
    workspaceApiClient.get<CreditPacksResponse>("/api/credits/packs", { cache: "no-store" }),
  checkout: (packId: TopupPack["id"]) =>
    workspaceApiClient.post<CreditsCheckoutResponse>("/api/billing/topup", {
      packId,
      returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    }),
};
