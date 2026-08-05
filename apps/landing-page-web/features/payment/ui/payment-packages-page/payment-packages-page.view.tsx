"use client";

import Link from "next/link";
import { Check, Coins, Crown, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, Badge, Button, cn } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { PageBackLink } from "@/features/layout";
import { planCheckoutHref, type Plan, type PlanId } from "@/features/marketing/model/plans";
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
};

const STATUS_LABEL: Record<string, string> = {
  active: "Đang hoạt động",
  ACTIVE: "Đang hoạt động",
  past_due: "Quá hạn thanh toán",
  PAST_DUE: "Quá hạn thanh toán",
  canceled: "Đã hủy",
  CANCELED: "Đã hủy",
  incomplete: "Chưa hoàn tất",
  INCOMPLETE: "Chưa hoàn tất",
};

const PERIOD_LABEL: Record<string, string> = {
  monthly: "Theo tháng",
  yearly: "Theo năm",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}

function currentPlanId(billing: BillingMe | null): PlanId {
  if (!billing || !billing.hasPaidPlan) return "starter";
  return billing.subscription.planId === "free" ? "starter" : billing.subscription.planId;
}

function planBenefits(plan: Plan | undefined, billing: BillingMe | null): string[] {
  if (plan?.features.length) return plan.features;
  if (billing?.hasPaidPlan) {
    const fromApi = billing.subscriptionPlans.find((p) => p.id === billing.subscription.planId);
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
}: PaymentPackagesPageViewProps) {
  const activePlanId = currentPlanId(billing);
  const activePlan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const benefits = planBenefits(activePlan, billing);
  const paidPlan = billing?.hasPaidPlan ?? false;

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
            {isLoggedIn && !billingLoading ? "Gói & phúc lợi của bạn" : "Chọn package phù hợp"}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {isLoggedIn
              ? "Xem gói đang dùng, credit và quyền lợi. Nâng cấp hoặc đổi gói bất cứ lúc nào."
              : "So sánh benefit từng gói. Gói trả phí thanh toán qua Stripe — credit cố định mỗi kỳ."}
          </p>
        </motion.div>

        {checkoutState === "success" ? (
          <Alert>
            <AlertDescription>
              {checkoutType === "subscription"
                ? "Đăng ký thành công. Credit kỳ đầu sẽ được cộng sau vài giây."
                : "Thanh toán thành công. Credit sẽ được cộng trong giây lát."}
            </AlertDescription>
          </Alert>
        ) : null}
        {checkoutState === "cancel" ? (
          <Alert variant="destructive">
            <AlertDescription>Đã hủy thanh toán trên Stripe.</AlertDescription>
          </Alert>
        ) : null}

        {authReady && isLoggedIn ? (
          <motion.section
            className="rounded-3xl border border-primary/25 bg-background p-6 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {billingLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải thông tin gói…</p>
            ) : billing ? (
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={paidPlan ? "default" : "secondary"} className="gap-1">
                      {paidPlan ? <Crown className="size-3" /> : null}
                      Gói hiện tại
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
                        <p className="text-xs text-muted-foreground">Số dư credit</p>
                        <p className="font-semibold">{billing.balance}</p>
                      </div>
                    </div>
                    {paidPlan && billing.subscription.creditsPerPeriod > 0 ? (
                      <div className="rounded-xl border px-4 py-3">
                        <p className="text-xs text-muted-foreground">Credit mỗi kỳ</p>
                        <p className="font-semibold">{billing.subscription.creditsPerPeriod}</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border px-4 py-3">
                        <p className="text-xs text-muted-foreground">Thưởng đăng ký</p>
                        <p className="font-semibold">{billing.signupBonus} credit</p>
                      </div>
                    )}
                  </div>

                  {paidPlan ? (
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      {billing.subscription.billingPeriod ? (
                        <div>
                          <dt className="text-muted-foreground">Chu kỳ</dt>
                          <dd className="font-medium">
                            {PERIOD_LABEL[billing.subscription.billingPeriod] ??
                              billing.subscription.billingPeriod}
                          </dd>
                        </div>
                      ) : null}
                      {billing.subscription.currentPeriodEnd ? (
                        <div>
                          <dt className="text-muted-foreground">Gia hạn kỳ tiếp</dt>
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
                      Quản lý gói trong workspace
                    </Button>
                  </a>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Phúc lợi đang có</p>
                  <ul className="space-y-2.5 rounded-2xl border bg-muted/30 p-5 text-sm">
                    {benefits.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    AI generate: {billing.aiGenerateCost} credit/lần
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không tải được thông tin gói. Thử tải lại trang hoặc đăng nhập lại.
              </p>
            )}
          </motion.section>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {isLoggedIn ? "So sánh các gói" : "Bảng giá"}
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const emphasize = queriedPlan ? plan.id === highlighted : plan.featured;
              const isCurrent = isLoggedIn && !billingLoading && plan.id === activePlanId;

              return (
                <motion.article
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-3xl border p-6 sm:p-7",
                    isCurrent
                      ? "border-primary ring-2 ring-primary/20"
                      : emphasize
                        ? "border-accent/50 bg-foreground text-primary-foreground shadow-[0_24px_60px_-28px_rgba(6,53,45,0.55)] dark:bg-card dark:text-card-foreground"
                        : "border-border bg-background",
                  )}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.06 * index }}
                >
                  {isCurrent ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold tracking-wide text-primary-foreground uppercase">
                      Đang dùng
                    </span>
                  ) : null}

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
                          Phổ biến
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        emphasize && !isCurrent
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
                        emphasize && !isCurrent
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
                            emphasize && !isCurrent
                              ? "text-primary-foreground/85 dark:text-card-foreground/85"
                              : "text-muted-foreground"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button type="button" className="mt-8 w-full" variant="secondary" disabled>
                      Gói hiện tại
                    </Button>
                  ) : (
                    <Link href={planCheckoutHref(plan.id)} className="mt-8 block">
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
