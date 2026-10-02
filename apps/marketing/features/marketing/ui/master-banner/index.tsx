"use client";

import { useCallback, useRef } from "react";
import { goToEntry, useAuthSession } from "@/features/auth";
import { MasterBannerView } from "./master-banner.view";

export function MasterBanner() {
  const { entryLabel, isLoggedIn } = useAuthSession();
  const sectionRef = useRef<HTMLElement>(null);
  const onEntryClick = useCallback(() => goToEntry(isLoggedIn), [isLoggedIn]);
  const onPracticeClick = useCallback(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("practice")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
  }, []);

  return (
    <MasterBannerView
      sectionRef={sectionRef}
      entryLabel={entryLabel}
      onEntryClick={onEntryClick}
      onPracticeClick={onPracticeClick}
    />
  );
}
