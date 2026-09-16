"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { peekWelcomePending, clearWelcomePending, WELCOME_PATH } from "@/features/onboarding";
import { billingApi, type BillingMe } from "../../api/billing";
import { billingMeQueryKey } from "../../hooks/use-billing";
import { PaymentResultPageView, type PaymentResultState } from "./payment-result-page.view";

const PLAN_NAMES: Record<string, string> = {
  growth: "Standard",
  scale: "Premium",
  "boost-100": "Boost 100",
  "boost-500": "Boost 500",
  "boost-1500": "Boost 1500",
  custom: "Custom top-up",
};

export function PaymentResultPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const itemId = searchParams.get("item");
  const checkoutType = searchParams.get("type");
  const failureMessage = searchParams.get("message");
  const [state, setState] = useState<PaymentResultState>(checkout === "success" ? "processing" : "failed");
  const [message, setMessage] = useState(
    checkout === "success"
      ? "We're confirming your payment with Stripe. Please keep this page open."
      : failureMessage ??
          (checkout === "cancel"
            ? "You canceled checkout. Your account was not charged and your current plan is unchanged."
            : "Payment did not complete. Please check your payment details and try again."),
  );
  const [confirmedPlanId, setConfirmedPlanId] = useState<string | null>(null);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (checkout !== "success") {
      clearWelcomePending();
      return;
    }
    if (!sessionId && !(checkoutType === "upgrade" && itemId)) {
      clearWelcomePending();
      setState("failed");
      setMessage("Payment session id not found. Please try again from the payments page.");
      return;
    }

    let cancelled = false;
    (async () => {
      const applySuccess = (result: {
        planId?: string | null;
        balanceAfter?: number;
        topup?: boolean;
      }) => {
        setConfirmedPlanId(result.planId ?? itemId ?? null);
        if (typeof result.balanceAfter === "number") {
          setBalanceAfter(result.balanceAfter);
          queryClient.setQueryData(billingMeQueryKey, (current: BillingMe | undefined) => {
            if (!current) return current;
            return { ...current, balance: result.balanceAfter! };
          });
        }
        if (peekWelcomePending()) {
          router.replace(WELCOME_PATH);
          return;
        }
        setState("success");
        setMessage(
          checkoutType === "topup"
            ? typeof result.balanceAfter === "number"
              ? `Credits have been added. Your new balance is ${result.balanceAfter}.`
              : "Credits have been added to your account and are ready to use."
            : checkoutType === "upgrade"
              ? typeof result.balanceAfter === "number"
                ? `Your plan is upgraded. New balance: ${result.balanceAfter} credits.`
                : "Your plan is upgraded and extra practice credits have been added."
              : "Your plan is active and benefits have been updated.",
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
          const paid = checkoutType !== "topup" && checkoutType !== "upgrade" && me.hasPaidPlan;
          if (upgraded || paid) {
            applySuccess({
              planId: me.subscription.planId,
              balanceAfter: me.balance,
              topup: checkoutType === "topup",
            });
            return;
          }
        } catch {
          /* Fall through to the confirm error. */
        }
        setState("failed");
        setMessage(error instanceof Error ? error.message : "Couldn't confirm payment. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkout, checkoutType, itemId, queryClient, router, sessionId]);

  useEffect(() => {
    if (state !== "success") return;
    if (peekWelcomePending()) {
      router.replace(WELCOME_PATH);
      return;
    }
    if (countdown <= 0) {
      router.replace(checkoutType === "topup" ? "/payments" : "/skills");
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [checkoutType, countdown, router, state]);

  const packageName = useMemo(
    () => PLAN_NAMES[confirmedPlanId ?? itemId ?? ""] ?? "selected plan",
    [confirmedPlanId, itemId],
  );

  return (
    <PaymentResultPageView
      state={state}
      message={message}
      checkoutType={checkoutType}
      packageName={packageName}
      balanceAfter={balanceAfter}
      countdown={countdown}
    />
  );
}
