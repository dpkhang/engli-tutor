"use client";

import Link from "next/link";
import { Check, Coins, Crown, ExternalLink, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, Badge, Button, cn } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import type { Plan, PlanId } from "@/features/marketing/model/plans";
import type { BillingMe } from "@/features/payment/api/billing";

export type PaymentPackagesPageViewProps = {
  plans: Plan[];
  queriedPlan: string | null;
  highlighted: PlanId;
  checkoutState: string | null;
  checkoutType: string | null;
  authReady: boolean;
  isLoggedIn: boolean;
  billing: BillingMe | null;
  billingLoading: boolean;
  workspaceUrl: string;
  planHrefs: Record<PlanId, string>;
  redirectingToCurrentPlan: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  ACTIVE: "Active",
  past_due: "Past due",
  PAST_DUE: "Past due",
  canceled: "Canceled",
  CANCELED: "Canceled",
  incomplete: "Incomplete",
  INCOMPLETE: "Incomplete",
};

const PERIOD_LABEL: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function currentPlanId(billing: BillingMe | null): PlanId {
  if (!billing || !billing.hasPaidPlan) return "starter";
  return billing.subscription.planId === "free" ? "starter" : billing.subscription.planId;
}

function planBenefits(plan: Plan | undefined, billing: BillingMe | null): string[] {
  if (plan?.features.length) return plan.features;
  if (billing?.hasPaidPlan) {
    const fromApi = billing.subscriptionPlans.find((p) => p.id === billing.subscription.planId);
    if (fromApi?.benefits?.length) return fromApi.benefits;
    if (fromApi?.features.length) return fromApi.features;
  }
  return [];
}

export function PaymentPackagesPageView({
  plans,
  queriedPlan,
  highlighted,
  checkoutState,
  checkoutType,
  authReady,
  isLoggedIn,
  billing,
  billingLoading,
  workspaceUrl,
  planHrefs,
  redirectingToCurrentPlan,
}: PaymentPackagesPageViewProps) {
  const activePlanId = currentPlanId(billing);
  const activePlan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const benefits = planBenefits(activePlan, billing);
  const paidPlan = billing?.hasPaidPlan ?? false;

  if (redirectingToCurrentPlan) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Opening your plan details…
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] bg-[radial-gradient(ellipse_at_top,hsl(214_22%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(222_28%_14%),hsl(var(--background))_55%)]">
      <div className="mx-auto max-w-6xl space-y-10 px-5 pt-24 pb-16 sm:px-8 lg:pt-28 lg:pb-20">
        <PageBackLink href="/" label="home" />

        <motion.div
          className="mx-auto max-w-2xl space-y-3 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Plans
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            {isLoggedIn && !billingLoading ? "Your plan & benefits" : "Choose the right plan"}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {isLoggedIn
              ? "See your current plan, credits, and benefits. Upgrade or switch anytime."
              : "Compare benefits across plans. Paid plans checkout via Stripe — fixed credits each period."}
          </p>
        </motion.div>

        {checkoutState === "success" ? (
          <Alert>
            <AlertDescription>
              {checkoutType === "subscription"
                ? "Subscription successful. Your first-period credits will appear in a few seconds."
                : "Payment successful. Credits will be added shortly."}
            </AlertDescription>
          </Alert>
        ) : null}
        {checkoutState === "cancel" ? (
          <Alert variant="destructive">
            <AlertDescription>Checkout was canceled on Stripe.</AlertDescription>
          </Alert>
        ) : null}

        {authReady && isLoggedIn ? (
          <motion.section
            className="rounded-sm border border-primary/25 bg-background p-6 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {billingLoading ? (
              <p className="text-sm text-muted-foreground">Loading plan details…</p>
            ) : billing ? (
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={paidPlan ? "default" : "secondary"} className="gap-1">
                      {paidPlan ? <Crown className="size-3" /> : null}
                      Current plan
                    </Badge>
                    {paidPlan ? (
                      <Badge variant="outline">
                        {STATUS_LABEL[billing.subscription.status] ?? billing.subscription.status}
                      </Badge>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                      {activePlan.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{activePlan.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-xl border px-4 py-3">
                      <Coins className="size-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Credit balance</p>
                        <p className="font-semibold">{billing.balance}</p>
                      </div>
                    </div>
                    {paidPlan && billing.subscription.creditsPerPeriod > 0 ? (
                      <div className="rounded-xl border px-4 py-3">
                        <p className="text-xs text-muted-foreground">Credits per period</p>
                        <p className="font-semibold">{billing.subscription.creditsPerPeriod}</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border px-4 py-3">
                        <p className="text-xs text-muted-foreground">Signup bonus</p>
                        <p className="font-semibold">{billing.signupBonus} credits</p>
                      </div>
                    )}
                  </div>

                  {paidPlan ? (
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      {billing.subscription.billingPeriod ? (
                        <div>
                          <dt className="text-muted-foreground">Billing cycle</dt>
                          <dd className="font-medium">
                            {PERIOD_LABEL[billing.subscription.billingPeriod] ??
                              billing.subscription.billingPeriod}
                          </dd>
                        </div>
                      ) : null}
                      {billing.subscription.currentPeriodEnd ? (
                        <div>
                          <dt className="text-muted-foreground">Next renewal</dt>
                          <dd className="font-medium">
                            {formatDate(billing.subscription.currentPeriodEnd)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  <a href={`${workspaceUrl}/payments`}>
                    <Button type="button" variant="outline" className="gap-2">
                      <ExternalLink className="size-4" />
                      Manage plan in workspace
                    </Button>
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Active benefits</p>
                  <ul className="space-y-2.5 rounded-sm border bg-muted/30 p-5 text-sm">
                    {benefits.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Includes {billing.signupBonus} welcome credits
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Could not load plan details. Try refreshing the page or signing in again.
              </p>
            )}
          </motion.section>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {isLoggedIn ? "Compare plans" : "Pricing"}
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const emphasize = queriedPlan ? plan.id === highlighted : plan.featured;
              const isCurrent = isLoggedIn && !billingLoading && plan.id === activePlanId;

              return (
                <motion.article
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-sm border p-6 sm:p-7",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : emphasize
                        ? "border-primary/40 bg-card text-card-foreground"
                        : "border-border bg-background",
                  )}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.06 * index }}
                >
                  {isCurrent ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-accent px-3 py-0.5 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase">
                      Current
                    </span>
                  ) : null}

                  <div className="-mx-6 -mt-6 mb-5 aspect-[16/9] overflow-hidden border-b sm:-mx-7 sm:-mt-7">
                    <img
                      src={plan.imageUrl}
                      alt={`${plan.name} plan`}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                        {plan.name}
                      </h2>
                      {plan.featured && !isCurrent ? (
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                            emphasize
                              ? "bg-accent text-accent-foreground"
                              : "bg-accent/15 text-accent",
                          )}
                        >
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isCurrent ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <p className="mt-5 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                    {plan.price}
                    <span
                      className={cn(
                        "ml-1 text-sm font-sans font-normal",
                        isCurrent ? "text-primary-foreground/65" : "text-muted-foreground",
                      )}
                    >
                      {plan.period}
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-accent">→</span>
                        <span
                          className={
                            isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button type="button" className="mt-8 w-full" variant="secondary" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Link href={planHrefs[plan.id]} className="mt-8 block">
                      <Button
                        type="button"
                        className={cn(
                          "w-full",
                          emphasize ? "bg-accent text-accent-foreground hover:bg-accent/90" : "",
                        )}
                        variant={emphasize ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
