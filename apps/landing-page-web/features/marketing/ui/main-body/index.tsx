"use client";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { goToEntry, goToWorkspace } from "@/features/auth/model/session";
import { planCheckoutHref, plansFromCatalog } from "@/features/marketing/model/plans";
import { useBillingCatalog } from "@/features/payment/hooks/use-billing-catalog";
import { MainBodyView } from "./main-body.view";

export function MainBody() {
  const { entryLabel, isLoggedIn } = useAuthSession();
  const catalog = useBillingCatalog();
  const plans = plansFromCatalog(catalog.data);
  const visiblePlans = isLoggedIn ? plans.filter((plan) => plan.id !== "starter") : plans;

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
