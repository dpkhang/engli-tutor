"use client";

import { memo } from "react";
import Link from "next/link";
import { Check, Crown, ExternalLink, LoaderCircle, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, Badge, Button, cn } from "@engli-tutor/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import type { Plan, PlanId } from "@/features/marketing";
import type { BillingMe } from "../../api/billing";
import { useMarketingI18n } from "@/features/i18n";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { usePathname } from "next/navigation";

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

const STATUS_LABEL_KEY: Record<string, string> = {
  active: "checkout.active",
  ACTIVE: "checkout.active",
  past_due: "billing.status.pastDue",
  PAST_DUE: "billing.status.pastDue",
  canceled: "billing.status.canceled",
  CANCELED: "billing.status.canceled",
  incomplete: "billing.status.incomplete",
  INCOMPLETE: "billing.status.incomplete",
};

const PERIOD_LABEL_KEY: Record<string, string> = {
  monthly: "billing.period.monthly",
  quarterly: "billing.period.quarterly",
  yearly: "billing.period.yearly",
};

const ACCESS_SOURCE_LABEL_KEY: Record<string, string> = {
  trial: "plans.access.trial",
  bonus: "plans.access.bonus",
};

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(new Date(value));
}

function currentPlanId(billing: BillingMe | null): PlanId {
  if (billing?.entitlements?.planId) return billing.entitlements.planId;
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

export const PaymentPackagesPageView = memo(function PaymentPackagesPageView({
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
  const t = useMarketingI18n();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : "en";
  const localize = (href: string) => href.startsWith("/") ? `/${locale}${href}` : href;
  const activePlanId = currentPlanId(billing);
  const activePlan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const benefits = planBenefits(activePlan, billing);
  const paidPlan = billing?.hasPaidPlan ?? false;
  const accessSource = billing?.entitlements?.source;
  const proUntil = billing?.entitlements?.proUntil ?? null;
  const dailyChatLimit = billing?.entitlements?.limits.tutorChatPerDay;

  if (redirectingToCurrentPlan) {
    return (
      <main className="marketing-container marketing-page grid min-h-svh place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {t("plans.openingDetails")}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-svh bg-[radial-gradient(ellipse_at_top,hsl(214_22%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(222_28%_14%),hsl(var(--background))_55%)]">
      <div className="marketing-container marketing-page space-y-6 sm:space-y-8">
        <PageBackLink href={localize("/")} label={t("header.backToHome")} />

        <motion.div
          className="mx-auto max-w-2xl space-y-3 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">{t("header.plans")}</p>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            {isLoggedIn && !billingLoading ? t("payment.yourPlan") : t("payment.choosePlan")}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {isLoggedIn
              ? t("payment.loggedInDescription")
              : t("payment.guestDescription")}
          </p>
        </motion.div>

        {checkoutState === "success" ? (
          <Alert>
            <AlertDescription>
              {checkoutType === "subscription"
                ? t("plans.subscriptionSuccess")
                : t("plans.paymentSuccess")}
            </AlertDescription>
          </Alert>
        ) : null}
        {checkoutState === "cancel" ? (
          <Alert variant="destructive">
            <AlertDescription>{t("workspace.checkoutCanceled")}</AlertDescription>
          </Alert>
        ) : null}

        {authReady && isLoggedIn ? (
          <motion.section
            className="rounded-2xl border border-primary/25 bg-background/90 p-5 shadow-sm backdrop-blur sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {billingLoading ? (
              <p className="text-sm text-muted-foreground">{t("workspace.loadingPlanDetails")}</p>
            ) : billing ? (
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={paidPlan ? "default" : "secondary"} className="gap-1">
                      {paidPlan ? <Crown className="size-3" /> : null}
                      {t("payment.currentPlan")}
                    </Badge>
                    {paidPlan ? (
                      <Badge variant="outline">
                        {STATUS_LABEL_KEY[billing.subscription.status]
                          ? t(STATUS_LABEL_KEY[billing.subscription.status]!)
                          : billing.subscription.status}
                      </Badge>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="font-display text-3xl tracking-tight">
                      {activePlan.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{activePlan.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex min-h-16 items-center gap-2 rounded-2xl border border-border/80 bg-background/70 px-4 py-3 shadow-sm">
                      <MessageCircle className="size-4 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("workspace.aiTutorChatsToday")}</p>
                        <p className="font-semibold">
                          {billing.usage?.tutor_chat ?? 0}
                          {dailyChatLimit != null ? ` / ${dailyChatLimit}` : ""}
                        </p>
                      </div>
                    </div>
                    {accessSource && ACCESS_SOURCE_LABEL_KEY[accessSource] && proUntil ? (
                      <div className="min-h-16 rounded-2xl border border-border/80 bg-background/70 px-4 py-3 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                          {t(ACCESS_SOURCE_LABEL_KEY[accessSource]!)}
                        </p>
                        <p className="font-semibold">{t("plans.until", { date: formatDate(proUntil, locale) })}</p>
                      </div>
                    ) : null}
                  </div>

                  {paidPlan ? (
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      {billing.subscription.billingPeriod ? (
                        <div>
                          <dt className="text-muted-foreground">{t("checkout.billingCycle")}</dt>
                          <dd className="font-medium">
                            {PERIOD_LABEL_KEY[billing.subscription.billingPeriod]
                              ? t(PERIOD_LABEL_KEY[billing.subscription.billingPeriod]!)
                              : billing.subscription.billingPeriod}
                          </dd>
                        </div>
                      ) : null}
                      {billing.subscription.currentPeriodEnd ? (
                        <div>
                          <dt className="text-muted-foreground">{t("checkout.nextRenewal")}</dt>
                          <dd className="font-medium">
                            {formatDate(billing.subscription.currentPeriodEnd, locale)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  <a href={`${workspaceUrl}/payments`}>
                    <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full gap-2 py-2 whitespace-normal">
                      <ExternalLink className="size-4" />
                      {t("checkout.workspace")}
                    </Button>
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{t("payment.activeBenefits")}</p>
                  <ul className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/30 p-5 text-sm shadow-sm">
                    {benefits.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {billing.entitlements?.trialAvailable ? (
                    <p className="text-xs text-muted-foreground">
                      {t("plans.trialHint", { days: billing.trialDays })}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("plans.loadDetailsFailed")}
              </p>
            )}
          </motion.section>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {isLoggedIn ? t("payment.comparePlans") : t("payment.pricing")}
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const emphasize = queriedPlan ? plan.id === highlighted : plan.featured;
              const isCurrent = isLoggedIn && !billingLoading && plan.id === activePlanId;

              return (
                <motion.article
                  key={plan.id}
                  className={cn(
                    "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-7",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-lg"
                      : emphasize
                        ? "border-primary/40 bg-card text-card-foreground shadow-md"
                        : "border-border/80 bg-background/90",
                  )}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.06 * index }}
                >
                  {isCurrent ? (
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase shadow-sm">
                      {t("plans.current")}
                    </span>
                  ) : null}

                  <div className="-mx-5 -mt-5 mb-5 aspect-video overflow-hidden border-b sm:-mx-7 sm:-mt-7">
                    <img
                      src={plan.imageUrl}
                      alt={t("plans.planImageAlt", { name: plan.name })}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-2xl tracking-tight">{plan.name}</h2>
                      {plan.featured && !isCurrent ? (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow-sm",
                            emphasize
                              ? "bg-accent text-accent-foreground"
                              : "bg-accent/15 text-accent",
                          )}
                        >
                          {t("payment.popular")}
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

                  <p className="mt-5 font-display text-3xl tracking-tight">
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
                    <Button type="button" className="mt-auto min-h-11 w-full" variant="secondary" disabled>
                      {t("payment.currentPlan")}
                    </Button>
                  ) : (
                    <Link href={planHrefs[plan.id]} className="mt-auto block pt-8">
                      <Button
                        type="button"
                        className={cn(
                          "min-h-11 w-full",
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

          <p className="flex flex-wrap items-center justify-center gap-2 pt-4 text-center text-sm text-muted-foreground">
            <span>{t("payment.billingProcessed")}</span>
            <Link
              href="/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
            >
              {t("payment.privacy")}
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/policy/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
            >
              {t("payment.cookies")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
});
