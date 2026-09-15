"use client";

import { memo, useEffect, useRef } from "react";
import { Button } from "@landing-page-generator/ui";
import { WELCOME_DURATION_MS } from "../../model/onboarding";

export type WelcomeScreenViewProps = {
  firstName: string;
  onFinished: () => void | Promise<void>;
};

export const WelcomeScreenView = memo(function WelcomeScreenView({
  firstName,
  onFinished,
}: WelcomeScreenViewProps) {
  const finished = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    void Promise.resolve(onFinishedRef.current());
  };

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.classList.contains("reduce-motion") ||
        document.documentElement.getAttribute("data-reduce-motion") === "on");
    const timer = window.setTimeout(finish, reduced ? 700 : WELCOME_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="auth-enter mb-8 grid size-20 place-items-center rounded-[1.4rem] bg-primary text-2xl font-semibold text-primary-foreground shadow-[0_18px_50px_-18px_hsl(var(--primary))]">
        E
      </div>

      <p className="auth-enter text-sm font-medium text-primary" style={{ animationDelay: "60ms" }}>
        You’re in
      </p>
      <h1
        className="auth-enter mt-2 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl"
        style={{ animationDelay: "120ms" }}
      >
        Welcome, {firstName}
      </h1>
      <p
        className="auth-enter mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base"
        style={{ animationDelay: "180ms" }}
      >
        Your workspace is ready. Opening Today so you can start speaking, practicing, and playing.
      </p>

      <div
        className="auth-enter mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-muted"
        style={{ animationDelay: "220ms" }}
      >
        <span
          className="auth-welcome-progress block h-full rounded-full bg-primary"
          style={{ animationDuration: `${WELCOME_DURATION_MS}ms` }}
        />
      </div>

      <div className="auth-enter mt-8" style={{ animationDelay: "280ms" }}>
        <Button
          type="button"
          variant="ghost"
          className="rounded-full text-muted-foreground"
          onClick={finish}
        >
          Enter workspace
        </Button>
      </div>
    </div>
  );
});
