"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { AuthSplash } from "@/providers/auth-gate";
import {
  applyStoredAppearance,
  disarmAppearanceSync,
  resetAccountAppearance,
  getReduceMotionPreference,
  hydrateAppearancePreferences,
  PREFERENCES_EVENT,
  THEME_EVENT,
} from "../../model/preferences";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id ?? null;
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);
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

  useEffect(() => {
    setSessionTimedOut(false);
    if (!isPending) return;
    const timeout = window.setTimeout(() => setSessionTimedOut(true), 15_000);
    return () => window.clearTimeout(timeout);
  }, [isPending]);

  useEffect(() => {
    if (isPending) return;
    setReadyUserId(null);
    setFailed(false);
    if (!userId) {
      resetAccountAppearance();
      return;
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      active = false;
      disarmAppearanceSync();
      setFailed(true);
    }, 15_000);
    void hydrateAppearancePreferences(userId).then((applied) => {
      if (!active) return;
      window.clearTimeout(timeout);
      if (applied) setReadyUserId(userId);
      else setFailed(true);
    }).catch(() => {
      if (!active) return;
      window.clearTimeout(timeout);
      setFailed(true);
    });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      disarmAppearanceSync();
    };
  }, [isPending, userId, attempt]);

  if (isPending || (userId && readyUserId !== userId)) {
    const hasError = isPending ? sessionTimedOut : failed;
    return (
      <AuthSplash
        busy={!hasError}
        message={hasError
          ? isPending ? "We could not finish checking your session. Please try again." : "Could not load your appearance settings. Please try again."
          : "Preparing workspace..."}
      >
        {hasError ? (
          <button
            type="button"
            className="rounded-full border px-5 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              if (isPending) window.location.reload();
              else setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        ) : null}
      </AuthSplash>
    );
  }
  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}
