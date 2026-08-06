"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { PageHeader } from "@/features/layout";
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
  SIGNUP_BONUS: "Thưởng đăng ký",
  PURCHASE: "Nạp credit",
  SUBSCRIPTION_GRANT: "Credit gói đăng ký",
  AI_GENERATE: "AI tạo trang",
  AI_GENERATE_REFUND: "Hoàn credit AI",
  ADJUST: "Điều chỉnh",
};

function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
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
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không đồng bộ được thanh toán. Thử tải lại trang.",
          );
        }
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
  const aiCost = data?.aiGenerateCost ?? 10;
  const lowCredit = balance < aiCost;
  const activePlanId = currentPlanId(data);
  const activePlan = currentPlanDetails(data);
  const comparePlans = allPlansForCompare(data?.subscriptionPlans ?? []);
  const activePlanIndex = comparePlans.findIndex((plan) => plan.id === activePlanId);
  const higherPlans = activePlanIndex < 0 ? [] : comparePlans.slice(activePlanIndex + 1);
  useLockScroll(showUpgradeOptions && higherPlans.length > 0);

  const redirectCheckout = async (url: string | null) => {
    if (!url) {
      setError("Stripe không trả về URL thanh toán");
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
      setError(err instanceof Error ? err.message : "Không tạo được phiên đăng ký");
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
      setError(err instanceof Error ? err.message : "Không nâng cấp được gói");
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
      setError(err instanceof Error ? err.message : "Không tạo được phiên thanh toán");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Thanh toán & credit"
        description={
          hasPaidPlan
            ? "Quản lý gói đăng ký, nâng cấp hoặc mua thêm credit khi cần."
            : "Chọn gói Growth hoặc Scale — mỗi kỳ được cộng credit cố định. Starter miễn phí với 50 credit đăng ký."
        }
      />

      {checkoutState === "success" ? (
        <Alert>
          <AlertDescription>
            {checkoutType === "subscription"
              ? "Đăng ký thành công. Credit kỳ đầu sẽ được cộng sau webhook Stripe."
              : "Thanh toán thành công. Credit sẽ được cộng trong giây lát."}
          </AlertDescription>
        </Alert>
      ) : null}
      {checkoutState === "cancel" ? (
        <Alert variant="destructive">
          <AlertDescription>Đã hủy thanh toán.</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-primary/25 shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={hasPaidPlan ? "default" : "secondary"} className="gap-1">
              {hasPaidPlan ? <Crown className="size-3" /> : null}
              Gói hiện tại
            </Badge>
            {hasPaidPlan && data?.subscription.status ? (
              <Badge variant="outline">
                {STATUS_LABEL[data.subscription.status] ?? data.subscription.status}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
            {billing.isLoading ? "…" : activePlan.name}
          </CardTitle>
          <CardDescription>{activePlan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {billing.isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải thông tin gói…</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
                    <Coins className="size-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Số dư credit</p>
                      <p className="font-semibold">{balance}</p>
                    </div>
                  </div>
                  {hasPaidPlan && data?.subscription.creditsPerPeriod ? (
                    <div className="rounded-xl border px-4 py-3 text-sm">
                      <p className="text-xs text-muted-foreground">Credit mỗi kỳ</p>
                      <p className="font-semibold">{data.subscription.creditsPerPeriod}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border px-4 py-3 text-sm">
                      <p className="text-xs text-muted-foreground">Thưởng đăng ký</p>
                      <p className="font-semibold">{data?.signupBonus ?? 50} credit</p>
                    </div>
                  )}
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">AI generate</dt>
                    <dd className="font-medium">{aiCost} credit/lần</dd>
                  </div>
                  {hasPaidPlan && data?.subscription.billingPeriod ? (
                    <div>
                      <dt className="text-muted-foreground">Chu kỳ</dt>
                      <dd className="font-medium">
                        {PERIOD_LABEL[data.subscription.billingPeriod] ??
                          data.subscription.billingPeriod}
                      </dd>
                    </div>
                  ) : null}
                  {hasPaidPlan && data?.subscription.currentPeriodEnd ? (
                    <div>
                      <dt className="text-muted-foreground">Gia hạn kỳ tiếp</dt>
                      <dd className="font-medium">{formatDate(data.subscription.currentPeriodEnd)}</dd>
                    </div>
                  ) : null}
                </dl>

                {lowCredit ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Credit sắp hết hoặc không đủ cho AI generate.{" "}
                      {hasPaidPlan ? "Mua thêm credit bên dưới." : "Đăng ký gói trả phí bên dưới."}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/landing-pages/new">
                      <Sparkles /> Tạo landing bằng AI
                    </Link>
                  </Button>
                  {higherPlans.length > 0 ? (
                    <Button
                      type="button"
                      disabled={!stripeReady || Boolean(pending)}
                      onClick={() => setShowUpgradeOptions(true)}
                    >
                      <ArrowUpCircle /> Nâng cấp gói
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Phúc lợi đang có</p>
                <ul className="space-y-2.5 rounded-xl border bg-muted/30 p-5 text-sm">
                  {activePlan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
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
              "relative my-auto w-full rounded-2xl border bg-popover p-6 text-popover-foreground shadow-2xl",
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
              aria-label="Đóng"
              onClick={() => setShowUpgradeOptions(false)}
            >
              <X />
            </Button>
            <div className="space-y-2 pr-12">
              <h2 id="upgrade-dialog-title" className="flex items-center gap-2 text-xl font-semibold">
                <ArrowUpCircle className="size-5 text-primary" /> Chọn gói muốn nâng cấp
              </h2>
              <p className="text-sm text-muted-foreground">
                Chỉ những gói cao hơn {activePlan.name} được hiển thị. Chọn một gói để bắt đầu
                thanh toán.
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
                      {p === "monthly" ? "Theo tháng" : "Theo năm (−2 tháng)"}
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
                        "relative shadow-none",
                        plan.featured && "border-primary/40",
                      )}
                    >
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        {plan.featured ? <Badge variant="secondary">Phổ biến</Badge> : null}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                        {formatVnd(price)}
                        <span className="ml-1 text-sm font-sans font-normal text-muted-foreground">
                          {period === "yearly" ? "/ năm" : "/ tháng"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.creditsPerPeriod} credit/kỳ
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
                        className="w-full"
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
                            <CreditCard /> Nâng cấp lên {plan.name}
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
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" /> Mua thêm credit
              </CardTitle>
              <CardDescription>
                Dùng khi hết credit giữa kỳ — thanh toán one-time qua thẻ.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {(data?.topupPacks ?? []).map((pack) => (
                <div key={pack.id} className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">{pack.name}</p>
                  <p className="mt-2 text-xl font-bold">{pack.credits}</p>
                  <p className="text-xs text-muted-foreground">credits</p>
                  <p className="mt-2 text-sm">{formatVnd(pack.priceVnd)}</p>
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    disabled={!stripeReady || Boolean(pending)}
                    onClick={() => void onTopup(pack.id)}
                  >
                    {pending === `top-${pack.id}` ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Mua thêm"
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="size-5 text-primary" /> Lịch sử credit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billing.isLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải…</p>
          ) : !data?.ledger.length ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Chưa có giao dịch.
            </div>
          ) : (
            <ul className="divide-y rounded-xl border">
              {data.ledger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{REASON_LABEL[entry.reason] ?? entry.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        entry.delta >= 0 ? "font-semibold text-primary" : "font-semibold"
                      }
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
