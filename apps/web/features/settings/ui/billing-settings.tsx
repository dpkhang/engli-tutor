"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  Badge,
  Button,
  CardTitle,
} from "@landing-page-generator/ui";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import { currentPlanDetails } from "@/features/payments/model/plans";
import { SettingsPanel } from "./settings-panel";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "./settings-card";

export function BillingSettings() {
  const billing = useBillingMe();
  const ready = billing.isSuccess || billing.isError;
  const plan = currentPlanDetails(billing.data);
  const periodEnd = billing.data?.subscription.currentPeriodEnd
    ? new Date(billing.data.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <SettingsPanel ready={ready}>
      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" /> Plan & billing
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight">{plan.name}</p>
            <Badge variant={billing.data?.hasPaidPlan ? "default" : "secondary"}>
              {billing.data?.hasPaidPlan ? "Paid" : "Free"}
            </Badge>
          </div>
          <dl className="grid gap-1.5 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <dt>Credits</dt>
              <dd className="font-medium text-foreground">{billing.data?.balance ?? "—"}</dd>
            </div>
            {periodEnd ? (
              <div className="flex justify-between gap-3">
                <dt>Current period ends</dt>
                <dd className="font-medium text-foreground">{periodEnd}</dd>
              </div>
            ) : null}
          </dl>
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href="/payments">Manage plan</Link>
          </Button>
        </SettingsCardContent>
      </SettingsCard>
    </SettingsPanel>
  );
}
