"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BillingPeriod, SubscriptionPlan } from "../../api/billing";
import { useBillingMe, useSubscribe, useUpgradePlan } from "../../hooks/use-billing";
import { useWorkspaceI18n } from "@/features/i18n";
import { allPlansForCompare, currentPlanDetails } from "../../model/plans";
import { UpgradePlansModal } from "../upgrade-plans-modal";

type UpgradeModalContextValue = { openUpgradeModal: () => void };
const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) throw new Error("useUpgradeModal must be used inside UpgradeModalProvider");
  return context;
}

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const t = useWorkspaceI18n();
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const billing = useBillingMe(open);
  const subscribe = useSubscribe();
  const upgrade = useUpgradePlan();
  const data = billing.data;
  const hasPaidPlan = data?.hasPaidPlan ?? false;
  const plans = useMemo(() => {
    const all = allPlansForCompare(data?.subscriptionPlans ?? [], t);
    if (!hasPaidPlan) return all.filter((plan) => !plan.isFree);
    const index = all.findIndex((plan) => plan.id === data?.subscription.planId);
    return index < 0 ? all.filter((plan) => !plan.isFree) : all.slice(index + 1);
  }, [data, hasPaidPlan, t]);

  const redirectCheckout = useCallback((url: string | null) => {
    if (!url) throw new Error(t("billing.error.noCheckoutUrl"));
    window.location.assign(url);
  }, [t]);

  const onSubscribe = useCallback(async (planId: SubscriptionPlan["id"]) => {
    setError(null);
    setPending(`sub-${planId}`);
    try {
      const result = await subscribe.mutateAsync({ planId, period });
      redirectCheckout(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("billing.error.checkout"));
    } finally {
      setPending(null);
    }
  }, [period, redirectCheckout, subscribe, t]);

  const onUpgrade = useCallback(async (planId: SubscriptionPlan["id"]) => {
    setError(null);
    setPending(`up-${planId}`);
    try {
      const result = await upgrade.mutateAsync(planId);
      redirectCheckout(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("billing.error.checkout"));
    } finally {
      setPending(null);
    }
  }, [redirectCheckout, t, upgrade]);

  const close = useCallback(() => {
    if (!pending) {
      setOpen(false);
      setError(null);
    }
  }, [pending]);

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal: () => { setError(null); setOpen(true); } }}>
      {children}
      <UpgradePlansModal
        open={open}
        plans={plans}
        hasPaidPlan={hasPaidPlan}
        activePlanName={currentPlanDetails(data, t).name}
        billingPeriod={data?.subscription.billingPeriod}
        period={period}
        stripeReady={data?.stripeConfigured ?? false}
        pending={pending}
        loading={billing.isLoading}
        error={error}
        onPeriodChange={setPeriod}
        onSubscribe={(planId) => void onSubscribe(planId)}
        onUpgrade={(planId) => void onUpgrade(planId)}
        onClose={close}
      />
    </UpgradeModalContext.Provider>
  );
}
