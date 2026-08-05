"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpCircle,
  Check,
  Coins,
  CreditCard,
  Crown,
  LoaderCircle,
  ReceiptText,
  Sparkles,
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
      await upgrade.mutateAsync(planId);
      await billing.refetch();
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

  const upgradeTarget =
    activePlanId === "growth" ? data?.subscriptionPlans.find((p) => p.id === "scale") : null;

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

                <Button asChild variant="outline">
                  <Link href="/landing-pages/new">
                    <Sparkles /> Tạo landing bằng AI
                  </Link>
                </Button>
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

      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          So sánh các gói
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {comparePlans.map((plan) => {
            const isCurrent = !billing.isLoading && plan.id === activePlanId;
            const price =
              period === "yearly" && !plan.isFree
                ? plan.priceVndMonthly * 10
                : plan.priceVndMonthly;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative shadow-none",
                  isCurrent && "border-primary ring-2 ring-primary/15",
                  !isCurrent && plan.featured && "border-primary/40",
                )}
              >
                {isCurrent ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold tracking-wide text-primary-foreground uppercase">
                    Đang dùng
                  </span>
                ) : null}
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.featured && !isCurrent ? (
                      <Badge variant="secondary">Phổ biến</Badge>
                    ) : null}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                    {plan.isFree ? "0đ" : formatVnd(price)}
                    <span className="ml-1 text-sm font-sans font-normal text-muted-foreground">
                      {plan.isFree
                        ? "mãi mãi"
                        : period === "yearly"
                          ? "/ năm"
                          : "/ tháng"}
                    </span>
                  </p>
                  {!plan.isFree ? (
                    <p className="text-xs text-muted-foreground">
                      {plan.creditsPerPeriod} credit/kỳ
                    </p>
                  ) : null}
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
                  {isCurrent ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Gói hiện tại
                    </Button>
                  ) : plan.isFree ? (
                    <Button className="w-full" variant="outline" disabled>
                      Miễn phí khi đăng ký
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={!stripeReady || Boolean(pending) || hasPaidPlan}
                      onClick={() => void onSubscribe(plan.id as SubscriptionPlan["id"])}
                    >
                      {pending === `sub-${plan.id}` ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <>
                          <CreditCard /> Đăng ký bằng thẻ
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!hasPaidPlan ? (
          <div className="flex gap-2">
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
      </div>

      {hasPaidPlan ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {upgradeTarget ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="size-5 text-primary" /> Nâng cấp gói
                </CardTitle>
                <CardDescription>
                  Đang dùng {activePlan.name} → nâng lên {upgradeTarget.name} (
                  {upgradeTarget.creditsPerPeriod} credit/kỳ).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
                  {upgradeTarget.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={upgrade.isPending}
                  onClick={() => void onUpgrade(upgradeTarget.id)}
                >
                  {pending === `up-${upgradeTarget.id}` ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    `Nâng cấp lên ${upgradeTarget.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className={cn("shadow-none", !upgradeTarget && "lg:col-span-2")}>
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
