"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import { Button, Card, CardContent } from "@landing-page-generator/ui";
import { billingApi, type BillingMe } from "../api/billing";
import { billingMeQueryKey } from "../hooks/use-billing";

type ResultState = "processing" | "success" | "failed";

const PLAN_NAMES: Record<string, string> = {
  growth: "Growth",
  scale: "Scale",
  "boost-100": "Boost 100",
  "boost-500": "Boost 500",
  "boost-1500": "Boost 1500",
};

export function PaymentResultPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const itemId = searchParams.get("item");
  const checkoutType = searchParams.get("type");
  const failureMessage = searchParams.get("message");
  const [state, setState] = useState<ResultState>(checkout === "success" ? "processing" : "failed");
  const [message, setMessage] = useState(
    checkout === "success"
      ? "We're confirming your payment with Stripe. Please keep this page open."
      : failureMessage ??
          (checkout === "cancel"
            ? "You canceled checkout. Your account was not charged and your current plan is unchanged."
            : "Payment did not complete. Please check your payment details and try again."),
  );
  const [confirmedPlanId, setConfirmedPlanId] = useState<string | null>(null);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (checkout !== "success") return;
    if (!sessionId) {
      setState("failed");
      setMessage("Payment session id not found. Please try again from the payments page.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await billingApi.confirm(sessionId);
        if (cancelled) return;

        setConfirmedPlanId(result.planId ?? itemId ?? null);
        if (typeof result.balanceAfter === "number") {
          setBalanceAfter(result.balanceAfter);
          queryClient.setQueryData(billingMeQueryKey, (current: BillingMe | undefined) => {
            if (!current) return current;
            return { ...current, balance: result.balanceAfter! };
          });
        }

        await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
        await queryClient.refetchQueries({ queryKey: billingMeQueryKey });

        setState("success");
        setMessage(
          checkoutType === "topup"
            ? typeof result.balanceAfter === "number"
              ? `Credits have been added. Your new balance is ${result.balanceAfter}.`
              : "Credits have been added to your account and are ready to use."
            : "Your plan is active and benefits have been updated.",
        );
      } catch (error: unknown) {
        if (cancelled) return;
        setState("failed");
        setMessage(error instanceof Error ? error.message : "Couldn't confirm payment. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkout, checkoutType, itemId, queryClient, sessionId]);

  useEffect(() => {
    if (state !== "success") return;
    if (countdown <= 0) {
      router.replace(checkoutType === "topup" ? "/payments" : "/skills");
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [checkoutType, countdown, router, state]);

  const packageName = useMemo(
    () => PLAN_NAMES[confirmedPlanId ?? itemId ?? ""] ?? "selected plan",
    [confirmedPlanId, itemId],
  );

  const Icon = state === "processing" ? LoaderCircle : state === "success" ? Check : CircleX;

  return (
    <main className="workspace-background relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="workspace-ambient pointer-events-none absolute inset-0" />
      <Card className="relative z-10 w-full max-w-xl overflow-hidden text-center shadow-lg">
        <CardContent className="flex flex-col items-center px-6 py-10 sm:px-10">
          <div
            className={`mb-6 grid size-16 place-items-center rounded-full ${
              state === "success"
                ? "bg-emerald-500/12 text-emerald-600"
                : state === "failed"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className={`size-8 ${state === "processing" ? "animate-spin" : ""}`} />
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
            {state === "processing"
              ? "Processing payment"
              : state === "success"
                ? "Payment successful"
                : "Payment failed"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>

          {state !== "processing" ? (
            <div
              className={`mt-7 w-full rounded-2xl border px-5 py-5 text-left ${
                state === "success"
                  ? "border-emerald-500/35 bg-emerald-500/10 shadow-[0_12px_36px_-20px_hsl(145_65%_38%/.65)]"
                  : "border-border bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    state === "success"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {state === "success" ? <Check className="size-5" /> : <CircleX className="size-5" />}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold tracking-[0.14em] uppercase ${
                      state === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {state === "success"
                      ? checkoutType === "topup"
                        ? "Credits added"
                        : "Plan activated"
                      : "Checkout not completed"}
                  </p>
                  <p className="mt-1 truncate text-2xl font-bold text-foreground">{packageName}</p>
                  {state === "success" && balanceAfter != null ? (
                    <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      New balance: {balanceAfter} credits
                    </p>
                  ) : null}
                </div>
              </div>
              {state === "success" ? (
                <p className="mt-4 border-t border-emerald-500/20 pt-3 text-sm text-emerald-800 dark:text-emerald-300">
                  {checkoutType === "topup"
                    ? "Your header credit balance has been updated."
                    : "Plan benefits have been applied to your workspace."}
                </p>
              ) : null}
            </div>
          ) : null}

          {state === "success" ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Redirecting in <strong className="text-foreground">{countdown}s</strong>
            </p>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={checkoutType === "topup" ? "/payments" : "/skills"}>
                {checkoutType === "topup" ? "Back to billing" : "Back to exercises"}
              </Link>
            </Button>
            {state === "failed" ? (
              <Button asChild variant="outline">
                <Link href="/payments">Try payment again</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
