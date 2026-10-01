import { ApiError } from "@engli-tutor/api-client";

export type UpgradeReason = "quota" | "pro";

type PaymentRequiredBody = { code?: string; message?: string };

export function upgradeReasonFromError(error: unknown): UpgradeReason | null {
  if (!(error instanceof ApiError) || error.status !== 402) return null;
  const body = error.body as PaymentRequiredBody | null;
  if (body?.code === "PRO_REQUIRED") return "pro";
  if (body?.code === "QUOTA_EXCEEDED") return "quota";
  return null;
}

export const UPGRADE_MESSAGE: Record<UpgradeReason, string> = {
  quota: "You've used today's AI tutor messages. Your limit resets at midnight, or upgrade for more.",
  pro: "This scenario is part of Premium. Start a free trial or upgrade to unlock it.",
};
