"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useBillingMe,
  useConfirmCheckout,
  useStartTrial,
  useSubscribe,
  useUpgradePlan,
} from "../../hooks/use-billing";
import type { BillingPeriod, SubscriptionPlan } from "../../api/billing";
import {
  accessNote,
  allPlansForCompare,
  currentPlanDetails,
  usageRows,
} from "../../model/plans";
import { useWorkspaceI18n } from "@/features/i18n";
import { PaymentsPageView } from "./payments-page.view";

export function PaymentsPage() {
  const t = useWorkspaceI18n();
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const billing = useBillingMe();
  const subscribe = useSubscribe();
  const upgrade = useUpgradePlan();
  const startTrial = useStartTrial();
  const confirmCheckout = useConfirmCheckout();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  useEffect(() => {
    if (checkoutState !== "success") return;

    let cancelled = false;
    (async () => {
      try {
        if (sessionId) {
          await confirmCheckout.mutateAsync({ sessionId });
        }
      } catch (err) {
        if (cancelled) return;
        const latest = await billing.refetch();
        if (latest.data?.hasPaidPlan) return;
        setError(
          err instanceof Error ? err.message : t("billing.error.syncPayment"),
        );
      } finally {
        if (!cancelled) await billing.refetch();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per success redirect
  }, [checkoutState, sessionId]);

  const data = billing.data;
  const hasPaidPlan = data?.hasPaidPlan ?? false;
  const stripeReady = data?.stripeConfigured ?? false;
  const activePlan = currentPlanDetails(data, t);
  const comparePlans = useMemo(
    () => allPlansForCompare(data?.subscriptionPlans ?? [], t),
    [data?.subscriptionPlans, t],
  );
  const higherPlans = useMemo(() => {
    const paid = comparePlans.filter((plan) => !plan.isFree);
    if (!hasPaidPlan) return paid;
    const index = comparePlans.findIndex((plan) => plan.id === data?.subscription.planId);
    return index < 0 ? paid : comparePlans.slice(index + 1);
  }, [comparePlans, data?.subscription.planId, hasPaidPlan]);
  const usage = useMemo(() => usageRows(data), [data]);
  const canStartTrial = Boolean(data?.entitlements?.trialAvailable && !hasPaidPlan);

  const redirectCheckout = useCallback(async (url: string | null) => {
    if (!url) {
      setError(t("billing.error.noCheckoutUrl"));
      return;
    }
    window.location.assign(url);
  }, [t]);

  const onSubscribe = useCallback(
    async (planId: SubscriptionPlan["id"]) => {
      setError(null);
      setPending(`sub-${planId}`);
      try {
        const result = await subscribe.mutateAsync({ planId, period });
        await redirectCheckout(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("billing.error.subscribe"));
      } finally {
        setPending(null);
      }
    },
    [period, redirectCheckout, subscribe, t],
  );

  const onUpgrade = useCallback(
    async (planId: SubscriptionPlan["id"]) => {
      setError(null);
      setPending(`up-${planId}`);
      try {
        const result = await upgrade.mutateAsync(planId);
        await redirectCheckout(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("billing.error.upgrade"));
      } finally {
        setPending(null);
      }
    },
    [redirectCheckout, t, upgrade],
  );

  const onStartTrial = useCallback(async () => {
    setError(null);
    setPending("trial");
    try {
      await startTrial.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("billing.error.trial"));
    } finally {
      setPending(null);
    }
  }, [startTrial, t]);

  const onOpenUpgrade = useCallback(() => setShowUpgradeOptions(true), []);
  const onCloseUpgrade = useCallback(() => setShowUpgradeOptions(false), []);

  return (
    <PaymentsPageView
      checkoutState={checkoutState}
      checkoutType={checkoutType}
      billingLoading={billing.isLoading}
      hasPaidPlan={hasPaidPlan}
      stripeReady={stripeReady}
      activePlan={activePlan}
      accessNote={accessNote(data, t)}
      usage={usage}
      trialDays={data?.trialDays ?? 7}
      canStartTrial={canStartTrial}
      subscriptionStatus={data?.subscription.status}
      billingPeriod={data?.subscription.billingPeriod}
      currentPeriodEnd={data?.subscription.currentPeriodEnd}
      higherPlans={higherPlans}
      period={period}
      error={error}
      pending={pending}
      showUpgradeOptions={showUpgradeOptions}
      onPeriodChange={setPeriod}
      onSubscribe={onSubscribe}
      onUpgrade={onUpgrade}
      onStartTrial={onStartTrial}
      onOpenUpgrade={onOpenUpgrade}
      onCloseUpgrade={onCloseUpgrade}
    />
  );
}
