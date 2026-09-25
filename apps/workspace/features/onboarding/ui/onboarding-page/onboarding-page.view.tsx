"use client";

import { memo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  Check,
  Compass,
  Crown,
  Gamepad2,
  Headphones,
  LoaderCircle,
  Mic2,
  Sparkles,
  Target,
} from "lucide-react";
import { Alert, AlertDescription, Badge, BillingPeriodSwitch, BrandLogo, Button, cn } from "@engli-tutor/ui";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { allPlansForCompare } from "@/features/payments/model/plans";
import {
  INTRO_HIGHLIGHTS,
  LEARNING_GOALS,
  formatVnd,
  planPriceVnd,
  type LearningGoalId,
} from "../../model/onboarding";
import { OnboardingBackdrop } from "../onboarding-backdrop";
import { WelcomeScreen } from "../welcome-screen";

const STEPS = [
  { id: "intro", title: "Welcome" },
  { id: "details", title: "Your path" },
  { id: "plans", title: "Upgrade" },
] as const;

export type OnboardingStepId = (typeof STEPS)[number]["id"];

type OnboardingPlan = ReturnType<typeof allPlansForCompare>[number];

const INTRO_ICONS = [Mic2, Headphones, Gamepad2, Compass] as const;

function OptionCard({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3.5 text-left transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className={cn("mt-0.5 block text-xs leading-5", active ? "opacity-80" : "text-muted-foreground")}>
        {hint}
      </span>
    </button>
  );
}

export type OnboardingPageViewProps = {
  firstName: string;
  showWelcome: boolean;
  step: OnboardingStepId;
  level: SkillLevel | null;
  goalId: LearningGoalId;
  customGoal: string;
  period: "monthly" | "yearly";
  plans: OnboardingPlan[];
  billingLoading: boolean;
  stripeReady: boolean;
  detailsReady: boolean;
  busy: boolean;
  savePending: boolean;
  pendingPlan: string | null;
  saveError: string | null;
  planError: string | null;
  onFinishedWelcome: () => void | Promise<void>;
  onLevelChange: (level: SkillLevel) => void;
  onGoalChange: (goalId: LearningGoalId) => void;
  onCustomGoalChange: (value: string) => void;
  onPeriodChange: (period: "monthly" | "yearly") => void;
  onChoosePaidPlan: (planId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onStayFree: () => void;
};

export const OnboardingPageView = memo(function OnboardingPageView({
  firstName,
  showWelcome,
  step,
  level,
  goalId,
  customGoal,
  period,
  plans,
  billingLoading,
  stripeReady,
  detailsReady,
  busy,
  savePending,
  pendingPlan,
  saveError,
  planError,
  onFinishedWelcome,
  onLevelChange,
  onGoalChange,
  onCustomGoalChange,
  onPeriodChange,
  onChoosePaidPlan,
  onNext,
  onBack,
  onStayFree,
}: OnboardingPageViewProps) {
  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const wide = step === "plans";

  if (showWelcome) {
    return (
      <main className="relative min-h-svh overflow-hidden bg-background">
        <OnboardingBackdrop />
        <WelcomeScreen firstName={firstName} onFinished={onFinishedWelcome} />
      </main>
    );
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <OnboardingBackdrop />

      <header
        className={cn(
          "relative z-10 mx-auto flex items-center justify-between px-5 py-6",
          wide ? "max-w-3xl" : "max-w-lg sm:px-0",
        )}
      >
        <Link href="/" className="group flex items-center">
          <BrandLogo size={32} />
        </Link>
        <span className="text-xs font-medium text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </header>

      <div className={cn("relative z-10 mx-auto w-full px-5 pb-16", wide ? "max-w-3xl" : "max-w-lg sm:px-0")}>
        <div className="mb-6 flex gap-1.5" aria-hidden>
          {STEPS.map((item, index) => (
            <span
              key={item.id}
              className={cn("h-1 flex-1 rounded-full", index <= stepIndex ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>

        <div key={step} className="auth-enter">
            {step === "intro" ? (
              <section className="space-y-6">
                <p className="text-sm font-medium text-primary">Welcome, {firstName}</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  English that fits into your day
                </h1>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                  EngliTutor is your AI coach for speaking, skills practice, and exam prep — with
                  explanations in Vietnamese when you need them.
                </p>
                <ul className="grid gap-2.5">
                  {INTRO_HIGHLIGHTS.map((item, index) => {
                    const Icon = INTRO_ICONS[index] ?? Sparkles;
                    return (
                      <li
                        key={item.title}
                        className="flex gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-3.5 shadow-sm"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{item.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                            {item.hint}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {step === "details" ? (
              <section className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-primary">Your details</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Tell us how you learn
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Native language is Vietnamese. Pick a level and a goal — you can change this later.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-4 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg">
                    🇻🇳
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Vietnamese</span>
                    <span className="text-xs text-muted-foreground">
                      Explanations and coaching stay in Tiếng Việt.
                    </span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="size-4 text-primary" />
                    Target level
                  </div>
                  <div className="grid gap-2.5">
                    {LEVELS.map((item) => (
                      <OptionCard
                        key={item.id}
                        active={level === item.id}
                        title={`${item.id} · ${item.labelVi}`}
                        hint={item.blurb}
                        onClick={() => onLevelChange(item.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-primary" />
                    Learning goal
                  </div>
                  <div className="grid gap-2.5">
                    {LEARNING_GOALS.map((item) => (
                      <OptionCard
                        key={item.id}
                        active={goalId === item.id}
                        title={item.label}
                        hint={item.hint}
                        onClick={() => onGoalChange(item.id)}
                      />
                    ))}
                  </div>
                  {goalId === "custom" ? (
                    <div>
                      <textarea
                        value={customGoal}
                        onChange={(event) => onCustomGoalChange(event.target.value)}
                        maxLength={280}
                        rows={4}
                        placeholder="I want to…"
                        className={cn(
                          "w-full min-w-0 rounded-2xl border border-input bg-card px-3 py-3 text-sm shadow-xs outline-none",
                          "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40",
                        )}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{customGoal.length}/280</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {step === "plans" ? (
              <section className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-primary">Upgrade</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Upgrade from Free
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    You’re on Free. Upgrade to Standard or Premium for more AI speaking time. Skip
                    to keep learning on Free.
                  </p>
                </div>

                <BillingPeriodSwitch
                  value={period}
                  onChange={onPeriodChange}
                  className="max-w-md"
                />

                {billingLoading ? (
                  <p className="text-sm text-muted-foreground">Loading plans…</p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4 sm:grid sm:grid-cols-2 sm:items-stretch">
                    {plans.map((plan) => {
                      const price = planPriceVnd(plan.priceVndMonthly, period);
                      const choosing = pendingPlan === plan.id;
                      return (
                        <article
                          key={plan.id}
                          className={cn(
                            "relative flex h-full w-full max-w-74 flex-col rounded-3xl border bg-card p-5 shadow-none sm:max-w-none",
                            plan.featured && "border-primary/50 bg-primary/6 ring-1 ring-primary/15",
                          )}
                        >
                          {plan.featured ? (
                            <Badge className="absolute top-4 right-4 rounded-full">
                              <Crown className="size-3" /> Most popular
                            </Badge>
                          ) : null}
                          <h2 className="pr-28 text-xl font-semibold">{plan.name}</h2>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                          <p className="mt-4 text-2xl font-semibold tracking-tight">
                            {formatVnd(price)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                              {period === "yearly" ? "/ year" : "/ month"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {plan.creditsPerPeriod} practice credits / period
                          </p>
                          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto pt-5">
                            <Button
                              type="button"
                              className="h-11 w-full rounded-full"
                              disabled={!stripeReady || busy}
                              onClick={() => onChoosePaidPlan(plan.id)}
                            >
                              {choosing ? (
                                <LoaderCircle className="animate-spin" />
                              ) : (
                                <>
                                  <ArrowUpCircle /> Upgrade to {plan.name}
                                </>
                              )}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : null}
          </div>

        {saveError || planError ? (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{saveError || planError}</AlertDescription>
          </Alert>
        ) : null}

        {step !== "plans" ? (
          <div className="mt-8 flex items-center gap-3">
            {step === "intro" ? (
              <span className="flex-1" />
            ) : (
              <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={onBack}>
                <ArrowLeft />
                Back
              </Button>
            )}
            <Button
              type="button"
              className="h-11 flex-1 rounded-full sm:flex-none sm:px-6"
              disabled={step === "details" && !detailsReady}
              onClick={onNext}
            >
              {step === "intro" ? "Get started" : "Continue"}
              <ArrowRight />
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={onBack}>
              <ArrowLeft />
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full px-4 text-muted-foreground"
              disabled={busy}
              onClick={onStayFree}
            >
              {savePending && !pendingPlan ? "Saving…" : "Stay on Free"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
});
