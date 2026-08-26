"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { getAppUrl, getAuthHref, getSiteUrl } from "@/features/auth/model/session";
import { getPlanById, planCheckoutHref, plansFromCatalog, type PlanId } from "@/features/marketing/model/plans";
import { billingApi } from "@/features/payment/api/billing";
import { useBillingMe } from "@/features/payment/hooks/use-billing-me";
import { useBillingCatalog } from "@/features/payment/hooks/use-billing-catalog";
import { PaymentPackagesPageView } from "./payment-packages-page.view";

export function PaymentPackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queriedPlan = searchParams.get("plan");
  const catalog = useBillingCatalog();
  const plans = plansFromCatalog(catalog.data);
  const highlighted = getPlanById(queriedPlan, plans).id;
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const { isLoggedIn, ready: authReady } = useAuthSession();
  const billing = useBillingMe(isLoggedIn);
  const redirectingToCurrentPlan = Boolean(
    !authReady || catalog.isLoading || (isLoggedIn && (billing.isLoading || billing.data?.hasPaidPlan)),
  );
  const planHrefs = Object.fromEntries(
    plans.map((plan) => {
      const checkoutHref = planCheckoutHref(plan.id);
      if (isLoggedIn) return [plan.id, checkoutHref];
      if (plan.id === "starter") return [plan.id, getAuthHref("/")];
      return [plan.id, getAuthHref(`${getSiteUrl()}${checkoutHref}`)];
    }),
  ) as Record<PlanId, string>;

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

  useEffect(() => {
    if (!billing.data?.hasPaidPlan) return;
    const currentPlan = billing.data.subscription.planId;
    router.replace(`/payment/checkout?plan=${currentPlan}`);
  }, [billing.data, router]);

  return (
    <PaymentPackagesPageView
      plans={plans}
      queriedPlan={queriedPlan}
      highlighted={highlighted}
      checkoutState={checkoutState}
      checkoutType={checkoutType}
      authReady={authReady}
      isLoggedIn={isLoggedIn}
      billing={billing.data}
      billingLoading={billing.isLoading}
      workspaceUrl={getAppUrl()}
      planHrefs={planHrefs}
      redirectingToCurrentPlan={redirectingToCurrentPlan}
    />
  );
}
