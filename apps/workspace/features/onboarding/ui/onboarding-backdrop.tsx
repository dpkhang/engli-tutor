"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@engli-tutor/ui";

/** Lightweight decorative backdrop — opacity-only motion, no transforming blurs. */
export const OnboardingBackdrop = memo(function OnboardingBackdrop() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const sync = () => setActive(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <div
      aria-hidden
      className="auth-backdrop pointer-events-none absolute inset-0 overflow-hidden contain-strict"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(var(--primary)/0.2),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_85%,hsl(var(--primary)/0.08),transparent_45%)]" />

      <div
        className={cn(
          "auth-glow auth-glow-a absolute -top-28 -left-20 size-72 rounded-full bg-primary/25 blur-3xl",
          !active && "animation-paused",
        )}
      />
      <div
        className={cn(
          "auth-glow auth-glow-b absolute top-[22%] -right-28 size-64 rounded-full bg-primary/15 blur-3xl",
          !active && "animation-paused",
        )}
      />
    </div>
  );
});
