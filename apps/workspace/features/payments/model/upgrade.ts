import { ApiError } from "@engli-tutor/api-client";
import type { UsageMetric } from "../api/billing";

export type UpgradeReason = "quota" | "pro";

type PaymentRequiredBody = { code?: string; message?: string; metric?: string };

function paymentRequiredBody(error: unknown): PaymentRequiredBody | null {
  if (!(error instanceof ApiError) || error.status !== 402) return null;
  return error.body as PaymentRequiredBody | null;
}

export function upgradeReasonFromError(error: unknown): UpgradeReason | null {
  const body = paymentRequiredBody(error);
  if (body?.code === "PRO_REQUIRED") return "pro";
  if (body?.code === "QUOTA_EXCEEDED") return "quota";
  return null;
}

export const UPGRADE_MESSAGE: Record<UpgradeReason, string> = {
  quota: "You've used today's AI tutor messages. Your limit resets at midnight, or upgrade for more.",
  pro: "This scenario is part of Premium. Start a free trial or upgrade to unlock it.",
};

const QUOTA_MESSAGE: Record<UsageMetric, string> = {
  tutor_chat: UPGRADE_MESSAGE.quota,
  tts: "You've used today's AI voice. Your limit resets at midnight, or upgrade for more.",
  ai_translate: "You've used today's AI translations. Your limit resets at midnight, or upgrade for more.",
  game_session: "You've used today's free game plays. They reset at midnight, or upgrade for unlimited play.",
};

/** Plan-aware message for a 402 response, or null for any other error. */
export function upgradeMessageFromError(error: unknown): string | null {
  const reason = upgradeReasonFromError(error);
  if (!reason) return null;
  if (reason === "pro") return UPGRADE_MESSAGE.pro;
  const metric = paymentRequiredBody(error)?.metric as UsageMetric | undefined;
  return (metric && QUOTA_MESSAGE[metric]) || UPGRADE_MESSAGE.quota;
}
