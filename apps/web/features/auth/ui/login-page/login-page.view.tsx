"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button, Input } from "@landing-page-generator/ui";
import type { LoginFormValues } from "../../model/login-schema";

export type AuthMode = "login" | "register";

export type LoginPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPageView({
  mode,
  pending,
  error,
  register,
  errors,
  onModeChange,
  onSubmit,
}: LoginPageViewProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Welcome back to EngliTutor Workspace."
            : "Create an account to manage pages and your learning path."}
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

      <form className="space-y-2.5" onSubmit={onSubmit} noValidate>
        {mode === "register" ? (
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-foreground">Full name</span>
            <Input
              placeholder="Jane Doe"
              disabled={pending}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <p className="min-h-3 text-[11px] leading-3 text-destructive">
              {errors.name?.message ?? ""}
            </p>
          </label>
        ) : null}

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <Input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={pending}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <p className="min-h-3 text-[11px] leading-3 text-destructive">
            {errors.email?.message ?? ""}
          </p>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Password</span>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={pending}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <p className="min-h-3 text-[11px] leading-3 text-destructive">
            {errors.password?.message ?? ""}
          </p>
        </label>

        <p className="min-h-4 text-xs leading-4 text-destructive" role={error ? "alert" : undefined}>
          {error ?? ""}
        </p>

        <div className="pt-1.5">
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
