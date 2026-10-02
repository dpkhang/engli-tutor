"use client";

import { memo } from "react";
import Link from "next/link";
import { Check, CreditCard, Crown, Gauge, Sparkles } from "lucide-react";
import { Badge, Button, CardTitle } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

export type BillingFact = {
  label: string;
  value: string;
};

export type BillingUsageRow = {
  id: string;
  label: string;
  value: string;
};

export type BillingOtherPlan = {
  id: string;
  name: string;
  price: string;
  summary: string;
  featured?: boolean;
};

export type BillingSettingsViewProps = {
  ready: boolean;
  planName: string;
  planDescription: string;
  hasPaidPlan: boolean;
  features: string[];
  facts: BillingFact[];
  usage: BillingUsageRow[];
  otherPlans: BillingOtherPlan[];
};

export const BillingSettingsView = memo(function BillingSettingsView({
  ready,
  planName,
  planDescription,
  hasPaidPlan,
  features,
  facts,
  usage,
  otherPlans,
}: BillingSettingsViewProps) {
  const t = useWorkspaceI18n();
  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" /> {t("workspace.currentPlan")}
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight">{planName}</p>
            <Badge variant={hasPaidPlan ? "default" : "secondary"} className="gap-1">
              {hasPaidPlan ? <Crown className="size-3" /> : null}
              {hasPaidPlan ? t("workspace.premiumAccess") : t("workspace.free")}
            </Badge>
          </div>
          {planDescription ? (
            <p className="text-sm leading-6 text-muted-foreground">{planDescription}</p>
          ) : null}

          <dl className="grid gap-2 sm:grid-cols-2">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-3"
              >
                <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="mt-0.5 text-sm font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {features.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("workspace.includedPlan")}</p>
              <ul className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-sm">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-muted-foreground">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full">
              <Link href="/payments">{hasPaidPlan ? t("workspace.managePlan") : t("workspace.explorePaidPlans")}</Link>
            </Button>
          </div>
        </SettingsCardContent>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="size-5 text-primary" /> {t("workspace.todaysUsage")}
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {t("workspace.dailyAllowances")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {usage.map((row) => (
              <div key={row.id} className="rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight">{row.value}</p>
              </div>
            ))}
          </div>
        </SettingsCardContent>
      </SettingsCard>

      {otherPlans.length ? (
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> {t("workspace.otherPlans")}
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {t("workspace.comparePlansDescription")}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {otherPlans.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-border/70 bg-muted/20 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{item.name}</p>
                    {item.featured ? (
                      <Badge className="rounded-full">{t("workspace.popular")}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm">{item.price}</p>
                  {item.summary ? (
                    <p className="text-xs text-muted-foreground">{item.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/payments">{t("workspace.compareChangePlan")}</Link>
            </Button>
          </SettingsCardContent>
        </SettingsCard>
      ) : null}
      </div>
    </SettingsPanel>
  );
});