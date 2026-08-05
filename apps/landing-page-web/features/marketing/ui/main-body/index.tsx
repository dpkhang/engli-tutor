"use client";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { goToEntry } from "@/features/auth/model/session";
import { PLANS, planCheckoutHref } from "@/features/marketing/model/plans";
import { MainBodyView } from "./main-body.view";

export function MainBody() {
  const { entryLabel, isLoggedIn } = useAuthSession();

  return (
    <MainBodyView
      entryLabel={entryLabel}
      plans={PLANS}
      onEntryClick={() => goToEntry(isLoggedIn)}
      onPlanClick={(planId) => {
        window.location.href = planCheckoutHref(planId);
      }}
    />
  );
}
