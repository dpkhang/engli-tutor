"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@engli-tutor/api-client";
import { useToast } from "@engli-tutor/ui";
import { queryKeys } from "@/lib/query";
import { billingMeQueryKey } from "@/features/payments";
import { referralsApi } from "../api/referrals-api";
import { useWorkspaceI18n } from "@/features/i18n";

const PENDING_REFERRAL_KEY = "englitutor-pending-referral";

function normalizeReferralCode(code: string | null | undefined) {
  return code?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
}

export function persistPendingReferral(code: string) {
  try {
    window.localStorage.setItem(PENDING_REFERRAL_KEY, code);
  } catch {
    // Ignore storage failures; referral can still be entered manually.
  }
}

function readPendingReferral() {
  try {
    return normalizeReferralCode(window.localStorage.getItem(PENDING_REFERRAL_KEY));
  } catch {
    return "";
  }
}

function clearPendingReferral() {
  try {
    window.localStorage.removeItem(PENDING_REFERRAL_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function shouldClear(error: unknown) {
  return error instanceof ApiError && [400, 404, 409].includes(error.status);
}

export function usePendingReferral(enabled: boolean) {
  const pathname = usePathname();
  const { toast } = useToast();
  const t = useWorkspaceI18n();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const inFlight = useRef<string | null>(null);

  useEffect(() => {
    const fromUrl = normalizeReferralCode(searchParams.get("ref"));
    if (fromUrl) persistPendingReferral(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    // Login redirects after authentication; redeem on the destination to avoid
    // aborting the request or losing feedback during the full-page navigation.
    if (!enabled || pathname === "/login" || typeof window === "undefined") return;
    const code = readPendingReferral();
    if (!code || inFlight.current === code) return;

    inFlight.current = code;
    referralsApi
      .redeem(code)
      .then(async (result) => {
        clearPendingReferral();
        toast({ title: t("settings.referral.redeemedTitle"), description: t("settings.referral.redeemedDescription", { days: result.referredDays }), tone: "success" });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.referrals.me }),
          queryClient.invalidateQueries({ queryKey: billingMeQueryKey }),
        ]);
      })
      .catch((error) => {
        if (shouldClear(error)) clearPendingReferral();
        toast({ title: t("settings.referral.notRedeemedTitle"), description: error instanceof Error ? error.message : t("settings.referral.notRedeemedDescription") });
      })
      .finally(() => {
        inFlight.current = null;
      });
  }, [enabled, pathname, queryClient, searchParams, t, toast]);
}
