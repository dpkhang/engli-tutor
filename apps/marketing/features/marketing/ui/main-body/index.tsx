"use client";

import { useCallback, useMemo } from "react";
import { goToEntry, useAuthSession } from "@/features/auth";
import { planCheckoutHref, plansFromCatalog, type PlanId } from "../../model/plans";
import { useBillingCatalog } from "@/features/payments";
import { MainBodyView } from "./main-body.view";
import { useMarketingI18n } from "@/features/i18n";

export function MainBody() {
  const t = useMarketingI18n();
  const { entryLabel, isLoggedIn } = useAuthSession();
  const catalog = useBillingCatalog();
  const plans = useMemo(() => (catalog.data ? plansFromCatalog(catalog.data, t) : []), [catalog.data, t]);
  const visiblePlans = useMemo(
    () => (isLoggedIn ? plans.filter((plan) => plan.id !== "starter") : plans),
    [isLoggedIn, plans],
  );
  const pricingStatus = catalog.isLoading ? "loading" : catalog.error ? "error" : "ready";

  const onEntryClick = useCallback(() => goToEntry(isLoggedIn), [isLoggedIn]);
  const onPlanClick = useCallback(
    (planId: PlanId) => {
      if (plans.find((plan) => plan.id === planId)?.isEntry) {
        goToEntry(isLoggedIn);
        return;
      }

      window.location.href = planCheckoutHref(planId);
    },
    [isLoggedIn, plans],
  );
  const onRetryPricing = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <MainBodyView
      entryLabel={entryLabel}
      plans={visiblePlans}
      pricingStatus={pricingStatus}
      pricingError={catalog.error?.message ?? null}
      onEntryClick={onEntryClick}
      onPlanClick={onPlanClick}
      onRetryPricing={onRetryPricing}
    />
  );
}
