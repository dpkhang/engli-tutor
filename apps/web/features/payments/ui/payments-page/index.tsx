"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useBillingMe,
  useConfirmCheckout,
  useSubscribe,
  useTopupCheckout,
  useUpgradePlan,
} from "../../hooks/use-billing";
import type { CreditLedgerEntry, SubscriptionPlan, TopupPack } from "../../api/billing";
import { allPlansForCompare, currentPlanDetails, currentPlanId } from "../../model/plans";
import { PaymentsPageView } from "./payments-page.view";

const EMPTY_TOPUPS: TopupPack[] = [];
const EMPTY_LEDGER: CreditLedgerEntry[] = [];

export function PaymentsPage() {
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const billing = useBillingMe();
  const subscribe = useSubscribe();
  const upgrade = useUpgradePlan();
  const topup = useTopupCheckout();
  const confirmCheckout = useConfirmCheckout();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [customCredits, setCustomCredits] = useState(200);

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
        if (latest.data?.hasPaidPlan && checkoutType !== "topup") return;
        setError(
          err instanceof Error ? err.message : "Couldn't sync payment. Try refreshing the page.",
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
  const balance = data?.balance ?? 0;
  const activePlanId = currentPlanId(data);
  const activePlan = currentPlanDetails(data);
  const comparePlans = useMemo(
    () => allPlansForCompare(data?.subscriptionPlans ?? []),
    [data?.subscriptionPlans],
  );
  const activePlanIndex = comparePlans.findIndex((plan) => plan.id === activePlanId);
  const higherPlans = useMemo(
    () => (activePlanIndex < 0 ? [] : comparePlans.slice(activePlanIndex + 1)),
    [activePlanIndex, comparePlans],
  );

  const redirectCheckout = useCallback(async (url: string | null) => {
    if (!url) {
      setError("Stripe did not return a checkout URL");
      return;
    }
    window.location.assign(url);
  }, []);

  const onSubscribe = useCallback(
    async (planId: SubscriptionPlan["id"]) => {
      setError(null);
      setPending(`sub-${planId}`);
      try {
        const result = await subscribe.mutateAsync({ planId, period });
        await redirectCheckout(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't create subscription session");
      } finally {
        setPending(null);
      }
    },
    [period, redirectCheckout, subscribe],
  );

  const onUpgrade = useCallback(
    async (planId: SubscriptionPlan["id"]) => {
      setError(null);
      setPending(`up-${planId}`);
      try {
        const result = await upgrade.mutateAsync(planId);
        await redirectCheckout(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't upgrade plan");
      } finally {
        setPending(null);
      }
    },
    [redirectCheckout, upgrade],
  );

  const onTopup = useCallback(
    async (pack: TopupPack) => {
      setError(null);
      setPending(`top-${pack.id}`);
      try {
        const credits = pack.isCustom ? customCredits : undefined;
        const result = await topup.mutateAsync({ packId: pack.id, credits });
        await redirectCheckout(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't create payment session");
      } finally {
        setPending(null);
      }
    },
    [customCredits, redirectCheckout, topup],
  );

  const onOpenUpgrade = useCallback(() => setShowUpgradeOptions(true), []);
  const onCloseUpgrade = useCallback(() => setShowUpgradeOptions(false), []);

  return (
    <PaymentsPageView
      checkoutState={checkoutState}
      checkoutType={checkoutType}
      billingLoading={billing.isLoading}
      hasPaidPlan={hasPaidPlan}
      stripeReady={stripeReady}
      balance={balance}
      activePlan={activePlan}
      subscriptionStatus={data?.subscription.status}
      billingPeriod={data?.subscription.billingPeriod}
      currentPeriodEnd={data?.subscription.currentPeriodEnd}
      creditsPerPeriod={data?.subscription.creditsPerPeriod}
      signupBonus={data?.signupBonus}
      higherPlans={higherPlans}
      topupPacks={data?.topupPacks ?? EMPTY_TOPUPS}
      ledger={data?.ledger ?? EMPTY_LEDGER}
      period={period}
      error={error}
      pending={pending}
      showUpgradeOptions={showUpgradeOptions}
      customCredits={customCredits}
      onPeriodChange={setPeriod}
      onCustomCreditsChange={setCustomCredits}
      onSubscribe={onSubscribe}
      onUpgrade={onUpgrade}
      onTopup={onTopup}
      onOpenUpgrade={onOpenUpgrade}
      onCloseUpgrade={onCloseUpgrade}
    />
  );
}
