export function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export type ReferralRewardStatus =
  | { kind: "earning"; days: number; maxDays: number }
  | { kind: "limit"; maxDays: number };

/** `referrerDays` is the reward for the next redemption (0 once the cap is reached). */
export function referralRewardStatus(rewards: { referrerDays: number; referrerMaxDays: number }): ReferralRewardStatus {
  return rewards.referrerDays > 0
    ? { kind: "earning", days: rewards.referrerDays, maxDays: rewards.referrerMaxDays }
    : { kind: "limit", maxDays: rewards.referrerMaxDays };
}
