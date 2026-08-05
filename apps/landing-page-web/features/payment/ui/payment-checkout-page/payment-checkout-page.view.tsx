"use client";

import Link from "next/link";
import { CreditCard, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, Button, cn } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import {
  BILLING_PERIODS,
  getBillingTotal,
  type BillingPeriod,
  type Plan,
} from "@/features/marketing/model/plans";

export type PaymentCheckoutPageViewProps = {
  plan: Plan;
  period: BillingPeriod;
  billing: { total: number; label: string; periodLabel: string };
  isFree: boolean;
  pending: boolean;
  error: string | null;
  workspaceUrl: string;
  onPeriodChange: (period: BillingPeriod) => void;
  onSubscribe: () => void;
};

export function PaymentCheckoutPageView({
  plan,
  period,
  billing,
  isFree,
  pending,
  error,
  workspaceUrl,
  onPeriodChange,
  onSubscribe,
}: PaymentCheckoutPageViewProps) {
  if (isFree) {
    return (
      <main className="grid min-h-[100svh] place-items-center px-5">
        <p className="text-sm text-muted-foreground">Đang chuyển tới đăng ký miễn phí…</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] bg-[radial-gradient(ellipse_at_top,hsl(158_28%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(166_24%_15%),hsl(var(--background))_55%)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-24 pb-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-28 lg:pb-20">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="space-y-3">
            <PageBackLink href={`/payment?plan=${plan.id}`} label="danh sách gói" />
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Thanh toán
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                Hoàn tất đăng ký
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                Gói <span className="font-medium text-foreground">{plan.name}</span> — thanh toán
                an toàn qua Stripe (thẻ quốc tế).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Thời hạn gói</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BILLING_PERIODS.map((item) => {
                const active = period === item.id;
                const preview = getBillingTotal(plan, item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onPeriodChange(item.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border px-4 py-4 text-left transition-colors",
                      active
                        ? "border-accent bg-foreground text-primary-foreground"
                        : "border-border bg-background hover:border-accent/50",
                    )}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p
                      className={cn(
                        "mt-1 font-[family-name:var(--font-display)] text-xl",
                        active ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {preview.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        active ? "text-primary-foreground/65" : "text-muted-foreground",
                      )}
                    >
                      {item.hint}
                      {item.id === "yearly" ? " · thanh toán một lần" : ""}
                    </p>
                  </button>
                );
              })}
            </div>
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
                <p className="text-sm font-medium text-foreground">Thanh toán bằng thẻ</p>
                <p className="text-sm text-muted-foreground">
                  Bạn sẽ được chuyển sang trang thanh toán Stripe. Credit gói được cộng tự động
                  sau khi thanh toán thành công.
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
                  <CreditCard /> Thanh toán {billing.label} qua Stripe
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Đã có tài khoản? Sau khi thanh toán, mở{" "}
              <a href={workspaceUrl} className="underline">
                workspace
              </a>{" "}
              để dùng credit.
            </p>
          </div>
        </motion.div>

        <motion.aside
          className="h-fit space-y-6 rounded-3xl border border-border bg-background p-7 sm:p-8 lg:sticky lg:top-24"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Tóm tắt đơn
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
              <p className="text-xs text-muted-foreground">Tổng cộng</p>
              <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground">
                {billing.label}
              </p>
            </div>
            <p className="pb-1 text-sm text-muted-foreground">{billing.periodLabel}</p>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Gói trả phí bao gồm credit cố định mỗi kỳ. Bạn có thể mua thêm credit trong workspace
            khi cần.
          </p>

          <Link href="/payment">
            <Button type="button" variant="outline" className="w-full">
              Xem tất cả gói
            </Button>
          </Link>
        </motion.aside>
      </div>
    </main>
  );
}
