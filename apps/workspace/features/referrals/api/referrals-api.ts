import { workspaceApiClient } from "@/lib/workspace-api-client";

export type ReferralRedemptionSummary = {
  id: string;
  referredName: string;
  referredEmailMasked: string;
  createdAt: string;
};

export type ReferralMe = {
  code: string;
  shareUrl: string;
  rewards: {
    referrerDays: number;
    referredDays: number;
    referrerMaxDays: number;
  };
  stats: {
    totalReferred: number;
    proDaysEarned: number;
  };
  redeemed: {
    code: string;
    createdAt: string;
  } | null;
  recentRedemptions: ReferralRedemptionSummary[];
};

export type RedeemReferralResult = {
  redeemed: true;
  redemptionId: string;
  referrerName: string;
  referredDays: number;
  referrerDays: number;
  createdAt: string;
};

export const referralsApi = {
  me: () => workspaceApiClient.get<ReferralMe>("/api/referrals/me", { cache: "no-store" }),
  redeem: (code: string) =>
    workspaceApiClient.post<RedeemReferralResult>("/api/referrals/redeem", { code }),
};
