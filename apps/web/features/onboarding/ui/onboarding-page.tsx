"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription, Badge, BillingPeriodSwitch, Button, cn } from "@landing-page-generator/ui";
import { AnimatePresence, motion } from "motion/react";
import { accountApi } from "@/features/accounts/api";
import { LEVELS, type SkillLevel } from "@/features/learn/model/skill-exercises";
import { useBillingMe, useSubscribe } from "@/features/payments/hooks/use-billing";
import { allPlansForCompare } from "@/features/payments/model/plans";
import { setPreferredLevel } from "@/features/settings/model/preferences";
import { useSession } from "@/lib/auth-client";
import { ApiError } from "@landing-page-generator/api-client";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import {
  INTRO_HIGHLIGHTS,
  LEARNING_GOALS,
  NATIVE_LANGUAGE,
  formatVnd,
  goalText,
  needsOnboarding,
  persistWelcomeSeen,
  planPriceVnd,
  safeOnboardingReturnTo,
  setWelcomePending,
  type LearningGoalId,
} from "../model/onboarding";
import { OnboardingBackdrop } from "./onboarding-backdrop";
import { WelcomeScreen } from "./welcome-screen";

const STEPS = [
  { id: "intro", title: "Welcome" },
  { id: "details", title: "Your path" },
  { id: "plans", title: "Upgrade" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

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
          : "border-border bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className={cn("mt-0.5 block text-xs leading-5", active ? "opacity-80" : "text-muted-foreground")}>
        {hint}
      </span>
    </button>
  );
}

export function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const returnTo = useMemo(
    () => safeOnboardingReturnTo(searchParams.get("returnTo")),
    [searchParams],
  );
  const firstName =
    session?.user?.name?.trim()?.split(/\s+/)[0] || session?.user?.email?.split("@")[0] || "there";

  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
    staleTime: CACHE_TIMES.session,
  });
  const billing = useBillingMe();
  const subscribe = useSubscribe();

  const [step, setStep] = useState<StepId>("intro");
  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [goalId, setGoalId] = useState<LearningGoalId>("speak");
  const [customGoal, setCustomGoal] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [planError, setPlanError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const initialProfileCheck = useRef(false);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile || initialProfileCheck.current) return;
    initialProfileCheck.current = true;
    if (!needsOnboarding(profile) && !showWelcome) window.location.replace(returnTo);
  }, [profileQuery.data, returnTo, showWelcome]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    if (profile.targetLevel) setLevel(profile.targetLevel);
    if (profile.learningGoal) {
      const match = LEARNING_GOALS.find(
        (item) => item.id !== "custom" && goalText(item.id, "") === profile.learningGoal,
      );
      if (match) setGoalId(match.id);
      else {
        setGoalId("custom");
        setCustomGoal(profile.learningGoal);
      }
    }
  }, [profileQuery.data]);

  const learningGoal = goalText(goalId, customGoal);
  const detailsReady = Boolean(level) && learningGoal.length > 0;
  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const plans = allPlansForCompare(billing.data?.subscriptionPlans ?? []).filter((plan) => !plan.isFree);
  const stripeReady = billing.data?.stripeConfigured ?? false;

  const saveProfile = useMutation({
    mutationFn: () => {
      if (!level) throw new Error("Choose a level to continue");
      return accountApi.update({
        nativeLanguage: NATIVE_LANGUAGE,
        targetLevel: level,
        learningGoal,
      });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.account, profile);
      if (profile.targetLevel) setPreferredLevel(profile.targetLevel);
    },
  });

  const enterWorkspace = async () => {
    await persistWelcomeSeen(queryClient);
    router.replace(returnTo);
  };

  const finishOnboarding = async () => {
    const profile = await saveProfile.mutateAsync();
    queryClient.setQueryData(queryKeys.account, profile);
    router.prefetch(returnTo);
    setShowWelcome(true);
  };

  const onChoosePaidPlan = async (planId: string) => {
    setPlanError(null);
    setPendingPlan(planId);
    try {
      await saveProfile.mutateAsync();
      const result = await subscribe.mutateAsync({ planId, period });
      if (!result.url) throw new Error("Stripe did not return a checkout URL");
      setWelcomePending(returnTo);
      window.location.assign(result.url);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Couldn't start upgrade. Try again.");
      setPendingPlan(null);
    }
  };

  const saveError =
    saveProfile.error instanceof ApiError
      ? saveProfile.error.message
      : saveProfile.error
        ? "Couldn't save your setup. Try again."
        : null;

  const goNext = () => {
    if (step === "intro") setStep("details");
    else if (step === "details" && detailsReady) setStep("plans");
  };

  const goBack = () => {
    if (step === "details") setStep("intro");
    if (step === "plans") setStep("details");
  };

  const wide = step === "plans";
  const busy = saveProfile.isPending || Boolean(pendingPlan);

  if (showWelcome) {
    return (
      <main className="relative min-h-svh overflow-hidden bg-background">
        <OnboardingBackdrop />
        <WelcomeScreen firstName={firstName} onFinished={enterWorkspace} />
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
        <Link href="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
            <span className="text-sm">E</span>
          </span>
          EngliTutor
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

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
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
                        className="flex gap-3 rounded-2xl border border-border/80 bg-card/75 px-4 py-3.5 shadow-sm backdrop-blur-sm"
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

                <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/75 px-4 py-3.5 backdrop-blur-sm">
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
                        onClick={() => setLevel(item.id)}
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
                        onClick={() => setGoalId(item.id)}
                      />
                    ))}
                  </div>
                  {goalId === "custom" ? (
                    <div>
                      <textarea
                        value={customGoal}
                        onChange={(event) => setCustomGoal(event.target.value)}
                        maxLength={280}
                        rows={4}
                        placeholder="I want to…"
                        className={cn(
                          "w-full min-w-0 rounded-2xl border border-input bg-card/80 px-3 py-3 text-sm shadow-xs outline-none backdrop-blur-sm",
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
                  onChange={setPeriod}
                  className="max-w-md"
                />

                {billing.isLoading ? (
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
                            "relative flex h-full w-full max-w-[18.5rem] flex-col rounded-[1.5rem] border bg-card/80 p-5 shadow-none backdrop-blur-sm sm:max-w-none",
                            plan.featured && "border-primary/50 bg-primary/[0.06] ring-1 ring-primary/15",
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
                              onClick={() => void onChoosePaidPlan(plan.id)}
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
          </motion.div>
        </AnimatePresence>

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
              <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={goBack}>
                <ArrowLeft />
                Back
              </Button>
            )}
            <Button
              type="button"
              className="h-11 flex-1 rounded-full sm:flex-none sm:px-6"
              disabled={step === "details" && !detailsReady}
              onClick={goNext}
            >
              {step === "intro" ? "Get started" : "Continue"}
              <ArrowRight />
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={goBack}>
              <ArrowLeft />
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full px-4 text-muted-foreground"
              disabled={busy}
              onClick={() => void finishOnboarding()}
            >
              {saveProfile.isPending && !pendingPlan ? "Saving…" : "Stay on Free"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
