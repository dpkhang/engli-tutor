"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppUrl, getAuthHref, getSiteUrl, useAuthSession } from "@/features/auth";
import { getPlanById, planCheckoutHref, plansFromCatalog, type PlanId } from "@/features/marketing";
import { billingApi } from "../../api/billing";
import { useBillingMe } from "../../hooks/use-billing-me";
import { useBillingCatalog } from "../../hooks/use-billing-catalog";
import { PaymentPackagesPageView } from "./payment-packages-page.view";
import { useMarketingI18n } from "@/features/i18n";

export function PaymentPackagesPage() {
  const t = useMarketingI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queriedPlan = searchParams.get("plan");
  const catalog = useBillingCatalog();
  const plans = useMemo(() => plansFromCatalog(catalog.data, t), [catalog.data, t]);
  const highlighted = getPlanById(queriedPlan, plans).id;
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const itemId = searchParams.get("item");
  const { isLoggedIn, ready: authReady } = useAuthSession();
  const billing = useBillingMe(isLoggedIn);
  const redirectingToCurrentPlan = Boolean(
    !authReady || catalog.isLoading || (isLoggedIn && (billing.isLoading || billing.data?.hasPaidPlan)),
  );
  const planHrefs = useMemo(
    () =>
      Object.fromEntries(
        plans.map((plan) => {
          const checkoutHref = planCheckoutHref(plan.id);
          if (isLoggedIn) return [plan.id, checkoutHref];
          if (plan.id === "starter") return [plan.id, getAuthHref("/")];
          return [plan.id, getAuthHref(`${getSiteUrl()}${checkoutHref}`)];
        }),
      ) as Record<PlanId, string>,
    [isLoggedIn, plans],
  );

  useEffect(() => {
    if (checkoutState !== "success" || !isLoggedIn) return;

    let cancelled = false;
    (async () => {
      try {
        if (sessionId) await billingApi.confirm({ sessionId });
        else if (checkoutType === "upgrade" && itemId) await billingApi.confirm({ planId: itemId });
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
  }, [checkoutState, checkoutType, itemId, sessionId, isLoggedIn]);

  useEffect(() => {
    if (checkoutState === "success") return;
    if (!billing.data?.hasPaidPlan) return;
    const currentPlan = billing.data.subscription.planId;
    router.replace(`/payment/checkout?plan=${currentPlan}`);
  }, [billing.data, checkoutState, router]);

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
