"use client";

import { SegmentedSwitch } from "@engli-tutor/ui";
import type { BillingPeriod } from "../api/billing";
import { BILLING_PERIODS, PERIOD_LABEL } from "../model/plans";

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
  return (
    <SegmentedSwitch
      value={value}
      onChange={onChange}
      ariaLabel="Billing period"
      disabled={disabled}
      className={className}
      options={BILLING_PERIODS.map((period) => ({
        id: period,
        label: PERIOD_LABEL[period],
        badge: PERIOD_BADGE[period],
      }))}
    />
  );
}
