"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { peekWelcomePending, clearWelcomePending, WELCOME_PATH } from "@/features/onboarding";
import { billingApi } from "../../api/billing";
import { billingMeQueryKey } from "../../hooks/use-billing";
import { PaymentResultPageView, type PaymentResultState } from "./payment-result-page.view";
import { getPathLocale, withLocalePath } from "@/lib/locale-path";
import { useWorkspaceI18n } from "@/features/i18n";

const PLAN_NAMES: Record<string, string> = {
  growth: "Standard",
  scale: "Premium",
};

export function PaymentResultPage() {
  const t = useWorkspaceI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = getPathLocale(pathname);
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const itemId = searchParams.get("item");
  const checkoutType = searchParams.get("type");
  const failureMessage = searchParams.get("message");
  const [state, setState] = useState<PaymentResultState>(checkout === "success" ? "processing" : "failed");
  const [message, setMessage] = useState(
    checkout === "success"
      ? t("billing.result.confirming")
      : failureMessage ??
          (checkout === "cancel"
            ? t("billing.result.canceledMessage")
            : t("billing.result.failedMessage")),
  );
  const [confirmedPlanId, setConfirmedPlanId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (checkout !== "success") {
      clearWelcomePending();
      return;
    }
    if (!sessionId && !(checkoutType === "upgrade" && itemId)) {
      clearWelcomePending();
      setState("failed");
      setMessage(t("billing.result.noSession"));
      return;
    }

    let cancelled = false;
    (async () => {
      const applySuccess = (result: { planId?: string | null }) => {
        setConfirmedPlanId(result.planId ?? itemId ?? null);
        if (peekWelcomePending()) {
          router.replace(withLocalePath(WELCOME_PATH, locale));
          return;
        }
        setState("success");
        setMessage(
          checkoutType === "upgrade"
            ? t("billing.page.upgradeSuccess")
            : t("billing.result.activeMessage"),
        );
      };

      try {
        const result = await billingApi.confirm(
          checkoutType === "upgrade" && !sessionId
            ? { planId: itemId ?? undefined }
            : { sessionId: sessionId ?? undefined },
        );
        if (cancelled) return;
        applySuccess(result);
        try {
          await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
          await queryClient.refetchQueries({ queryKey: billingMeQueryKey });
        } catch {
          /* Payment already confirmed — don't flip the success screen. */
        }
      } catch (error: unknown) {
        if (cancelled) return;
        try {
          const me = await billingApi.me();
          if (cancelled) return;
          const upgraded =
            checkoutType === "upgrade" && Boolean(itemId) && me.subscription.planId === itemId;
          const paid = checkoutType !== "upgrade" && me.hasPaidPlan;
          if (upgraded || paid) {
            applySuccess({ planId: me.subscription.planId });
            return;
          }
        } catch {
          /* Fall through to the confirm error. */
        }
        setState("failed");
        setMessage(error instanceof Error ? error.message : t("billing.result.confirmError"));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- confirm once per checkout redirect, not on locale change
  }, [checkout, checkoutType, itemId, queryClient, router, sessionId]);

  useEffect(() => {
    if (state !== "success") return;
    if (peekWelcomePending()) {
      router.replace(withLocalePath(WELCOME_PATH, locale));
      return;
    }
    if (countdown <= 0) {
      router.replace(withLocalePath("/skills", locale));
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown, router, state]);

  const packageName = useMemo(
    () => PLAN_NAMES[confirmedPlanId ?? itemId ?? ""] ?? t("billing.result.selectedPlan"),
    [confirmedPlanId, itemId, t],
  );

  return (
    <PaymentResultPageView
      state={state}
      message={message}
      checkoutType={checkoutType}
      packageName={packageName}
      countdown={countdown}
    />
  );
}
