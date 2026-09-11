"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  BillingPeriodSwitch,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  useLockScroll,
} from "@landing-page-generator/ui";
import { AnimatePresence, motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import {
  type BillingPeriod,
  type Plan,
  type PlanId,
} from "@/features/marketing/model/plans";

export type PaymentCheckoutPageViewProps = {
  plan: Plan;
  period: BillingPeriod;
  billing: { total: number; label: string; periodLabel: string };
  isFree: boolean;
  pending: boolean;
  error: string | null;
  workspaceUrl: string;
  checkingBilling: boolean;
  ownedPlan: Plan | null;
  upgradePlans: Plan[];
  ownedSubscription: {
    status: string;
    billingPeriod: BillingPeriod | null;
    currentPeriodEnd: string | null;
    creditsPerPeriod: number;
  } | null;
  creditBalance: number | null;
  onPeriodChange: (period: BillingPeriod) => void;
  onSubscribe: () => void;
  onUpgrade: (planId: PlanId) => void;
};

export function PaymentCheckoutPageView({
  plan,
  period,
  billing,
  isFree,
  pending,
  error,
  workspaceUrl,
  checkingBilling,
  ownedPlan,
  upgradePlans,
  ownedSubscription,
  creditBalance,
  onPeriodChange,
  onSubscribe,
  onUpgrade,
}: PaymentCheckoutPageViewProps) {
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  useLockScroll(showUpgradeOptions && upgradePlans.length > 0);

  if (isFree || checkingBilling) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {isFree ? "Redirecting to free signup…" : "Checking your plan…"}
        </div>
      </main>
    );
  }

  if (ownedPlan && ownedSubscription) {
    const periodLabel = ownedSubscription.billingPeriod === "yearly" ? "Yearly" : "Monthly";
    const renewalDate = ownedSubscription.currentPeriodEnd
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
          new Date(ownedSubscription.currentPeriodEnd),
        )
      : null;

    return (
      <main className="min-h-[100svh] bg-background px-5 py-20 sm:px-8 sm:py-24">
        <motion.section
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-4 rounded-lg border border-primary/25 px-4 py-4 text-primary sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-3" role="status">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 drop-shadow-sm" />
              <div className="max-w-lg">
                <p className="text-base font-semibold sm:text-lg">
                  You&apos;re subscribed to {ownedPlan.name}
                </p>
                <p className="mt-1 text-sm text-foreground/70">
                  Your plan is active and benefits are ready in the workspace.
                </p>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              {upgradePlans.length > 0 ? (
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={pending}
                  onClick={() => setShowUpgradeOptions(true)}
                >
                  <ArrowUpCircle /> Upgrade plan
                </Button>
              ) : null}
              <Button
                asChild
                variant={upgradePlans.length > 0 ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                <a href={workspaceUrl}>Go to workspace</a>
              </Button>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="relative mt-6 h-52 overflow-hidden rounded-lg sm:h-64">
            <img
              src={ownedPlan.imageUrl}
              alt={`${ownedPlan.name} plan`}
              className="size-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="text-xs font-semibold tracking-[0.14em] text-white/75 uppercase">
                Current plan · {periodLabel}
              </p>
              <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
                {ownedPlan.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/80">{ownedPlan.description}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 border-y text-sm sm:grid-cols-4">
            <div className="border-r border-b px-3 py-5 sm:border-b-0 sm:px-5">
              <dt className="text-xs text-muted-foreground">Billing cycle</dt>
              <dd className="mt-1.5 font-semibold text-foreground">{periodLabel}</dd>
            </div>
            <div className="border-b px-3 py-5 sm:border-r sm:border-b-0 sm:px-5">
              <dt className="text-xs text-muted-foreground">Credit balance</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                <Coins className="size-4 text-primary" /> {creditBalance ?? 0}
              </dd>
            </div>
            <div className="border-r px-3 py-5 sm:px-5">
              <dt className="text-xs text-muted-foreground">Credits per period</dt>
              <dd className="mt-1.5 font-semibold text-foreground">
                {ownedSubscription.creditsPerPeriod}
              </dd>
            </div>
            <div className="px-3 py-5 sm:px-5">
              <dt className="text-xs text-muted-foreground">Next renewal</dt>
              <dd className="mt-1.5 font-semibold text-foreground">{renewalDate ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4 border-b pb-3">
              <h2 className="text-base font-semibold text-foreground">Plan benefits</h2>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <ul className="grid gap-x-8 gap-y-3 pt-5 text-sm sm:grid-cols-2">
              {ownedPlan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <AnimatePresence>
            {showUpgradeOptions && upgradePlans.length > 0 ? (
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
                    "relative my-auto w-full rounded-2xl border bg-popover p-6 text-popover-foreground shadow-2xl",
                    upgradePlans.length === 1 && "max-w-md",
                    upgradePlans.length === 2 && "max-w-3xl",
                    upgradePlans.length >= 3 && "max-w-5xl",
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
                    <h2
                      id="upgrade-dialog-title"
                      className="flex items-center gap-2 text-xl font-semibold"
                    >
                      <ArrowUpCircle className="size-5 text-primary" /> Choose a plan to upgrade
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Only plans above {ownedPlan.name} are shown.
                    </p>
                  </div>
                  <div
                    className={cn(
                      "mt-6 grid gap-4",
                      upgradePlans.length === 1 && "grid-cols-1",
                      upgradePlans.length === 2 && "md:grid-cols-2",
                      upgradePlans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3",
                    )}
                  >
                    {upgradePlans.map((upgradePlan) => (
                      <Card key={upgradePlan.id} className="shadow-none">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-xl">{upgradePlan.name}</CardTitle>
                          <CardDescription>{upgradePlan.description}</CardDescription>
                          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                            {upgradePlan.price}
                            <span className="ml-1 text-sm font-sans font-normal text-muted-foreground">
                              {upgradePlan.period}
                            </span>
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {upgradePlan.features.map((feature) => (
                              <li key={feature} className="flex gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            type="button"
                            className="w-full"
                            disabled={pending}
                            onClick={() => onUpgrade(upgradePlan.id)}
                          >
                            {pending ? <LoaderCircle className="animate-spin" /> : <CreditCard />}
                            Upgrade to {upgradePlan.name}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] bg-[radial-gradient(ellipse_at_top,hsl(214_22%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(222_28%_14%),hsl(var(--background))_55%)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-24 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-28 lg:pb-20">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="space-y-3">
            <PageBackLink href={`/payment?plan=${plan.id}`} label="plans" />
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Checkout
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                Complete your subscription
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                <span className="font-medium text-foreground">{plan.name}</span> plan — secure payment
                via Stripe (international cards).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Billing period</p>
            <BillingPeriodSwitch value={period} onChange={onPeriodChange} />
            <p className="text-xs text-muted-foreground">
              {period === "yearly"
                ? "Billed once a year · save 2 months"
                : "Billed every month. Switch to yearly to save 2 months."}
            </p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 size-5 text-accent" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Pay by card</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll be redirected to Stripe Checkout. Plan credits are added automatically
                  after a successful payment.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="h-11 w-full"
              size="lg"
              disabled={pending}
              onClick={onSubscribe}
            >
              {pending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <CreditCard /> Pay {billing.label} with Stripe
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account? After paying, open{" "}
              <a href={workspaceUrl} className="underline">
                workspace
              </a>{" "}
              to use your credits.
            </p>
          </div>
        </motion.div>

        <motion.aside
          className="h-fit space-y-6 overflow-hidden rounded-sm border border-border bg-background p-7 sm:p-8 lg:sticky lg:top-24"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="-mx-7 -mt-7 aspect-[16/9] overflow-hidden border-b sm:-mx-8 sm:-mt-8">
            <img src={plan.imageUrl} alt={`${plan.name} plan`} className="size-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Order summary
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
              {plan.name}
            </h2>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          <ul className="space-y-2.5 border-y border-border py-5 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-muted-foreground">
                <span className="text-accent">→</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground">
                {billing.label}
              </p>
            </div>
            <p className="pb-1 text-sm text-muted-foreground">{billing.periodLabel}</p>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Paid plans include a fixed credit allowance each period. You can buy more credits in the
            workspace whenever you need them.
          </p>

          <Link href="/payment">
            <Button type="button" variant="outline" className="w-full">
              View all plans
            </Button>
          </Link>
        </motion.aside>
      </div>
    </main>
  );
}
