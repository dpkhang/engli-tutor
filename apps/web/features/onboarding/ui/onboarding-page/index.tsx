"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { type SkillLevel } from "@/features/learn/model/skill-exercises";
import { useBillingMe, useSubscribe } from "@/features/payments/hooks/use-billing";
import { allPlansForCompare } from "@/features/payments/model/plans";
import { setPreferredLevel } from "@/features/settings";
import { useSession } from "@/lib/auth-client";
import { ApiError } from "@landing-page-generator/api-client";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import {
  LEARNING_GOALS,
  NATIVE_LANGUAGE,
  goalText,
  needsOnboarding,
  persistWelcomeSeen,
  safeOnboardingReturnTo,
  setWelcomePending,
  type LearningGoalId,
} from "../../model/onboarding";
import { OnboardingPageView, type OnboardingStepId } from "./onboarding-page.view";

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

  const [step, setStep] = useState<OnboardingStepId>("intro");
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
  const plans = useMemo(
    () => allPlansForCompare(billing.data?.subscriptionPlans ?? []).filter((plan) => !plan.isFree),
    [billing.data?.subscriptionPlans],
  );
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

  const enterWorkspace = useCallback(async () => {
    await persistWelcomeSeen(queryClient);
    router.replace(returnTo);
  }, [queryClient, returnTo, router]);

  const finishOnboarding = useCallback(async () => {
    const profile = await saveProfile.mutateAsync();
    queryClient.setQueryData(queryKeys.account, profile);
    router.prefetch(returnTo);
    setShowWelcome(true);
  }, [queryClient, returnTo, router, saveProfile]);

  const onChoosePaidPlan = useCallback(
    async (planId: string) => {
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
    },
    [period, returnTo, saveProfile, subscribe],
  );

  const saveError =
    saveProfile.error instanceof ApiError
      ? saveProfile.error.message
      : saveProfile.error
        ? "Couldn't save your setup. Try again."
        : null;

  const goNext = useCallback(() => {
    if (step === "intro") setStep("details");
    else if (step === "details" && detailsReady) setStep("plans");
  }, [detailsReady, step]);

  const goBack = useCallback(() => {
    if (step === "details") setStep("intro");
    if (step === "plans") setStep("details");
  }, [step]);

  useEffect(() => {
    if (showWelcome) return;
    window.scrollTo(0, 0);
  }, [step, showWelcome]);

  const onStayFree = useCallback(() => {
    void finishOnboarding();
  }, [finishOnboarding]);

  return (
    <OnboardingPageView
      firstName={firstName}
      showWelcome={showWelcome}
      step={step}
      level={level}
      goalId={goalId}
      customGoal={customGoal}
      period={period}
      plans={plans}
      billingLoading={billing.isLoading}
      stripeReady={stripeReady}
      detailsReady={detailsReady}
      busy={saveProfile.isPending || Boolean(pendingPlan)}
      savePending={saveProfile.isPending}
      pendingPlan={pendingPlan}
      saveError={saveError}
      planError={planError}
      onFinishedWelcome={enterWorkspace}
      onLevelChange={setLevel}
      onGoalChange={setGoalId}
      onCustomGoalChange={setCustomGoal}
      onPeriodChange={setPeriod}
      onChoosePaidPlan={onChoosePaidPlan}
      onNext={goNext}
      onBack={goBack}
      onStayFree={onStayFree}
    />
  );
}
