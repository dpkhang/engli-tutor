"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import {
  applyStoredAppearance,
  getReduceMotionPreference,
  PREFERENCES_EVENT,
  THEME_EVENT,
} from "../../model/preferences";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState<"user" | "always" | "never">("user");

  useLayoutEffect(() => {
    const sync = () => {
      applyStoredAppearance();
      const pref = getReduceMotionPreference();
      setReducedMotion(pref === "on" ? "always" : pref === "off" ? "never" : "user");
    };
    sync();
    const themeMq = window.matchMedia("(prefers-color-scheme: dark)");
    themeMq.addEventListener("change", sync);
    window.addEventListener(PREFERENCES_EVENT, sync);
    window.addEventListener(THEME_EVENT, sync);
    return () => {
      themeMq.removeEventListener("change", sync);
      window.removeEventListener(PREFERENCES_EVENT, sync);
      window.removeEventListener(THEME_EVENT, sync);
    };
  }, []);

  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}
