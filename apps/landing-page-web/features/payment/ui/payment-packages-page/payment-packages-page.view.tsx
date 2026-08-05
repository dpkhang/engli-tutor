"use client";

import Link from "next/link";
import { Button, cn } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import type { Plan, PlanId } from "@/features/marketing/model/plans";

export type PaymentPackagesPageViewProps = {
  plans: Plan[];
  queriedPlan: string | null;
  highlighted: PlanId;
};

export function PaymentPackagesPageView({
  plans,
  queriedPlan,
  highlighted,
}: PaymentPackagesPageViewProps) {
  return (
    <main className="relative min-h-[100svh] bg-[radial-gradient(ellipse_at_top,hsl(158_28%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(166_24%_15%),hsl(var(--background))_55%)]">
      <div className="mx-auto max-w-6xl space-y-10 px-5 pt-24 pb-16 sm:px-8 lg:pt-28 lg:pb-20">
        <PageBackLink href="/" label="trang chủ" />

        <motion.div
          className="mx-auto max-w-2xl space-y-3 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            Gói dịch vụ
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            Chọn package phù hợp
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            So sánh benefit từng gói. Sau khi chọn, bạn sẽ chọn thời hạn và phương thức thanh toán.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const emphasize = queriedPlan ? plan.id === highlighted : plan.featured;

            return (
              <motion.article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-3xl border p-6 sm:p-7",
                  emphasize
                    ? "border-accent/50 bg-foreground text-primary-foreground shadow-[0_24px_60px_-28px_rgba(6,53,45,0.55)] dark:bg-card dark:text-card-foreground"
                    : "border-border bg-background",
                )}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 * index }}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                      {plan.name}
                    </h2>
                    {plan.featured ? (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                          emphasize
                            ? "bg-accent text-accent-foreground"
                            : "bg-accent/15 text-accent",
                        )}
                      >
                        Phổ biến
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      emphasize
                        ? "text-primary-foreground/75 dark:text-muted-foreground"
                        : "text-muted-foreground",
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
                      emphasize
                        ? "text-primary-foreground/65 dark:text-muted-foreground"
                        : "text-muted-foreground",
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
                          emphasize
                            ? "text-primary-foreground/85 dark:text-card-foreground/85"
                            : "text-muted-foreground"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={`/payment/checkout?plan=${plan.id}`} className="mt-8 block">
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
              </motion.article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
