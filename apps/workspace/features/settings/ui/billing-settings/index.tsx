"use client";

import { useMemo } from "react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import {
  allPlansForCompare,
  currentPlanDetails,
  currentPlanId,
  formatBillingDate,
  formatBillingDateTime,
  formatVnd,
  LEDGER_REASON_LABEL,
  PERIOD_LABEL,
  STATUS_LABEL,
  summarizeLedger,
} from "@/features/payments/model/plans";
import {
  BillingSettingsView,
  type BillingFact,
  type BillingLedgerRow,
  type BillingOtherPlan,
} from "./billing-settings.view";

export function BillingSettings() {
  const billing = useBillingMe();
  const data = billing.data;
  const ready = billing.isSuccess || billing.isError;
  const plan = useMemo(() => currentPlanDetails(data), [data]);
  const planId = currentPlanId(data);
  const catalogPlan = data?.subscriptionPlans.find((item) => item.id === planId);
  const hasPaidPlan = Boolean(data?.hasPaidPlan);
  const subscription = data?.subscription;
  const ledger = data?.ledger ?? [];
  const summary = useMemo(() => summarizeLedger(ledger), [ledger]);

  const facts = useMemo((): BillingFact[] => {
    const rows: BillingFact[] = [];
    const status = subscription?.status;
    if (status) {
      rows.push({
        label: "Status",
        value: STATUS_LABEL[status] ?? status,
      });
    }
    if (hasPaidPlan && subscription?.billingPeriod) {
      rows.push({
        label: "Billing cycle",
        value: PERIOD_LABEL[subscription.billingPeriod] ?? subscription.billingPeriod,
      });
    }
    const monthly = catalogPlan?.priceVndMonthly ?? 0;
    if (hasPaidPlan && monthly > 0) {
      const yearly = subscription?.billingPeriod === "yearly";
      rows.push({
        label: "Price",
        value: yearly ? `${formatVnd(monthly * 10)} / year` : `${formatVnd(monthly)} / month`,
      });
    } else {
      rows.push({ label: "Price", value: "Free" });
    }
    if (hasPaidPlan && subscription?.currentPeriodEnd) {
      rows.push({
        label: "Next renewal",
        value: formatBillingDate(subscription.currentPeriodEnd),
      });
    }
    const creditsPerPeriod = subscription?.creditsPerPeriod || catalogPlan?.creditsPerPeriod || 0;
    if (creditsPerPeriod > 0) {
      rows.push({
        label: "Credits each period",
        value: `${creditsPerPeriod.toLocaleString("en-US")} practice credits`,
      });
    } else if (data?.signupBonus) {
      rows.push({
        label: "Welcome credits",
        value: `${data.signupBonus.toLocaleString("en-US")} practice credits`,
      });
    }
    return rows;
  }, [catalogPlan, data?.signupBonus, hasPaidPlan, subscription]);

  const ledgerRows = useMemo((): BillingLedgerRow[] => {
    return ledger.slice(0, 12).map((entry) => ({
      id: entry.id,
      title: LEDGER_REASON_LABEL[entry.reason] ?? entry.reason,
      date: formatBillingDateTime(entry.createdAt),
      delta: entry.delta,
      balanceAfter: entry.balanceAfter,
    }));
  }, [ledger]);

  const otherPlans = useMemo((): BillingOtherPlan[] => {
    return allPlansForCompare(data?.subscriptionPlans ?? [])
      .filter((item) => item.id !== planId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.isFree ? "Free" : `${formatVnd(item.priceVndMonthly)} / month`,
        credits:
          item.creditsPerPeriod > 0
            ? `${item.creditsPerPeriod.toLocaleString("en-US")} credits / period`
            : "Starter practice credits",
        featured: Boolean(item.featured),
      }));
  }, [data?.subscriptionPlans, planId]);

  return (
    <BillingSettingsView
      ready={ready}
      planName={plan.name}
      planDescription={plan.description}
      hasPaidPlan={hasPaidPlan}
      features={plan.features}
      facts={facts}
      balance={data?.balance ?? 0}
      signupBonus={data?.signupBonus ?? 0}
      creditsAdded={summary.added}
      creditsSpent={summary.spent}
      ledgerRows={ledgerRows}
      otherPlans={otherPlans}
    />
  );
}
