"use client";

import { useMemo } from "react";
import { useBillingMe } from "@/features/payments";
import {
  allPlansForCompare,
  currentPlanDetails,
  formatVnd,
  planPeriodPrice,
  PERIOD_LABEL_KEY,
  PERIOD_SUFFIX_KEY,
  STATUS_LABEL_KEY,
  usageRows,
} from "@/features/payments";
import { useWorkspaceI18n, useWorkspaceLocale } from "@/features/i18n";
import { billingHistory, resolveBillingSummary } from "../../model/billing";
import {
  BillingSettingsView,
  type BillingFact,
  type BillingHistoryRow,
  type BillingOtherPlan,
  type BillingUsageRow,
} from "./billing-settings.view";

const SOURCE_KEYS = {
  subscription: "settings.overview.sourceSubscription",
  trial: "settings.overview.sourceTrial",
  bonus: "settings.overview.sourceBonus",
  free: "settings.overview.sourceFree",
} as const;

export function BillingSettings() {
  const t = useWorkspaceI18n();
  const locale = useWorkspaceLocale();
  const billing = useBillingMe();
  const data = billing.data;
  const ready = billing.isSuccess || billing.isError;
  const plan = useMemo(() => currentPlanDetails(data, t), [data, t]);
  const summary = useMemo(() => resolveBillingSummary(data), [data]);
  const history = useMemo(() => billingHistory(data), [data]);
  const planId = plan.id;
  const catalogPlan = data?.subscriptionPlans.find((item) => item.id === data.subscription.planId);

  const formatDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return (value: string) => formatter.format(new Date(value));
  }, [locale]);

  const facts = useMemo((): BillingFact[] => {
    if (!summary) return [];
    const rows: BillingFact[] = [];
    if (summary.status) {
      rows.push({
        id: "status",
        label: t("billing.settings.status"),
        value: STATUS_LABEL_KEY[summary.status] ? t(STATUS_LABEL_KEY[summary.status]) : summary.status,
      });
    }
    if (summary.period) {
      rows.push({
        id: "cycle",
        label: t("checkout.billingCycle"),
        value: PERIOD_LABEL_KEY[summary.period] ? t(PERIOD_LABEL_KEY[summary.period]) : summary.period,
      });
    }
    if (summary.source === "subscription" && catalogPlan && catalogPlan.priceVndMonthly > 0) {
      const period = summary.period ?? "monthly";
      rows.push({
        id: "price",
        label: t("billing.settings.price"),
        value: `${formatVnd(planPeriodPrice(catalogPlan, period))} ${t(PERIOD_SUFFIX_KEY[period])}`,
      });
    } else {
      rows.push({ id: "price", label: t("billing.settings.price"), value: t("workspace.free") });
    }
    if (summary.expiry) {
      rows.push({
        id: "expiry",
        label: t(summary.expiry.kind === "renews" ? "settings.billing.renewsOnLabel" : "settings.billing.endsOnLabel"),
        value: formatDate(summary.expiry.date),
      });
    }
    return rows;
  }, [catalogPlan, formatDate, summary, t]);

  const historyRows = useMemo(
    (): BillingHistoryRow[] =>
      history.map((entry) => ({
        id: entry.id,
        title:
          entry.kind === "trial"
            ? t("settings.billing.historyTrial")
            : entry.kind === "bonus"
              ? t("settings.billing.historyBonus")
              : entry.planName,
        status: entry.status ? (STATUS_LABEL_KEY[entry.status] ? t(STATUS_LABEL_KEY[entry.status]) : entry.status) : null,
        date:
          entry.date && entry.dateKind
            ? t(entry.dateKind === "renews" ? "settings.overview.renewsOn" : "settings.overview.endsOn", {
                date: formatDate(entry.date),
              })
            : null,
      })),
    [formatDate, history, t],
  );

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
      error={billing.isError && !data}
      onRetry={() => void billing.refetch()}
      planName={summary?.planName ?? plan.name}
      planDescription={plan.description}
      sourceLabel={t(SOURCE_KEYS[summary?.source ?? "free"])}
      isPremium={summary?.isPremium ?? false}
      ctaLabel={summary?.canUpgrade === false ? t("workspace.managePlan") : t("settings.billing.upgrade")}
      features={plan.features}
      facts={facts}
      history={historyRows}
      usage={usage}
      otherPlans={otherPlans}
    />
  );
}
