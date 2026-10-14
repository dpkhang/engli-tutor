"use client";

import { SegmentedSwitch } from "@engli-tutor/ui";
import type { BillingPeriod } from "../../api/billing";
import { useWorkspaceI18n } from "@/features/i18n";
import { BILLING_PERIODS, PERIOD_LABEL_KEY } from "../../model/plans";

const PERIOD_BADGE: Partial<Record<BillingPeriod, string>> = {
  quarterly: "−15%",
  yearly: "−40%",
};

export function PlanPeriodSwitch({
  value,
  onChange,
  className,
  disabled,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  className?: string;
  disabled?: boolean;
}) {
  const t = useWorkspaceI18n();
  return (
    <SegmentedSwitch
      value={value}
      onChange={onChange}
      ariaLabel={t("checkout.billingPeriod")}
      disabled={disabled}
      className={className}
      options={BILLING_PERIODS.map((period) => ({
        id: period,
        label: t(PERIOD_LABEL_KEY[period]),
        badge: PERIOD_BADGE[period],
      }))}
    />
  );
}
