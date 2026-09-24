"use client";

import { useCallback, useMemo } from "react";
import { goToEntry, goToWorkspace, useAuthSession } from "@/features/auth";
import { planCheckoutHref, plansFromCatalog, type PlanId } from "../../model/plans";
import { useBillingCatalog } from "@/features/payment/hooks/use-billing-catalog";
import { MainBodyView } from "./main-body.view";

export function MainBody() {
  const { entryLabel, isLoggedIn } = useAuthSession();
  const catalog = useBillingCatalog();
  const plans = useMemo(() => plansFromCatalog(catalog.data), [catalog.data]);
  const visiblePlans = useMemo(
    () => (isLoggedIn ? plans.filter((plan) => plan.id !== "starter") : plans),
    [isLoggedIn, plans],
  );

  const onEntryClick = useCallback(() => goToEntry(isLoggedIn), [isLoggedIn]);
  const onPlanClick = useCallback(
    (planId: PlanId) => {
      if (planId === "starter" && isLoggedIn) {
        goToWorkspace();
        return;
      }

      window.location.href = planCheckoutHref(planId);
    },
    [isLoggedIn],
  );

  return (
    <MainBodyView
      entryLabel={entryLabel}
      plans={visiblePlans}
      onEntryClick={onEntryClick}
      onPlanClick={onPlanClick}
    />
  );
}
