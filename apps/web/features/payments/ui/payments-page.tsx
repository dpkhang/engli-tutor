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
} from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import {
  useBillingMe,
  useSubscribe,
  useTopupCheckout,
  useUpgradePlan,
} from "../hooks/use-billing";
import type { SubscriptionPlan, TopupPack } from "../api/billing";

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
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout");
  const checkoutType = searchParams.get("type");
  const billing = useBillingMe();
  const subscribe = useSubscribe();
  const upgrade = useUpgradePlan();
  const topup = useTopupCheckout();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutState === "success") void billing.refetch();
  }, [checkoutState, billing]);

  const data = billing.data;
  const hasPaidPlan = data?.hasPaidPlan ?? false;
  const stripeReady = data?.stripeConfigured ?? false;
  const balance = data?.balance ?? 0;
  const aiCost = data?.aiGenerateCost ?? 10;
  const lowCredit = balance < aiCost;

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

  const currentPlan = data?.subscription.planId ?? "free";
  const upgradeTarget =
    currentPlan === "growth" ? data?.subscriptionPlans.find((p) => p.id === "scale") : null;

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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-primary/30 shadow-none">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Coins className="size-5 text-primary" /> Số dư credit
              </CardTitle>
              {hasPaidPlan ? (
                <Badge>
                  <Crown className="size-3" /> {data?.subscription.planId}
                </Badge>
              ) : (
                <Badge variant="secondary">Starter (free)</Badge>
              )}
            </div>
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
              {billing.isLoading ? "…" : balance}
              <span className="ml-2 text-base font-normal text-muted-foreground">credits</span>
            </p>
            <CardDescription>
              AI generate: {aiCost} credit/lần
              {hasPaidPlan && data?.subscription.creditsPerPeriod
                ? ` · Gói cộng ${data.subscription.creditsPerPeriod} credit mỗi kỳ`
                : ` · Đăng ký tặng ${data?.signupBonus ?? 50} credit`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowCredit ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Credit sắp hết hoặc không đủ cho AI generate.{" "}
                  {hasPaidPlan ? "Mua thêm credit bên phải." : "Đăng ký gói hoặc nạp credit."}
                </AlertDescription>
              </Alert>
            ) : null}
            {hasPaidPlan && data?.subscription.currentPeriodEnd ? (
              <p className="text-xs text-muted-foreground">
                Gia hạn kỳ tiếp: {formatDate(data.subscription.currentPeriodEnd)}
              </p>
            ) : null}
            <Button asChild variant="outline" className="w-full">
              <Link href="/landing-pages/new">
                <Sparkles /> Tạo landing bằng AI
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!hasPaidPlan ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Chọn gói đăng ký</CardTitle>
                <CardDescription>
                  Growth & Scale — thanh toán thẻ qua Stripe, credit cố định mỗi kỳ.
                </CardDescription>
                <div className="flex gap-2 pt-2">
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
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(data?.subscriptionPlans ?? []).map((plan) => {
                  const price =
                    period === "yearly" ? plan.priceVndMonthly * 10 : plan.priceVndMonthly;
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-4 ${plan.featured ? "border-primary ring-2 ring-primary/15" : ""}`}
                    >
                      <p className="font-semibold">{plan.name}</p>
                      <p className="mt-1 text-2xl font-bold">{formatVnd(price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {period === "yearly" ? "/ năm" : "/ tháng"} · {plan.creditsPerPeriod} credit/kỳ
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {plan.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex gap-1.5">
                            <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-4 w-full"
                        disabled={!stripeReady || Boolean(pending)}
                        onClick={() => void onSubscribe(plan.id)}
                      >
                        {pending === `sub-${plan.id}` ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <>
                            <CreditCard /> Đăng ký bằng thẻ
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <>
              {upgradeTarget ? (
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpCircle className="size-5 text-primary" /> Nâng cấp gói
                    </CardTitle>
                    <CardDescription>
                      Đang dùng {currentPlan} → nâng lên {upgradeTarget.name} (
                      {upgradeTarget.creditsPerPeriod} credit/kỳ).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
            </>
          )}

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
                        <p className="font-medium">
                          {REASON_LABEL[entry.reason] ?? entry.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </p>
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
      </div>
    </div>
  );
}
