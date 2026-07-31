"use client";

import { useDemoSession } from "@/features/auth/hooks/use-demo-session";
import { goToEntry } from "@/features/auth/model/session";
import { PLANS } from "@/features/marketing/model/plans";
import { MainBodyView } from "./main-body.view";

export function MainBody() {
  const { entryLabel } = useDemoSession();

  return (
    <MainBodyView
      entryLabel={entryLabel}
      plans={PLANS}
      onEntryClick={goToEntry}
      onPlanClick={(planId) => {
        window.location.href = `/payment?plan=${planId}`;
      }}
    />
  );
}
