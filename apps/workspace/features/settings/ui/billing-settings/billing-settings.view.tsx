"use client";

import { memo } from "react";
import Link from "next/link";
import { Check, Coins, CreditCard, Crown, ReceiptText, Sparkles } from "lucide-react";
import { Badge, Button, CardTitle } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";

export type BillingFact = {
  label: string;
  value: string;
};

export type BillingLedgerRow = {
  id: string;
  title: string;
  date: string;
  delta: number;
  balanceAfter: number;
};

export type BillingOtherPlan = {
  id: string;
  name: string;
  price: string;
  credits: string;
  featured?: boolean;
};

export type BillingSettingsViewProps = {
  ready: boolean;
  planName: string;
  planDescription: string;
  hasPaidPlan: boolean;
  features: string[];
  facts: BillingFact[];
  balance: number;
  signupBonus: number;
  creditsAdded: number;
  creditsSpent: number;
  ledgerRows: BillingLedgerRow[];
  otherPlans: BillingOtherPlan[];
};

export const BillingSettingsView = memo(function BillingSettingsView({
  ready,
  planName,
  planDescription,
  hasPaidPlan,
  features,
  facts,
  balance,
  signupBonus,
  creditsAdded,
  creditsSpent,
  ledgerRows,
  otherPlans,
}: BillingSettingsViewProps) {
  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" /> Current plan
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold tracking-tight">{planName}</p>
            <Badge variant={hasPaidPlan ? "default" : "secondary"} className="gap-1">
              {hasPaidPlan ? <Crown className="size-3" /> : null}
              {hasPaidPlan ? "Paid" : "Free"}
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
              <p className="text-sm font-semibold">Included in this plan</p>
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
              <Link href="/payments">{hasPaidPlan ? "Manage plan" : "Explore paid plans"}</Link>
            </Button>
            {hasPaidPlan ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/payments">Buy extra credits</Link>
              </Button>
            ) : null}
          </div>
        </SettingsCardContent>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="size-5 text-primary" /> Practice credits
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Credits are spent on AI speaking, tutor chat, and translation. Unused credits stay in
            your wallet until you use them.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <CreditStat label="Available now" value={balance} highlight />
            <CreditStat label="Added" value={creditsAdded} />
            <CreditStat label="Used" value={creditsSpent} />
            <CreditStat label="Welcome bonus" value={signupBonus} />
          </div>
        </SettingsCardContent>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="size-5 text-primary" /> Payment activity
          </CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent>
          {ledgerRows.length ? (
            <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
              {ledgerRows.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={entry.delta >= 0 ? "font-semibold text-primary" : "font-semibold"}>
                      {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                    </p>
                    <p className="text-xs text-muted-foreground">= {entry.balanceAfter}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              No credit activity yet. Welcome credits and plan grants will show up here.
            </div>
          )}
        </SettingsCardContent>
      </SettingsCard>

      {otherPlans.length ? (
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Other plans
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Compare what you would get if you change plans. Checkout stays on the Plans page.
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
                      <Badge className="rounded-full">Popular</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm">{item.price}</p>
                  <p className="text-xs text-muted-foreground">{item.credits}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/payments">Compare and change plan</Link>
            </Button>
          </SettingsCardContent>
        </SettingsCard>
      ) : null}
      </div>
    </SettingsPanel>
  );
});

const CreditStat = memo(function CreditStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3"
          : "rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-3"
      }
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight">{value.toLocaleString("en-US")}</p>
    </div>
  );
});
