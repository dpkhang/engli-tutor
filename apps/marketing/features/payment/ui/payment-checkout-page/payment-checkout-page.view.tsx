"use client";

import { memo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  Check,
  CheckCircle2,
  CreditCard,
  MessageCircle,
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
} from "@engli-tutor/ui";
import { AnimatePresence, motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import { useMarketingI18n } from "@/features/i18n";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { usePathname } from "next/navigation";
import {
  billingPeriodLabel,
  type BillingPeriod,
  type Plan,
  type PlanId,
} from "@/features/marketing";

const PERIOD_NOTE: Record<BillingPeriod, string> = {
  monthly: "Billed every month. Pay for 3 months to save 15%, or a year to save 40%.",
  quarterly: "Billed every 3 months · save 15%",
  yearly: "Billed once a year · save 40%",
};

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
  } | null;
  dailyChatLimit: number | null | undefined;
  chatsUsedToday: number | null;
  onPeriodChange: (period: BillingPeriod) => void;
  onSubscribe: () => void;
  onUpgrade: (planId: PlanId) => void;
};

export const PaymentCheckoutPageView = memo(function PaymentCheckoutPageView({
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
  dailyChatLimit,
  chatsUsedToday,
  onPeriodChange,
  onSubscribe,
  onUpgrade,
}: PaymentCheckoutPageViewProps) {
  const t = useMarketingI18n();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : "en";
  const localize = (href: string) => href.startsWith("/") ? `/${locale}${href}` : href;
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  useLockScroll(showUpgradeOptions && upgradePlans.length > 0);

  if (isFree || checkingBilling) {
    return (
      <main className="marketing-container marketing-page grid min-h-svh place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {isFree ? t("checkout.redirectingFree") : t("checkout.checkingPlan")}
        </div>
      </main>
    );
  }

  if (ownedPlan && ownedSubscription) {
    const periodLabel = billingPeriodLabel(ownedSubscription.billingPeriod);
    const renewalDate = ownedSubscription.currentPeriodEnd
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
          new Date(ownedSubscription.currentPeriodEnd),
        )
      : null;

    return (
      <main className="marketing-page min-h-svh bg-background">
        <motion.section
          className="marketing-container"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-background/90 p-5 text-primary shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3" role="status">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 drop-shadow-sm" />
              <div className="max-w-lg">
                <p className="text-base font-semibold sm:text-lg">
                  {t("checkout.subscribedTo")} {ownedPlan.name}
                </p>
                <p className="mt-1 text-sm text-foreground/70">
                  {t("checkout.activeBenefitsReady")}
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
                  <ArrowUpCircle /> {t("checkout.upgradePlan")}
                </Button>
              ) : null}
              <Button
                asChild
                variant={upgradePlans.length > 0 ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                <a href={workspaceUrl}>{t("checkout.workspace")}</a>
              </Button>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="relative mt-6 h-52 overflow-hidden rounded-2xl border border-border/70 shadow-lg sm:h-64">
            <img
              src={ownedPlan.imageUrl}
              alt={`${ownedPlan.name} plan`}
              className="size-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="text-xs font-semibold tracking-[0.14em] text-white/75 uppercase">
                {t("checkout.currentPlan")} · {periodLabel}
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
                {ownedPlan.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/80">{ownedPlan.description}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-border/80 bg-background/90 text-sm shadow-sm sm:grid-cols-4">
            <div className="border-r border-b px-3 py-5 sm:border-b-0 sm:px-5">
              <dt className="text-xs text-muted-foreground">{t("checkout.billingCycle")}</dt>
              <dd className="mt-1.5 font-semibold text-foreground">{periodLabel}</dd>
            </div>
            <div className="border-b px-3 py-5 sm:border-r sm:border-b-0 sm:px-5">
              <dt className="text-xs text-muted-foreground">{t("checkout.tutorChatsPerDay")}</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                <MessageCircle className="size-4 text-primary" />
                {dailyChatLimit === null ? t("checkout.unlimited") : (dailyChatLimit ?? "—")}
              </dd>
            </div>
            <div className="border-r px-3 py-5 sm:px-5">
              <dt className="text-xs text-muted-foreground">{t("checkout.chatsUsedToday")}</dt>
              <dd className="mt-1.5 font-semibold text-foreground">{chatsUsedToday ?? 0}</dd>
            </div>
            <div className="px-3 py-5 sm:px-5">
              <dt className="text-xs text-muted-foreground">{t("checkout.nextRenewal")}</dt>
              <dd className="mt-1.5 font-semibold text-foreground">{renewalDate ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-8 rounded-2xl border border-border/80 bg-background/90 p-5 shadow-sm sm:p-6">
            <div className="flex items-end justify-between gap-4 border-b pb-3">
              <h2 className="text-base font-semibold text-foreground">{t("checkout.planBenefits")}</h2>
              <span className="text-xs text-muted-foreground">{t("checkout.active")}</span>
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
                className="fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-black/45 p-4 backdrop-blur-[2px]"
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
                    "relative my-auto w-full min-w-0 rounded-2xl border border-border/80 bg-popover p-5 text-popover-foreground shadow-2xl sm:p-6",
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
                    aria-label={t("common.actions.cancel")}
                    onClick={() => setShowUpgradeOptions(false)}
                  >
                    <X />
                  </Button>
                  <div className="space-y-2 pr-12">
                    <h2
                      id="upgrade-dialog-title"
                      className="flex items-center gap-2 text-xl font-semibold"
                    >
                      <ArrowUpCircle className="size-5 shrink-0 text-primary" /> {t("checkout.chooseUpgrade")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("checkout.onlyPlansAbove")} {ownedPlan.name} {t("checkout.plans")}
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
                      <Card key={upgradePlan.id} className="rounded-2xl border-border/80 shadow-sm">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-xl">{upgradePlan.name}</CardTitle>
                          <CardDescription>{upgradePlan.description}</CardDescription>
                          <p className="font-display text-2xl tracking-tight">
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
    <main className="relative min-h-svh bg-[radial-gradient(ellipse_at_top,hsl(214_22%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(222_28%_14%),hsl(var(--background))_55%)]">
      <div className="marketing-container marketing-page grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <motion.div
          className="min-w-0 space-y-6 sm:space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="space-y-3">
            <PageBackLink href={localize(`/payment?plan=${plan.id}`)} label={t("checkout.plans")} />
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Checkout
              </p>
              <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                {t("checkout.completeSubscription")}
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                <span className="font-medium text-foreground">{plan.name}</span> plan — secure
                {t("checkout.securePayment")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("checkout.billingPeriod")}</p>
            <BillingPeriodSwitch value={period} onChange={onPeriodChange} />
            <p className="text-xs text-muted-foreground">{PERIOD_NOTE[period]}</p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-border/80 bg-background/90 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 size-5 text-accent" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t("checkout.payByCard")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("checkout.stripeDescription")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="h-auto min-h-11 w-full py-2 whitespace-normal"
              size="lg"
              disabled={pending}
              onClick={onSubscribe}
            >
              {pending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <CreditCard /> {t("checkout.payWithStripe")} {billing.label}
                </>
              )}
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" size="sm" className="min-h-11">
                <Link href={localize("/policy")} target="_blank" rel="noopener noreferrer">{t("checkout.privacy")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="min-h-11">
                <Link href={localize("/policy/cookies")} target="_blank" rel="noopener noreferrer">{t("checkout.cookies")}</Link>
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              After paying, open{" "}
              <a href={workspaceUrl} className="underline">
                workspace
              </a>{" "}
              to start practicing.
            </p>
          </div>
        </motion.div>

        <motion.aside
          className="h-fit min-w-0 space-y-5 overflow-hidden rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur sm:space-y-6 sm:p-8 lg:sticky lg:top-24"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="-mx-5 -mt-5 aspect-video overflow-hidden border-b sm:-mx-8 sm:-mt-8">
            <img src={plan.imageUrl} alt={`${plan.name} plan`} className="size-full object-cover" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Order summary
            </p>
            <h2 className="font-display text-2xl text-foreground">{plan.name}</h2>
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

          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">{t("checkout.total")}</p>
              <p className="font-display text-3xl tracking-tight text-foreground">
                {billing.label}
              </p>
            </div>
            <p className="pb-1 text-sm text-muted-foreground">{billing.periodLabel}</p>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Daily limits reset at midnight (Vietnam time). Cancel anytime — you keep access until
            the end of the paid period.
          </p>

          <Link href="/payment">
            <Button type="button" variant="outline" className="min-h-11 w-full">
              View all plans
            </Button>
          </Link>
        </motion.aside>
      </div>
    </main>
  );
});
