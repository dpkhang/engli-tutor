"use client";

import { memo } from "react";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import { Button, Card, CardContent } from "@engli-tutor/ui";
import { LocalizedLink } from "@/features/i18n/localized-link";

export type PaymentResultState = "processing" | "success" | "failed";

export type PaymentResultPageViewProps = {
  state: PaymentResultState;
  message: string;
  checkoutType: string | null;
  packageName: string;
  countdown: number;
};

export const PaymentResultPageView = memo(function PaymentResultPageView({
  state,
  message,
  checkoutType,
  packageName,
  countdown,
}: PaymentResultPageViewProps) {
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

          <h1 className="font-display text-3xl tracking-tight">
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
                      ? checkoutType === "upgrade"
                        ? "Plan upgraded"
                        : "Plan activated"
                      : "Checkout not completed"}
                  </p>
                  <p className="mt-1 truncate text-2xl font-bold text-foreground">{packageName}</p>
                </div>
              </div>
              {state === "success" ? (
                <p className="mt-4 border-t border-emerald-500/20 pt-3 text-sm text-emerald-800 dark:text-emerald-300">
                  Plan benefits have been applied to your workspace.
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
              <LocalizedLink href="/skills">Back to exercises</LocalizedLink>
            </Button>
            {state === "failed" ? (
              <Button asChild variant="outline">
                <LocalizedLink href="/payments">Try payment again</LocalizedLink>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
});
