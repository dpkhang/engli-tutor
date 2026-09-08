"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpCircle,
  Check,
  Coins,
  CreditCard,
  Crown,
  LoaderCircle,
  ReceiptText,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  useLockScroll,
} from "@landing-page-generator/ui";
import {
  useBillingMe,
  useConfirmCheckout,
  useSubscribe,
  useTopupCheckout,
  useUpgradePlan,
} from "../hooks/use-billing";
import type { SubscriptionPlan, TopupPack } from "../api/billing";
import {
  allPlansForCompare,
  currentPlanDetails,
  currentPlanId,
  PERIOD_LABEL,
  STATUS_LABEL,
} from "../model/plans";

const REASON_LABEL: Record<string, string> = {
  SIGNUP_BONUS: "Signup bonus",
  PURCHASE: "Credit top-up",
  SUBSCRIPTION_GRANT: "Subscription credits",
  AI_GENERATE: "Legacy AI usage",
  AI_GENERATE_REFUND: "Legacy credit refund",
  ADJUST: "Adjustment",
};

function formatVnd(value: number) {
  return `${value.toLocaleString("en-US")} VND`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const sessionId = searchParams.get("session_id");
  const billing = useBillingMe();
  const subscribe = useSubscribe();
  const upgrade = useUpgradePlan();
  const topup = useTopupCheckout();
  const confirmCheckout = useConfirmCheckout();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  useEffect(() => {
    if (checkoutState !== "success") return;

    let cancelled = false;
    (async () => {
      try {
        if (sessionId) {
          await confirmCheckout.mutateAsync(sessionId);
        }
      } catch (err) {
        if (cancelled) return;
        const latest = await billing.refetch();
        if (latest.data?.hasPaidPlan && checkoutType !== "topup") return;
        setError(
          err instanceof Error ? err.message : "Couldn't sync payment. Try refreshing the page.",
        );
      } finally {
        if (!cancelled) await billing.refetch();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per success redirect
  }, [checkoutState, sessionId]);

  const data = billing.data;
  const hasPaidPlan = data?.hasPaidPlan ?? false;
  const stripeReady = data?.stripeConfigured ?? false;
  const balance = data?.balance ?? 0;
  const activePlanId = currentPlanId(data);
  const activePlan = currentPlanDetails(data);
  const comparePlans = allPlansForCompare(data?.subscriptionPlans ?? []);
  const activePlanIndex = comparePlans.findIndex((plan) => plan.id === activePlanId);
  const higherPlans = activePlanIndex < 0 ? [] : comparePlans.slice(activePlanIndex + 1);
  useLockScroll(showUpgradeOptions && higherPlans.length > 0);

  const redirectCheckout = async (url: string | null) => {
    if (!url) {
      setError("Stripe did not return a checkout URL");
      return;
    }
    window.location.assign(url);
  };

  const onSubscribe = async (planId: SubscriptionPlan["id"]) => {
    setError(null);
    setPending(`sub-${planId}`);
    try {
      const result = await subscribe.mutateAsync({ planId, period });
      await redirectCheckout(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create subscription session");
    } finally {
      setPending(null);
    }
  };

  const onUpgrade = async (planId: SubscriptionPlan["id"]) => {
    setError(null);
    setPending(`up-${planId}`);
    try {
      const result = await upgrade.mutateAsync(planId);
      await redirectCheckout(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upgrade plan");
    } finally {
      setPending(null);
    }
  };

  const onTopup = async (packId: TopupPack["id"]) => {
    setError(null);
    setPending(`top-${packId}`);
    try {
      const result = await topup.mutateAsync(packId);
      await redirectCheckout(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create payment session");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-9 text-primary-foreground shadow-xl shadow-primary/10 sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 size-64 rounded-full border-[34px] border-white/[0.07]"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-1/4 size-40 rounded-full bg-violet-400/20 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground/80">
            <Sparkles className="size-3.5 text-amber-300" />
            Plans that grow with your confidence
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            More practice. More progress.
            <br className="hidden sm:block" /> Always at your pace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-primary-foreground/70 sm:text-base">
            {hasPaidPlan
              ? "Your learning plan, credits and payment activity—all in one simple place."
              : "Start free and upgrade whenever you want more time to speak, practise and grow."}
          </p>
        </div>
      </header>

      {checkoutState === "success" ? (
        <Alert>
          <AlertDescription>
            {checkoutType === "subscription"
              ? "Subscription successful. First-period credits will be added after the Stripe webhook."
              : "Payment successful. Credits will be added shortly."}
          </AlertDescription>
        </Alert>
      ) : null}
      {checkoutState === "cancel" ? (
        <Alert variant="destructive">
          <AlertDescription>Checkout canceled.</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="overflow-hidden rounded-[1.75rem] border-primary/20 shadow-[0_20px_55px_-40px_hsl(var(--primary)/0.45)]">
        <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={hasPaidPlan ? "default" : "secondary"}
              className="gap-1 rounded-full px-3 py-1"
            >
              {hasPaidPlan ? <Crown className="size-3" /> : null}
              Current plan
            </Badge>
            {hasPaidPlan && data?.subscription.status ? (
              <Badge variant="outline">
                {STATUS_LABEL[data.subscription.status] ?? data.subscription.status}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em] sm:text-4xl">
            {billing.isLoading ? "…" : activePlan.name}
          </CardTitle>
          <CardDescription>{activePlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {billing.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading plan details…</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                      <Coins className="size-4 text-primary" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Credit balance</p>
                      <p className="font-semibold">{balance}</p>
                    </div>
                  </div>
                  {hasPaidPlan && data?.subscription.creditsPerPeriod ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                      <p className="text-xs text-muted-foreground">Credits per period</p>
                      <p className="font-semibold">{data.subscription.creditsPerPeriod}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                      <p className="text-xs text-muted-foreground">Signup bonus</p>
                      <p className="font-semibold">{data?.signupBonus ?? 50} credits</p>
                    </div>
                  )}
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {hasPaidPlan && data?.subscription.billingPeriod ? (
                    <div>
                      <dt className="text-muted-foreground">Billing period</dt>
                      <dd className="font-medium">
                        {PERIOD_LABEL[data.subscription.billingPeriod] ??
                          data.subscription.billingPeriod}
                      </dd>
                    </div>
                  ) : null}
                  {hasPaidPlan && data?.subscription.currentPeriodEnd ? (
                    <div>
                      <dt className="text-muted-foreground">Next renewal</dt>
                      <dd className="font-medium">
                        {formatDate(data.subscription.currentPeriodEnd)}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex flex-wrap gap-3">
                  {higherPlans.length > 0 ? (
                    <Button
                      type="button"
                      className="h-11 rounded-full px-5 shadow-sm"
                      disabled={!stripeReady || Boolean(pending)}
                      onClick={() => setShowUpgradeOptions(true)}
                    >
                      <ArrowUpCircle /> Upgrade plan
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Current benefits</p>
                <ul className="space-y-3 rounded-2xl border border-border/70 bg-muted/25 p-5 text-sm">
                  {activePlan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-muted-foreground">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10">
                        <Check className="size-3 text-primary" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showUpgradeOptions && higherPlans.length > 0 ? (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowUpgradeOptions(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="upgrade-dialog-title"
              className={cn(
                "relative my-auto w-full rounded-[1.75rem] border border-white/50 bg-popover p-6 text-popover-foreground shadow-2xl sm:p-8",
                higherPlans.length <= 1 && "max-w-md",
                higherPlans.length === 2 && "max-w-3xl",
                higherPlans.length >= 3 && "max-w-5xl",
              )}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                aria-label="Close"
                onClick={() => setShowUpgradeOptions(false)}
              >
                <X />
              </Button>
              <div className="space-y-2 pr-12">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Choose what fits you
                </p>
                <h2
                  id="upgrade-dialog-title"
                  className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
                >
                  <ArrowUpCircle className="size-5 text-primary" /> Unlock more practice
                </h2>
                <p className="text-sm text-muted-foreground">
                  Only plans higher than {activePlan.name} are shown. Pick one to start checkout.
                </p>
              </div>
              <div className="mt-6 space-y-5">
                {!hasPaidPlan ? (
                  <div className="flex flex-wrap gap-2">
                    {(["monthly", "yearly"] as const).map((p) => (
                      <Button
                        key={p}
                        type="button"
                        size="sm"
                        variant={period === p ? "default" : "outline"}
                        onClick={() => setPeriod(p)}
                      >
                        {p === "monthly" ? "Monthly" : "Yearly (−2 months)"}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "grid gap-4",
                    higherPlans.length === 1 && "grid-cols-1",
                    higherPlans.length === 2 && "md:grid-cols-2",
                    higherPlans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
                  )}
                >
                  {higherPlans.map((plan) => {
                    const price =
                      period === "yearly" && !plan.isFree
                        ? plan.priceVndMonthly * 10
                        : plan.priceVndMonthly;

                    return (
                      <Card
                        key={plan.id}
                        className={cn(
                          "relative overflow-hidden rounded-2xl shadow-none",
                          plan.featured &&
                            "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/15",
                        )}
                      >
                        <CardHeader className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            {plan.featured ? (
                              <Badge className="rounded-full">Most popular</Badge>
                            ) : null}
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                            {formatVnd(price)}
                            <span className="ml-1 text-sm font-sans font-normal text-muted-foreground">
                              {period === "yearly" ? "/ year" : "/ month"}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plan.creditsPerPeriod} credits/period
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="h-11 w-full rounded-full"
                            disabled={!stripeReady || Boolean(pending)}
                            onClick={() =>
                              void (hasPaidPlan
                                ? onUpgrade(plan.id as SubscriptionPlan["id"])
                                : onSubscribe(plan.id as SubscriptionPlan["id"]))
                            }
                          >
                            {pending === `${hasPaidPlan ? "up" : "sub"}-${plan.id}` ? (
                              <LoaderCircle className="animate-spin" />
                            ) : (
                              <>
                                <CreditCard /> Upgrade to {plan.name}
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {hasPaidPlan ? (
        <div>
          <Card className="rounded-[1.75rem] border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                  <Zap className="size-5" />
                </span>{" "}
                Top up your practice time
              </CardTitle>
              <CardDescription>
                Use this when you run out mid-period — one-time card payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {(data?.topupPacks ?? []).map((pack) => (
                <div
                  key={pack.id}
                  className="group rounded-2xl border border-border/70 bg-gradient-to-br from-amber-500/8 to-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold">{pack.name}</p>
                  <p className="mt-2 text-xl font-bold">{pack.credits}</p>
                  <p className="text-xs text-muted-foreground">credits</p>
                  <p className="mt-2 text-sm">{formatVnd(pack.priceVnd)}</p>
                  <Button
                    className="mt-4 w-full rounded-full"
                    variant="outline"
                    disabled={!stripeReady || Boolean(pending)}
                    onClick={() => void onTopup(pack.id)}
                  >
                    {pending === `top-${pack.id}` ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Buy more"
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="rounded-[1.75rem] border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-5" />
            </span>{" "}
            Payment activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billing.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !data?.ledger.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
              {data.ledger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{REASON_LABEL[entry.reason] ?? entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={entry.delta >= 0 ? "font-semibold text-primary" : "font-semibold"}
                    >
                      {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                    </p>
                    <p className="text-xs text-muted-foreground">= {entry.balanceAfter}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
