"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import {
  Check,
  CreditCard,
  Crown,
  Gauge,
  History,
  Sparkles,
} from "lucide-react";
import { Badge, Button } from "@engli-tutor/ui";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsErrorState,
  SettingsPanel,
  SettingsSection,
} from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

export type BillingFact = {
  id: string;
  label: string;
  value: string;
};

export type BillingUsageRow = {
  id: string;
  label: string;
  value: string;
};

export type BillingHistoryRow = {
  id: string;
  title: string;
  status: string | null;
  date: string | null;
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
  error: boolean;
  onRetry: () => void;
  planName: string;
  planDescription: string;
  sourceLabel: string;
  isPremium: boolean;
  ctaLabel: string;
  features: string[];
  facts: BillingFact[];
  history: BillingHistoryRow[];
  usage: BillingUsageRow[];
  otherPlans: BillingOtherPlan[];
};

export const BillingSettingsView = memo(function BillingSettingsView({
  ready,
  error,
  onRetry,
  planName,
  planDescription,
  sourceLabel,
  isPremium,
  ctaLabel,
  features,
  facts,
  history,
  usage,
  otherPlans,
}: BillingSettingsViewProps) {
  const t = useWorkspaceI18n();

  if (error) {
    return (
      <SettingsPanel ready={ready}>
        <SettingsErrorState
          message={t("settings.billing.loadFailed")}
          retryLabel={t("settings.billing.retry")}
          onRetry={onRetry}
        />
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={<CreditCard className="size-5 text-primary" aria-hidden />}
              title={t("workspace.currentPlan")}
              description={t("settings.billing.planDescription")}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words text-lg font-semibold tracking-tight">
                  {planName}
                </p>
                <Badge
                  variant={isPremium ? "default" : "secondary"}
                  className="gap-1"
                >
                  {isPremium ? <Crown className="size-3" aria-hidden /> : null}
                  {sourceLabel}
                </Badge>
              </div>
              {planDescription ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {planDescription}
                </p>
              ) : null}

              <dl className="grid gap-2 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-3"
                  >
                    <dt className="text-xs text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 break-words text-sm font-medium">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {features.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    {t("workspace.includedPlan")}
                  </p>
                  <ul className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-sm">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-2.5 text-muted-foreground"
                      >
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" aria-hidden />
                        </span>
                        <span className="min-w-0 break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button asChild className="h-11 w-full rounded-full sm:w-auto">
                <Link href="/payments">{ctaLabel}</Link>
              </Button>
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={<Gauge className="size-5 text-primary" aria-hidden />}
              title={t("workspace.todaysUsage")}
              description={t("workspace.dailyAllowances")}
            >
              <div className="grid grid-cols-2 gap-2">
                {usage.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3"
                  >
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="mt-0.5 break-words text-lg font-semibold tracking-tight">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardContent className="pt-4">
            <SettingsSection
              icon={<History className="size-5 text-primary" aria-hidden />}
              title={t("settings.billing.historyTitle")}
              description={t("settings.billing.historyDescription")}
            >
              {history.length ? (
                <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
                  {history.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-1 px-3.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-medium">{item.title}</p>
                        {item.status ? (
                          <p className="break-words text-xs text-muted-foreground">
                            {item.status}
                          </p>
                        ) : null}
                      </div>
                      {item.date ? (
                        <p className="text-xs text-muted-foreground sm:shrink-0">
                          {item.date}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-1 rounded-2xl border border-dashed border-border p-5 text-center text-sm">
                  <p className="font-medium">
                    {t("settings.billing.historyEmpty")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("settings.billing.historyEmptyHint")}
                  </p>
                </div>
              )}
            </SettingsSection>
          </SettingsCardContent>
        </SettingsCard>

        {otherPlans.length ? (
          <SettingsCard>
            <SettingsCardContent className="pt-4">
              <SettingsSection
                icon={<Sparkles className="size-5 text-primary" aria-hidden />}
                title={t("workspace.otherPlans")}
                description={t("workspace.comparePlansDescription")}
              >
                <ul className="grid gap-2 sm:grid-cols-2">
                  {otherPlans.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-border/70 bg-muted/20 px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 break-words font-semibold">
                          {item.name}
                        </p>
                        {item.featured ? (
                          <Badge className="shrink-0 rounded-full">
                            {t("workspace.popular")}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-sm">{item.price}</p>
                      {item.summary ? (
                        <p className="break-words text-xs text-muted-foreground">
                          {item.summary}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-full sm:w-auto"
                >
                  <Link href="/payments">
                    {t("workspace.compareChangePlan")}
                  </Link>
                </Button>
              </SettingsSection>
            </SettingsCardContent>
          </SettingsCard>
        ) : null}
      </div>
    </SettingsPanel>
  );
});
