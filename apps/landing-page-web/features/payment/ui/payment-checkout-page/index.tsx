"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getAppUrl, getMarketingAuthHref } from "@/features/auth/model/session";
import {
  getBillingTotal,
  getPlanById,
  isPaidPlan,
  PLANS,
  type BillingPeriod,
  type PlanId,
} from "@/features/marketing/model/plans";
import { billingApi } from "@/features/payment/api/billing";
import { useBillingMe } from "@/features/payment/hooks/use-billing-me";
import { PaymentCheckoutPageView } from "./payment-checkout-page.view";

export function PaymentCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = useMemo(() => getPlanById(searchParams.get("plan")), [searchParams]);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending: sessionPending } = useSession();
  const billingMe = useBillingMe(Boolean(session?.user));

  const billing = useMemo(() => getBillingTotal(plan, period), [plan, period]);
  const isFree = plan.priceValue === 0;
  const paidPlan = isPaidPlan(plan.id);
  const ownedPlan = billingMe.data?.hasPaidPlan
    ? getPlanById(billingMe.data.subscription.planId)
    : null;
  const upgradePlans = ownedPlan
    ? PLANS.filter((candidate) => candidate.priceValue > ownedPlan.priceValue).sort(
        (left, right) => left.priceValue - right.priceValue,
      )
    : [];

  useEffect(() => {
    if (sessionPending) return;
    if (isFree) {
      router.replace(getMarketingAuthHref());
      return;
    }
    if (!session?.user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.replace(getMarketingAuthHref(returnTo));
    }
  }, [isFree, session?.user, sessionPending, router]);

  const onSubscribe = async () => {
    if (!paidPlan) return;
    setError(null);
    setPending(true);
    try {
      const result = await billingApi.subscribe(plan.id as "growth" | "scale", period);
      if (!result.url) {
        setError("Stripe không trả về URL thanh toán");
        return;
      }
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được phiên thanh toán");
    } finally {
      setPending(false);
    }
  };

  const onUpgrade = async (planId: PlanId) => {
    if (!isPaidPlan(planId)) return;
    setError(null);
    setPending(true);
    try {
      const result = await billingApi.upgrade(planId);
      if (!result.url) {
        setError("Stripe không trả về URL nâng cấp");
        return;
      }
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được phiên nâng cấp");
    } finally {
      setPending(false);
    }
  };

  return (
    <PaymentCheckoutPageView
      plan={plan}
      period={period}
      billing={billing}
      isFree={isFree}
      pending={pending}
      error={error ?? billingMe.error?.message ?? null}
      workspaceUrl={getAppUrl()}
      checkingBilling={
        sessionPending ||
        !session?.user ||
        billingMe.isLoading ||
        (!billingMe.data && !billingMe.error)
      }
      ownedPlan={ownedPlan}
      upgradePlans={upgradePlans}
      ownedSubscription={ownedPlan && billingMe.data ? billingMe.data.subscription : null}
      creditBalance={ownedPlan ? (billingMe.data?.balance ?? null) : null}
      onPeriodChange={setPeriod}
      onSubscribe={() => void onSubscribe()}
      onUpgrade={(planId) => void onUpgrade(planId)}
    />
  );
}
