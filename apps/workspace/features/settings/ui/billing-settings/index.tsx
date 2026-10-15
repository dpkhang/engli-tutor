"use client";

import { useMemo } from "react";
import { useBillingMe } from "@/features/payments";
import {
  accessNote,
  allPlansForCompare,
  currentPlanDetails,
  currentPlanId,
  formatBillingDate,
  formatVnd,
  planPeriodPrice,
  PERIOD_LABEL_KEY,
  PERIOD_SUFFIX_KEY,
  STATUS_LABEL_KEY,
  usageRows,
} from "@/features/payments";
import { useWorkspaceI18n } from "@/features/i18n";
import {
  BillingSettingsView,
  type BillingFact,
  type BillingOtherPlan,
  type BillingUsageRow,
} from "./billing-settings.view";

export function BillingSettings() {
  const t = useWorkspaceI18n();
  const billing = useBillingMe();
  const data = billing.data;
  const ready = billing.isSuccess || billing.isError;
  const plan = useMemo(() => currentPlanDetails(data, t), [data, t]);
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
        label: t("billing.settings.status"),
        value: STATUS_LABEL_KEY[status] ? t(STATUS_LABEL_KEY[status]) : status,
      });
    }
    const note = accessNote(data, t);
    if (note) rows.push({ label: t("workspace.premiumAccess"), value: note });
    if (hasPaidPlan && subscription?.billingPeriod) {
      rows.push({
        label: t("checkout.billingCycle"),
        value: PERIOD_LABEL_KEY[subscription.billingPeriod]
          ? t(PERIOD_LABEL_KEY[subscription.billingPeriod])
          : subscription.billingPeriod,
      });
    }
    if (hasPaidPlan && catalogPlan && catalogPlan.priceVndMonthly > 0) {
      const period = subscription?.billingPeriod ?? "monthly";
      rows.push({
        label: t("billing.settings.price"),
        value: `${formatVnd(planPeriodPrice(catalogPlan, period))} ${t(PERIOD_SUFFIX_KEY[period])}`,
      });
    } else {
      rows.push({ label: t("billing.settings.price"), value: t("workspace.free") });
    }
    if (hasPaidPlan && subscription?.currentPeriodEnd) {
      rows.push({
        label: t("workspace.nextRenewal"),
        value: formatBillingDate(subscription.currentPeriodEnd),
      });
    }
    return rows;
  }, [catalogPlan, data, hasPaidPlan, subscription, t]);

  const usage = useMemo(
    (): BillingUsageRow[] =>
      usageRows(data).map((row) => ({
        id: row.metric,
        label: t(row.labelKey),
        value: row.limit === null ? t("checkout.unlimited") : `${row.used} / ${row.limit}`,
      })),
    [data, t],
  );

  const otherPlans = useMemo((): BillingOtherPlan[] => {
    return allPlansForCompare(data?.subscriptionPlans ?? [], t)
      .filter((item) => item.id !== planId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.isFree
          ? t("workspace.free")
          : `${formatVnd(item.priceVndMonthly)} ${t(PERIOD_SUFFIX_KEY.monthly)}`,
        summary: item.features[0] ?? "",
        featured: Boolean(item.featured),
      }));
  }, [data?.subscriptionPlans, planId, t]);

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
