"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { SocialAuthButtons } from "../social-auth-buttons";

export type AuthMode = "login" | "register";

export type AuthPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthPageView({ mode, pending, error, onModeChange, onSubmit }: AuthPageViewProps) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(ellipse_at_top_left,hsl(214_22%_92%),hsl(var(--background))_52%)] dark:bg-[radial-gradient(ellipse_at_top_left,hsl(222_28%_14%),hsl(var(--background))_52%)]">
      <div className="relative mx-auto grid min-h-svh max-w-6xl items-stretch gap-0 px-5 pt-24 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-20 lg:pb-20">
        <motion.div
          className="flex w-full max-w-md items-center justify-self-center lg:justify-self-start"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full space-y-8 border-b border-border pb-10 lg:border-0 lg:pb-0">
            <div className="space-y-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                {mode === "login" ? "Sign in" : "Create account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Welcome back to EngliTutor."
                  : "Create your profile and start speaking with AI."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={pending}
                onClick={() => onModeChange("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "register"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={pending}
                onClick={() => onModeChange("register")}
              >
                Sign up
              </button>
            </div>

            <SocialAuthButtons mode={mode} disabled={pending} />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === "register" && (
                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-foreground">Full name</span>
                  <Input
                    name="name"
                    placeholder="Jane Doe"
                    className="h-11 w-full bg-background"
                    required
                    disabled={pending}
                  />
                </label>
              )}

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Email</span>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 w-full bg-background"
                  autoComplete="email"
                  required
                  disabled={pending}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Password</span>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 w-full bg-background"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                  disabled={pending}
                />
              </label>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" className="h-11 w-full" size="lg" disabled={pending}>
                {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              Back to{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                home
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.aside
          className="relative mt-10 hidden overflow-hidden border border-primary/15 bg-primary p-10 text-primary-foreground lg:mt-0 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-end"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 27px, currentColor 28px)",
            }}
          />
          <p className="relative text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
            CEFR · A2–B1
          </p>
          <p className="relative mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight">
            Practice speaking every day, with feedback in Vietnamese.
          </p>
          <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            Sign in to open your learning path, manage practice sessions, and continue chatting with your AI tutor.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
