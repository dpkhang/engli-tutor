"use client";

import { useMemo } from "react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import {
  accessNote,
  allPlansForCompare,
  currentPlanDetails,
  currentPlanId,
  formatBillingDate,
  formatVnd,
  planPeriodPrice,
  PERIOD_LABEL,
  PERIOD_SUFFIX,
  STATUS_LABEL,
  usageRows,
} from "@/features/payments/model/plans";
import {
  BillingSettingsView,
  type BillingFact,
  type BillingOtherPlan,
  type BillingUsageRow,
} from "./billing-settings.view";

export function BillingSettings() {
  const billing = useBillingMe();
  const data = billing.data;
  const ready = billing.isSuccess || billing.isError;
  const plan = useMemo(() => currentPlanDetails(data), [data]);
  const planId = currentPlanId(data);
  const hasPaidPlan = Boolean(data?.hasPaidPlan);
  const hasPremiumAccess = hasPaidPlan || Boolean(data?.entitlements?.proUntil);
  const subscription = data?.subscription;
  const catalogPlan = data?.subscriptionPlans.find((item) => item.id === subscription?.planId);

  const facts = useMemo((): BillingFact[] => {
    const rows: BillingFact[] = [];
    const status = subscription?.status;
    if (status) {
      rows.push({
        label: "Status",
        value: STATUS_LABEL[status] ?? status,
      });
    }
    const note = accessNote(data);
    if (note) rows.push({ label: "Premium access", value: note });
    if (hasPaidPlan && subscription?.billingPeriod) {
      rows.push({
        label: "Billing cycle",
        value: PERIOD_LABEL[subscription.billingPeriod] ?? subscription.billingPeriod,
      });
    }
    if (hasPaidPlan && catalogPlan && catalogPlan.priceVndMonthly > 0) {
      const period = subscription?.billingPeriod ?? "monthly";
      rows.push({
        label: "Price",
        value: `${formatVnd(planPeriodPrice(catalogPlan, period))} ${PERIOD_SUFFIX[period]}`,
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
    return rows;
  }, [catalogPlan, data, hasPaidPlan, subscription]);

  const usage = useMemo(
    (): BillingUsageRow[] =>
      usageRows(data).map((row) => ({
        id: row.metric,
        label: row.label,
        value: row.limit === null ? "Unlimited" : `${row.used} / ${row.limit}`,
      })),
    [data],
  );

  const otherPlans = useMemo((): BillingOtherPlan[] => {
    return allPlansForCompare(data?.subscriptionPlans ?? [])
      .filter((item) => item.id !== planId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.isFree ? "Free" : `${formatVnd(item.priceVndMonthly)} / month`,
        summary: item.features[0] ?? "",
        featured: Boolean(item.featured),
      }));
  }, [data?.subscriptionPlans, planId]);

  return (
    <BillingSettingsView
      ready={ready}
      planName={plan.name}
      planDescription={plan.description}
      hasPaidPlan={hasPremiumAccess}
      features={plan.features}
      facts={facts}
      usage={usage}
      otherPlans={otherPlans}
    />
  );
}
