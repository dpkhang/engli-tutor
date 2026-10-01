"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getAppUrl, getMarketingAuthHref } from "@/features/auth";
import {
  getBillingTotal,
  getPlanById,
  isPaidPlan,
  plansFromCatalog,
  type BillingPeriod,
  type PlanId,
} from "@/features/marketing";
import { billingApi } from "../../api/billing";
import { useBillingMe } from "../../hooks/use-billing-me";
import { useBillingCatalog } from "../../hooks/use-billing-catalog";
import { PaymentCheckoutPageView } from "./payment-checkout-page.view";

export function PaymentCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalog = useBillingCatalog();
  const plans = useMemo(() => plansFromCatalog(catalog.data), [catalog.data]);
  const planParam = searchParams.get("plan");
  const plan = useMemo(() => getPlanById(planParam, plans), [planParam, plans]);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending: sessionPending } = useSession();
  const billingMe = useBillingMe(Boolean(session?.user));

  const billing = useMemo(() => getBillingTotal(plan, period), [plan, period]);
  const isFree = plan.priceValue === 0;
  const paidPlan = isPaidPlan(plan.id);
  const ownedPlan = useMemo(
    () =>
      billingMe.data?.hasPaidPlan
        ? getPlanById(billingMe.data.subscription.planId, plans)
        : null,
    [billingMe.data, plans],
  );
  const upgradePlans = useMemo(
    () =>
      ownedPlan
        ? plans
            .filter((candidate) => candidate.priceValue > ownedPlan.priceValue)
            .sort((left, right) => left.priceValue - right.priceValue)
        : [],
    [ownedPlan, plans],
  );

  useEffect(() => {
    if (sessionPending || catalog.isLoading) return;
    if (catalog.error && searchParams.get("plan") !== "starter") return;
    if (isFree) {
      router.replace(getMarketingAuthHref());
      return;
    }
    if (!session?.user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(getMarketingAuthHref(returnTo));
    }
  }, [catalog.error, catalog.isLoading, isFree, searchParams, session?.user, sessionPending, router]);

  const onSubscribe = useCallback(async () => {
    if (!paidPlan) return;
    setError(null);
    setPending(true);
    try {
      const result = await billingApi.subscribe(plan.id, period);
      if (!result.url) {
        setError("Stripe did not return a checkout URL");
        return;
      }
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a checkout session");
    } finally {
      setPending(false);
    }
  }, [paidPlan, period, plan.id]);

  const onUpgrade = useCallback(async (planId: PlanId) => {
    if (!isPaidPlan(planId)) return;
    setError(null);
    setPending(true);
    try {
      const result = await billingApi.upgrade(planId);
      if (!result.url) {
        setError("Stripe did not return an upgrade URL");
        return;
      }
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create an upgrade session");
    } finally {
      setPending(false);
    }
  }, []);

  return (
    <PaymentCheckoutPageView
      plan={plan}
      period={period}
      billing={billing}
      isFree={isFree}
      pending={pending}
      error={error ?? catalog.error?.message ?? billingMe.error?.message ?? null}
      workspaceUrl={getAppUrl()}
      checkingBilling={
        sessionPending ||
        catalog.isLoading ||
        !session?.user ||
        billingMe.isLoading ||
        (!billingMe.data && !billingMe.error)
      }
      ownedPlan={ownedPlan}
      upgradePlans={upgradePlans}
      ownedSubscription={ownedPlan && billingMe.data ? billingMe.data.subscription : null}
      dailyChatLimit={billingMe.data?.entitlements?.limits.tutorChatPerDay}
      chatsUsedToday={billingMe.data?.usage?.tutor_chat ?? null}
      onPeriodChange={setPeriod}
      onSubscribe={onSubscribe}
      onUpgrade={onUpgrade}
    />
  );
}
