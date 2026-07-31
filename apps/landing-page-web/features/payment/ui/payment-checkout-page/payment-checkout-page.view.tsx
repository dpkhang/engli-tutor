"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input, cn } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import {
  BILLING_PERIODS,
  getBillingTotal,
  type BillingPeriod,
  type Plan,
} from "@/features/marketing/model/plans";
import { PAY_METHODS, type PayMethod } from "@/features/payment/model/pay-methods";

export type PaymentCheckoutPageViewProps = {
  plan: Plan;
  period: BillingPeriod;
  method: PayMethod;
  submitted: boolean;
  billing: { total: number; label: string; periodLabel: string };
  isFree: boolean;
  wallet: { title: string; body: string; action: string } | null;
  successMessage: string;
  submitLabel: string;
  workspaceUrl: string;
  onPeriodChange: (period: BillingPeriod) => void;
  onMethodChange: (method: PayMethod) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PaymentCheckoutPageView({
  plan,
  period,
  method,
  submitted,
  billing,
  isFree,
  wallet,
  successMessage,
  submitLabel,
  workspaceUrl,
  onPeriodChange,
  onMethodChange,
  onSubmit,
}: PaymentCheckoutPageViewProps) {
  return (
    <main className="relative min-h-[100svh] bg-[radial-gradient(ellipse_at_top,hsl(158_28%_92%),hsl(var(--background))_55%)]">
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
                {isFree ? "Kích hoạt gói Starter" : "Hoàn tất đăng ký"}
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                Gói <span className="font-medium text-foreground">{plan.name}</span>
                {isFree
                  ? " — không cần thanh toán."
                  : ". Chọn thời hạn và phương thức thanh toán."}
              </p>
            </div>
          </div>

          {!isFree && (
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
                      onClick={() => {
                        onPeriodChange(item.id);
                      }}
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
          )}

          {!isFree && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Phương thức</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PAY_METHODS.map((item) => {
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onMethodChange(item.id);
                      }}
                      className={cn(
                        "cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-accent bg-background ring-1 ring-accent/40"
                          : "border-border bg-background hover:border-accent/40",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                          item.tone,
                        )}
                      >
                        {item.label}
                      </span>
                      <p className="mt-2 text-sm text-muted-foreground">{item.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {submitted ? (
            <motion.div
              className="space-y-4 rounded-2xl border border-accent/40 bg-background p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-[family-name:var(--font-display)] text-2xl text-foreground">
                {isFree ? "Gói Starter đã sẵn sàng" : "Đã nhận yêu cầu thanh toán"}
              </p>
              <p className="text-sm text-muted-foreground">{successMessage}</p>
              <div className="flex flex-wrap gap-3">
                <a href={workspaceUrl}>
                  <Button type="button">Vào workspace</Button>
                </a>
                <Link href="/">
                  <Button type="button" variant="outline">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Email nhận hóa đơn</span>
                <Input
                  name="email"
                  type="email"
                  placeholder="ban@congty.com"
                  className="h-11 w-full bg-background"
                  autoComplete="email"
                  required
                />
              </label>

              {!isFree && method === "card" && (
                <>
                  <label className="block space-y-2 text-sm">
                    <span className="font-medium text-foreground">Số thẻ</span>
                    <Input
                      name="card"
                      inputMode="numeric"
                      placeholder="ACCT-000003"
                      className="h-11 w-full bg-background"
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-2 text-sm">
                      <span className="font-medium text-foreground">Hết hạn</span>
                      <Input
                        name="expiry"
                        placeholder="MM/YY"
                        className="h-11 w-full bg-background"
                        required
                      />
                    </label>
                    <label className="block space-y-2 text-sm">
                      <span className="font-medium text-foreground">CVC</span>
                      <Input
                        name="cvc"
                        inputMode="numeric"
                        placeholder="123"
                        className="h-11 w-full bg-background"
                        required
                      />
                    </label>
                  </div>
                </>
              )}

              {!isFree && method === "transfer" && (
                <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  Sau khi bấm xác nhận, dùng nội dung chuyển khoản{" "}
                  <span className="font-medium text-foreground">
                    PAGECRAFT {plan.name.toUpperCase()}
                  </span>{" "}
                  kèm email đăng ký.
                </p>
              )}

              {!isFree && wallet && (
                <div className="space-y-2 rounded-xl border border-border bg-background px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{wallet.title}</p>
                  <p className="text-sm text-muted-foreground">{wallet.body}</p>
                  <p className="text-xs text-muted-foreground">
                    Demo UI — chưa mở deep-link / QR thật tới ví.
                  </p>
                </div>
              )}

              <Button type="submit" className="h-11 w-full" size="lg">
                {submitLabel}
              </Button>
            </form>
          )}
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

          {!isFree && method === "transfer" && (
            <div className="space-y-2 rounded-2xl bg-muted/80 px-4 py-4 text-sm">
              <p className="font-medium text-foreground">Thông tin chuyển khoản</p>
              <p className="text-muted-foreground">Ngân hàng: VCB · Chi nhánh HCM</p>
              <p className="text-muted-foreground">STK: 0123456789 · CT PAGECRAFT</p>
              <p className="text-muted-foreground">
                Nội dung: PAGECRAFT {plan.name.toUpperCase()}
              </p>
            </div>
          )}

          {!isFree && wallet && (
            <div className="space-y-2 rounded-2xl bg-muted/80 px-4 py-4 text-sm">
              <p className="font-medium text-foreground">Ví đang chọn</p>
              <p className="text-muted-foreground">{wallet.title}</p>
              <p className="text-muted-foreground">
                Số tiền: {billing.label} · Gói {plan.name}
              </p>
            </div>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Demo UI thanh toán. Có thể gắn cổng thật (MoMo / ZaloPay / ShopeePay / PayOS) ở bước
            tiếp theo.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
