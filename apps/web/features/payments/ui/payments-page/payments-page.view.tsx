"use client";

import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
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
  Input,
  cn,
  useLockScroll,
  BillingPeriodSwitch,
} from "@engli-tutor/ui";
import type { CreditLedgerEntry, SubscriptionPlan, TopupPack } from "../../api/billing";
import {
  allPlansForCompare,
  formatBillingDateTime,
  formatVnd,
  LEDGER_REASON_LABEL,
  PERIOD_LABEL,
  STATUS_LABEL,
} from "../../model/plans";

type ComparePlan = ReturnType<typeof allPlansForCompare>[number];

export type PaymentsPageViewProps = {
  checkoutState: string | null;
  checkoutType: string | null;
  billingLoading: boolean;
  hasPaidPlan: boolean;
  stripeReady: boolean;
  balance: number;
  activePlan: { name: string; description: string; features: string[] };
  subscriptionStatus: string | undefined;
  billingPeriod: string | null | undefined;
  currentPeriodEnd: string | null | undefined;
  creditsPerPeriod: number | undefined;
  signupBonus: number | undefined;
  higherPlans: ComparePlan[];
  topupPacks: TopupPack[];
  ledger: CreditLedgerEntry[];
  period: "monthly" | "yearly";
  error: string | null;
  pending: string | null;
  showUpgradeOptions: boolean;
  customCredits: number;
  onPeriodChange: (period: "monthly" | "yearly") => void;
  onCustomCreditsChange: (value: number) => void;
  onSubscribe: (planId: SubscriptionPlan["id"]) => void;
  onUpgrade: (planId: SubscriptionPlan["id"]) => void;
  onTopup: (pack: TopupPack) => void;
  onOpenUpgrade: () => void;
  onCloseUpgrade: () => void;
};

export const PaymentsPageView = memo(function PaymentsPageView({
  checkoutState,
  checkoutType,
  billingLoading,
  hasPaidPlan,
  stripeReady,
  balance,
  activePlan,
  subscriptionStatus,
  billingPeriod,
  currentPeriodEnd,
  creditsPerPeriod,
  signupBonus,
  higherPlans,
  topupPacks,
  ledger,
  period,
  error,
  pending,
  showUpgradeOptions,
  customCredits,
  onPeriodChange,
  onCustomCreditsChange,
  onSubscribe,
  onUpgrade,
  onTopup,
  onOpenUpgrade,
  onCloseUpgrade,
}: PaymentsPageViewProps) {
  const sheetDragControls = useDragControls();
  const [mounted, setMounted] = useState(false);
  useLockScroll(showUpgradeOptions && higherPlans.length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-5 pb-10 sm:space-y-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-primary px-5 py-7 text-primary-foreground shadow-xl shadow-primary/10 sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 hidden size-64 rounded-full border-34 border-white/7 sm:block"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-1/4 hidden size-40 rounded-full bg-violet-400/20 blur-3xl sm:block"
        />
        <div className="relative max-w-2xl">
          <p className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground/80 sm:inline-flex">
            <Sparkles className="size-3.5 text-amber-300" />
            Plans that grow with your confidence
          </p>
          <h1 className="text-xl leading-tight font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
            More practice. More progress.
            <br className="hidden sm:block" /> Always at your pace.
          </h1>
          <p className="mt-3 hidden max-w-xl text-sm leading-6 text-primary-foreground/75 sm:mt-4 sm:block sm:text-base">
            {hasPaidPlan
              ? "Your learning plan, practice time and payment activity—all in one simple place."
              : "Start free and upgrade whenever you want more time to speak, practise and grow."}
          </p>
        </div>
      </header>

      {checkoutState === "success" ? (
        <Alert>
          <AlertDescription>
            {checkoutType === "subscription"
              ? "Your learning plan is active. Practice credits will be available shortly."
              : "Payment successful. Your practice credits will be available shortly."}
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

      <Card className="overflow-hidden rounded-3xl border-primary/20 shadow-[0_20px_55px_-40px_hsl(var(--primary)/0.45)] sm:rounded-[1.75rem]">
        <CardHeader className="border-b border-primary/10 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={hasPaidPlan ? "default" : "secondary"}
              className="gap-1 rounded-full px-3 py-1"
            >
              {hasPaidPlan ? <Crown className="size-3" /> : null}
              Current plan
            </Badge>
            {hasPaidPlan && subscriptionStatus ? (
              <Badge variant="outline">
                {STATUS_LABEL[subscriptionStatus] ?? subscriptionStatus}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="font-display text-2xl tracking-[-0.03em] sm:text-4xl">
            {billingLoading ? "…" : activePlan.name}
          </CardTitle>
          <CardDescription>{activePlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          {billingLoading ? (
            <p className="text-sm text-muted-foreground">Loading plan details…</p>
          ) : (
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-primary/15 bg-primary/5 px-3 py-3 text-sm sm:gap-3 sm:px-4">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                      <Coins className="size-4 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Practice credits</p>
                      <p className="font-semibold">{balance}</p>
                    </div>
                  </div>
                  {hasPaidPlan && creditsPerPeriod ? (
                    <div className="min-w-0 rounded-2xl border border-border/70 bg-muted/30 px-3 py-3 text-sm sm:px-4">
                      <p className="text-xs text-muted-foreground">Practice credits per period</p>
                      <p className="font-semibold">{creditsPerPeriod}</p>
                    </div>
                  ) : (
                    <div className="min-w-0 rounded-2xl border border-border/70 bg-muted/30 px-3 py-3 text-sm sm:px-4">
                      <p className="text-xs text-muted-foreground">Welcome practice credits</p>
                      <p className="font-semibold">{signupBonus ?? 50} practice credits</p>
                    </div>
                  )}
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {hasPaidPlan && billingPeriod ? (
                    <div>
                      <dt className="text-muted-foreground">Billing period</dt>
                      <dd className="font-medium">{PERIOD_LABEL[billingPeriod] ?? billingPeriod}</dd>
                    </div>
                  ) : null}
                  {hasPaidPlan && currentPeriodEnd ? (
                    <div>
                      <dt className="text-muted-foreground">Next renewal</dt>
                      <dd className="font-medium">{formatBillingDateTime(currentPeriodEnd)}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex flex-wrap gap-3">
                  {higherPlans.length > 0 ? (
                    <Button
                      type="button"
                      className="h-11 w-full rounded-full px-5 shadow-sm sm:w-auto"
                      disabled={!stripeReady || Boolean(pending)}
                      onClick={onOpenUpgrade}
                    >
                      <ArrowUpCircle /> {hasPaidPlan ? "Upgrade plan" : "Explore plans"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Current benefits</p>
                <ul className="space-y-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-sm sm:p-5">
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

      {mounted
        ? createPortal(
            <AnimatePresence>
              {showUpgradeOptions && higherPlans.length > 0 ? (
                <motion.div
                  className="fixed inset-0 z-100 flex h-dvh min-h-dvh w-full items-end bg-black/45 md:grid md:place-items-center md:overflow-y-auto md:p-4 md:backdrop-blur-[2px]"
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) onCloseUpgrade();
                  }}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="upgrade-dialog-title"
                    className={cn(
                      "flex w-full flex-col overflow-hidden border border-white/50 bg-popover text-popover-foreground shadow-2xl",
                      "max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-[85dvh] max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] max-md:rounded-t-[1.75rem]",
                      "md:relative md:h-auto md:max-h-[calc(100dvh-2rem)] md:rounded-[1.75rem]",
                      higherPlans.length <= 1 && "md:max-w-md",
                      higherPlans.length === 2 && "md:max-w-3xl",
                      higherPlans.length >= 3 && "md:max-w-5xl",
                    )}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    drag="y"
                    dragControls={sheetDragControls}
                    dragListener={false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.35 }}
                    dragMomentum={false}
                    dragSnapToOrigin
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 96 || info.velocity.y > 650) {
                        onCloseUpgrade();
                      }
                    }}
                  >
                    <div
                      className="relative shrink-0 touch-none cursor-grab border-b border-border bg-popover px-4 pt-7 pb-4 active:cursor-grabbing sm:px-8 sm:pt-8 sm:pb-5 md:cursor-default"
                      onPointerDown={(event) => {
                        if (window.innerWidth >= 768) return;
                        if ((event.target as HTMLElement).closest("button")) return;
                        sheetDragControls.start(event);
                      }}
                    >
                      <span
                        className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/25 sm:hidden"
                        aria-hidden
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4"
                        aria-label="Close"
                        onClick={onCloseUpgrade}
                      >
                        <X />
                      </Button>
                      <div className="space-y-2 pr-12">
                        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                          Choose what fits you
                        </p>
                        <h2
                          id="upgrade-dialog-title"
                          className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl"
                        >
                          <ArrowUpCircle className="size-5 text-primary" /> Unlock more practice
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {hasPaidPlan
                            ? `Choose the next step beyond ${activePlan.name}.`
                            : "Choose how much speaking practice and guidance you need."}
                        </p>
                      </div>
                    </div>
                    <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-md:flex-1 sm:space-y-5 sm:px-8 sm:pt-5 sm:pb-6">
                      {!hasPaidPlan ? (
                        <BillingPeriodSwitch value={period} onChange={onPeriodChange} />
                      ) : null}
                      <div
                        className={cn(
                          "grid items-stretch gap-4",
                          higherPlans.length === 1 && "grid-cols-1",
                          higherPlans.length === 2 && "sm:grid-cols-2",
                          higherPlans.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3",
                        )}
                      >
                        {higherPlans.map((plan) => {
                          const price =
                            period === "yearly" && !plan.isFree
                              ? plan.priceVndMonthly * 10
                              : plan.priceVndMonthly;

                          return (
                            <article
                              key={plan.id}
                              className={cn(
                                "relative flex h-full flex-col rounded-[1.25rem] border bg-card p-5",
                                plan.featured && "border-primary/50 bg-primary/3 ring-1 ring-primary/15",
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-xl font-semibold">{plan.name}</h3>
                                {plan.featured ? (
                                  <Badge className="rounded-full">Most popular</Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {plan.description}
                              </p>
                              <p className="mt-4 wrap-break-word font-display text-xl tracking-tight sm:text-2xl">
                                {formatVnd(price)}
                                <span className="ml-1 text-sm font-sans font-normal text-muted-foreground">
                                  {period === "yearly" ? "/ year" : "/ month"}
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {plan.creditsPerPeriod} practice credits per period
                              </p>
                              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                {plan.features.map((feature) => (
                                  <li key={feature} className="flex gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-auto pt-5">
                                <Button
                                  className="h-11 w-full rounded-full"
                                  disabled={!stripeReady || Boolean(pending)}
                                  onClick={() =>
                                    hasPaidPlan
                                      ? onUpgrade(plan.id as SubscriptionPlan["id"])
                                      : onSubscribe(plan.id as SubscriptionPlan["id"])
                                  }
                                >
                                  {pending === `${hasPaidPlan ? "up" : "sub"}-${plan.id}` ? (
                                    <LoaderCircle className="animate-spin" />
                                  ) : (
                                    <>
                                      <CreditCard /> {hasPaidPlan ? "Upgrade to" : "Choose"} {plan.name}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

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
                Add extra conversation and exercise time without changing your current plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {topupPacks.map((pack) => {
                const min = pack.minCredits ?? 50;
                const max = pack.maxCredits ?? 5_000;
                const unit = pack.unitPriceVnd ?? 0;
                const price = pack.isCustom ? customCredits * unit : pack.priceVnd;
                const invalidCustom = pack.isCustom && (customCredits < min || customCredits > max);

                return (
                  <div
                    key={pack.id}
                    className="group flex h-full flex-col rounded-2xl border border-border/70 bg-linear-to-br from-amber-500/8 to-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold">{pack.name}</p>
                    {pack.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{pack.description}</p>
                    ) : null}
                    {pack.isCustom ? (
                      <div className="mt-3 space-y-2">
                        <Input
                          type="number"
                          min={min}
                          max={max}
                          step={10}
                          value={customCredits}
                          onChange={(event) => onCustomCreditsChange(Number(event.target.value) || min)}
                          aria-label="Custom credit amount"
                        />
                        <p className="text-xs text-muted-foreground">
                          {min.toLocaleString("en-US")}–{max.toLocaleString("en-US")} credits
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-xl font-bold">{pack.credits}</p>
                        <p className="text-xs text-muted-foreground">practice credits</p>
                      </>
                    )}
                    <p className="mt-2 text-sm">{formatVnd(price)}</p>
                    <Button
                      className="mt-auto w-full rounded-full"
                      variant="outline"
                      disabled={!stripeReady || Boolean(pending) || invalidCustom || price <= 0}
                      onClick={() => onTopup(pack)}
                    >
                      {pending === `top-${pack.id}` ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        pack.cta || (pack.isCustom ? "Buy custom amount" : "Buy more")
                      )}
                    </Button>
                  </div>
                );
              })}
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
          {billingLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !ledger.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl border border-border/70">
              {ledger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{LEDGER_REASON_LABEL[entry.reason] ?? entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatBillingDateTime(entry.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={entry.delta >= 0 ? "font-semibold text-primary" : "font-semibold"}>
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
});
