"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { ArrowUpCircle, Check, CreditCard, LoaderCircle, X } from "lucide-react";
import { Badge, Button, cn, useLockScroll } from "@engli-tutor/ui";
import type { BillingPeriod, SubscriptionPlan } from "../../api/billing";
import { useWorkspaceI18n } from "@/features/i18n";
import { formatVnd, planPeriodPrice, PERIOD_SUFFIX_KEY, type ComparePlan } from "../../model/plans";
import { PlanPeriodSwitch } from "../plan-period-switch";

export type UpgradePlansModalProps = {
  open: boolean;
  plans: ComparePlan[];
  hasPaidPlan: boolean;
  activePlanName: string;
  billingPeriod: BillingPeriod | null | undefined;
  period: BillingPeriod;
  stripeReady: boolean;
  pending: string | null;
  loading?: boolean;
  error?: string | null;
  onPeriodChange: (period: BillingPeriod) => void;
  onSubscribe: (planId: SubscriptionPlan["id"]) => void;
  onUpgrade: (planId: SubscriptionPlan["id"]) => void;
  onClose: () => void;
};

export function UpgradePlansModal({
  open,
  plans,
  hasPaidPlan,
  activePlanName,
  billingPeriod,
  period,
  stripeReady,
  pending,
  loading = false,
  error,
  onPeriodChange,
  onSubscribe,
  onUpgrade,
  onClose,
}: UpgradePlansModalProps) {
  const t = useWorkspaceI18n();
  const sheetDragControls = useDragControls();
  const [mounted, setMounted] = useState(false);
  useLockScroll(open && plans.length > 0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, pending]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-100 flex h-dvh min-h-dvh w-full items-end bg-black/45 md:grid md:place-items-center md:overflow-y-auto md:p-4 md:backdrop-blur-[2px]"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-dialog-title"
            className={cn(
              "flex w-full flex-col overflow-hidden border border-white/50 bg-popover text-popover-foreground shadow-2xl",
              "max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-[85dvh] max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] max-md:rounded-t-[1.75rem]",
              "md:relative md:h-auto md:max-h-[calc(100dvh-2rem)] md:rounded-[1.75rem]",
              plans.length <= 1 && "md:max-w-md",
              plans.length === 2 && "md:max-w-3xl",
              plans.length >= 3 && "md:max-w-5xl",
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
            onDragEnd={(_, info) => { if ((info.offset.y > 96 || info.velocity.y > 650) && !pending) onClose(); }}
          >
            <div
              className="relative shrink-0 touch-none cursor-grab border-b border-border bg-popover px-4 pt-7 pb-4 active:cursor-grabbing sm:px-8 sm:pt-8 sm:pb-5 md:cursor-default"
              onPointerDown={(event) => {
                if (window.innerWidth >= 768 || (event.target as HTMLElement).closest("button")) return;
                sheetDragControls.start(event);
              }}
            >
              <span className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/25 sm:hidden" aria-hidden />
              <Button type="button" variant="ghost" size="icon" className="absolute top-3 right-3 sm:top-4 sm:right-4" aria-label={t("billing.modal.close")} disabled={Boolean(pending)} onClick={onClose}><X /></Button>
              <div className="space-y-2 pr-12">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">{t("billing.modal.eyebrow")}</p>
                <h2 id="upgrade-dialog-title" className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl"><ArrowUpCircle className="size-5 text-primary" /> {t("workspace.unlockMorePractice")}</h2>
                <p className="text-sm text-muted-foreground">{hasPaidPlan ? t("billing.modal.subtitlePaid", { plan: activePlanName }) : t("billing.modal.subtitleFree")}</p>
              </div>
            </div>
            <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-md:flex-1 sm:space-y-5 sm:px-8 sm:pt-5 sm:pb-6">
              {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
              {!hasPaidPlan ? <PlanPeriodSwitch value={period} onChange={onPeriodChange} /> : null}
              {loading ? <p className="text-sm text-muted-foreground">{t("workspace.loadingPlansEllipsis")}</p> : null}
              {!loading && plans.length === 0 ? <p className="text-sm text-muted-foreground">{t("billing.modal.empty")}</p> : null}
              <div className={cn("grid items-stretch gap-4", plans.length === 1 && "grid-cols-1", plans.length === 2 && "sm:grid-cols-2", plans.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3")}>
                {plans.map((plan) => {
                  const shownPeriod = hasPaidPlan ? (billingPeriod ?? "monthly") : period;
                  const price = planPeriodPrice(plan, shownPeriod);
                  const discount = plan.periodPrices?.[shownPeriod]?.discountPercent ?? 0;
                  return (
                    <article key={plan.id} className={cn("relative flex h-full flex-col rounded-[1.25rem] border bg-card p-5", plan.featured && "border-primary/50 bg-primary/3 ring-1 ring-primary/15")}>
                      <div className="flex items-start justify-between gap-2"><h3 className="text-xl font-semibold">{plan.name}</h3>{plan.featured ? <Badge className="rounded-full">{t("workspace.mostPopular")}</Badge> : null}</div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                      <p className="mt-4 wrap-break-word font-display text-xl tracking-tight sm:text-2xl">{formatVnd(price)}<span className="ml-1 text-sm font-sans font-normal text-muted-foreground">{t(PERIOD_SUFFIX_KEY[shownPeriod])}</span></p>
                      {discount > 0 ? <p className="mt-1 text-xs text-muted-foreground">{t("billing.modal.saveVsMonthly", { discount, price: formatVnd(plan.priceVndMonthly) })}</p> : null}
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}</ul>
                      <div className="mt-auto pt-5">
                        <Button className="h-11 w-full rounded-full" disabled={!stripeReady || Boolean(pending)} onClick={() => hasPaidPlan ? onUpgrade(plan.id) : onSubscribe(plan.id)}>
                          {pending === `${hasPaidPlan ? "up" : "sub"}-${plan.id}` ? <LoaderCircle className="animate-spin" /> : <CreditCard />}{hasPaidPlan ? t("workspace.upgradeTo") : t("billing.modal.choose")} {plan.name}
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
  );
}
