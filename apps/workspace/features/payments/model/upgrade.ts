import { ApiError } from "@engli-tutor/api-client";
import type { Translator } from "@engli-tutor/i18n";
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

export const UPGRADE_MESSAGE_KEY: Record<UpgradeReason, string> = {
  quota: "billing.upgrade.quotaChat",
  pro: "billing.upgrade.pro",
};

const QUOTA_MESSAGE_KEY: Record<UsageMetric, string> = {
  tutor_chat: UPGRADE_MESSAGE_KEY.quota,
  tts: "billing.upgrade.quotaVoice",
  ai_translate: "billing.upgrade.quotaTranslate",
  game_session: "billing.upgrade.quotaGames",
  vocab_review: "billing.upgrade.quotaVocabReview",
};

/** Plan-aware message for a 402 response, or null for any other error. */
export function upgradeMessageFromError(error: unknown, t: Translator): string | null {
  const reason = upgradeReasonFromError(error);
  if (!reason) return null;
  if (reason === "pro") return t(UPGRADE_MESSAGE_KEY.pro);
  const metric = paymentRequiredBody(error)?.metric as UsageMetric | undefined;
  return t((metric && QUOTA_MESSAGE_KEY[metric]) || UPGRADE_MESSAGE_KEY.quota);
}
