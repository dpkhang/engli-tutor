"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@engli-tutor/api-client";
import type { Translator } from "@engli-tutor/i18n";
import { referralsApi } from "@/features/referrals";
import { billingMeQueryKey } from "@/features/payments";
import { formatBillingDateTime } from "@/features/payments";
import { queryKeys } from "@/lib/query";
import { useWorkspaceI18n } from "@/features/i18n";
import { ReferralSettingsView, type ReferralRedemptionRow } from "./referral-settings.view";

function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function referralErrorMessage(error: unknown, t: Translator) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return t("settings.referral.redeemFailed");
}

export function ReferralSettings() {
  const t = useWorkspaceI18n();
  const queryClient = useQueryClient();
  const [manualCode, setManualCode] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const referralQuery = useQuery({
    queryKey: queryKeys.referrals.me,
    queryFn: referralsApi.me,
  });

  const redeem = useMutation({
    mutationFn: referralsApi.redeem,
    onSuccess: async (result) => {
      setManualCode("");
      setNotice({
        tone: "success",
        message: t("settings.referral.redeemedNotice", { days: result.referredDays }),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.me }),
        queryClient.invalidateQueries({ queryKey: billingMeQueryKey }),
      ]);
    },
    onError: (error) => {
      setNotice({ tone: "error", message: referralErrorMessage(error, t) });
    },
  });

  const data = referralQuery.data;
  const recentRedemptions = useMemo((): ReferralRedemptionRow[] => {
    return (data?.recentRedemptions ?? []).map((item) => ({
      id: item.id,
      referredName: item.referredName,
      referredEmailMasked: item.referredEmailMasked,
      createdAt: formatBillingDateTime(item.createdAt),
    }));
  }, [data?.recentRedemptions]);

  const copy = useCallback(async (kind: "code" | "link", value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  }, []);

  const onManualCodeChange = useCallback((value: string) => {
    setManualCode(normalizeReferralCode(value));
    setNotice(null);
  }, []);

  const onRedeem = useCallback(() => {
    const code = normalizeReferralCode(manualCode);
    if (!code || redeem.isPending) return;
    redeem.mutate(code);
  }, [manualCode, redeem]);

  return (
    <ReferralSettingsView
      ready={referralQuery.isSuccess || referralQuery.isError}
      code={data?.code ?? ""}
      shareUrl={data?.shareUrl ?? ""}
      referrerDays={data?.rewards.referrerDays ?? 0}
      referredDays={data?.rewards.referredDays ?? 0}
      referrerMaxDays={data?.rewards.referrerMaxDays ?? 0}
      totalReferred={data?.stats.totalReferred ?? 0}
      proDaysEarned={data?.stats.proDaysEarned ?? 0}
      redeemedCode={data?.redeemed?.code ?? null}
      recentRedemptions={recentRedemptions}
      manualCode={manualCode}
      pendingRedeem={redeem.isPending}
      copied={copied}
      notice={notice}
      onManualCodeChange={onManualCodeChange}
      onRedeem={onRedeem}
      onCopyCode={() => void copy("code", data?.code ?? "")}
      onCopyLink={() => void copy("link", data?.shareUrl ?? "")}
    />
  );
}
