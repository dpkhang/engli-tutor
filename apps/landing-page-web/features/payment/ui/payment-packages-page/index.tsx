"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { getAppUrl } from "@/features/auth/model/session";
import { getPlanById, PLANS } from "@/features/marketing/model/plans";
import { billingApi } from "@/features/payment/api/billing";
import { useBillingMe } from "@/features/payment/hooks/use-billing-me";
import { PaymentPackagesPageView } from "./payment-packages-page.view";

export function PaymentPackagesPage() {
  const searchParams = useSearchParams();
  const queriedPlan = searchParams.get("plan");
  const highlighted = getPlanById(queriedPlan).id;
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const { isLoggedIn, ready: authReady } = useAuthSession();
  const billing = useBillingMe(isLoggedIn);

  useEffect(() => {
    if (checkoutState !== "success" || !isLoggedIn) return;

    let cancelled = false;
    (async () => {
      try {
        if (sessionId) await billingApi.confirm(sessionId);
      } catch {
        // Webhook may already have applied; still refetch below.
      } finally {
        if (!cancelled) await billing.refetch();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once per success redirect
  }, [checkoutState, sessionId, isLoggedIn]);

  return (
    <PaymentPackagesPageView
      plans={PLANS}
      queriedPlan={queriedPlan}
      highlighted={highlighted}
      checkoutState={checkoutState}
      checkoutType={checkoutType}
      authReady={authReady}
      isLoggedIn={isLoggedIn}
      billing={billing.data}
      billingLoading={billing.isLoading}
      workspaceUrl={getAppUrl()}
    />
  );
}
