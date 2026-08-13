"use client";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { goToEntry, goToWorkspace } from "@/features/auth/model/session";
import { PLANS, planCheckoutHref } from "@/features/marketing/model/plans";
import { MainBodyView } from "./main-body.view";

export function MainBody() {
  const { entryLabel, isLoggedIn } = useAuthSession();
  const visiblePlans = isLoggedIn ? PLANS.filter((plan) => plan.id !== "starter") : PLANS;

  return (
    <MainBodyView
      entryLabel={entryLabel}
      plans={visiblePlans}
      onEntryClick={() => goToEntry(isLoggedIn)}
      onPlanClick={(planId) => {
        if (planId === "starter" && isLoggedIn) {
          goToWorkspace();
          return;
        }

        window.location.href = planCheckoutHref(planId);
      }}
    />
  );
}
