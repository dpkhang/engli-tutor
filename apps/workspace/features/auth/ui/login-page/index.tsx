"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { withCurrentLocale } from "@/lib/locale-path";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  authClient,
  authErrorMessage,
  getMarketingUrl,
  redirectAfterSignIn,
  useSession,
} from "@/lib/auth-client";
import { loginFormSchema, type LoginFormValues } from "../../model/login-schema";
import { LoginPageView, type AuthMode } from "./login-page.view";
import { persistPendingReferral } from "@/features/referrals";

function resolveReturnTo(raw: string | null, marketingUrl: string): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const target = new URL(raw);
    if (target.origin === new URL(marketingUrl).origin) return target.toString();
  } catch {
    // Invalid and external return URLs fall back to the workspace root.
  }
  return "/";
}

export function LoginPage() {
  const searchParams = useSearchParams();
  const marketingUrl = getMarketingUrl();
  const returnTo = resolveReturnTo(searchParams.get("returnTo"), marketingUrl);
  const { data, isPending: sessionPending } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // useSession().isPending is true during SSR and false on the first client
  // paint, which would otherwise mismatch the submit button label/disabled.
  const [hydrated, setHydrated] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { mode: "login", name: "", email: "", password: "" },
  });

  useEffect(() => {
    setHydrated(true);
    const code = searchParams.get("ref")?.trim().toUpperCase();
    if (code) {
      setMode("register");
      form.setValue("mode", "register");
      form.setValue("referralCode", code);
    }
  }, [form, searchParams]);

  useEffect(() => {
    if (sessionPending || !data?.user) return;
    void redirectAfterSignIn(withCurrentLocale(returnTo));
  }, [sessionPending, data?.user, returnTo]);

  const changeMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    form.reset({
      mode: nextMode,
      name: "",
      email: form.getValues("email"),
      password: "",
      referralCode: nextMode === "register" ? form.getValues("referralCode") : "",
    });
  }, [form]);

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values) => {
        setError(null);
        setPending(true);

        try {
          if (values.mode === "register") {
            // Persist even an empty value so removing a prefilled invite is respected.
            persistPendingReferral(values.referralCode ?? "");
            const result = await authClient.signUp.email({
              email: values.email,
              password: values.password,
              name: values.name,
            });
            if (result.error) {
              setError(authErrorMessage(result.error));
              setPending(false);
              return;
            }
          } else {
            const result = await authClient.signIn.email({
              email: values.email,
              password: values.password,
            });
            if (result.error) {
              setError(authErrorMessage(result.error));
              setPending(false);
              return;
            }
          }

          // Reload after the auth response commits its Set-Cookie header. Checking
          // getSession here can still return the anonymous client cache and report a
          // false cookie failure; AuthGate verifies the fresh session on navigation.
          if (values.mode === "register") {
            const next =
              returnTo.startsWith("/") && !returnTo.startsWith("//") && returnTo !== "/onboarding"
                ? `/onboarding?returnTo=${encodeURIComponent(returnTo)}`
                : "/onboarding";
            await redirectAfterSignIn(withCurrentLocale(next));
            return;
          }
          await redirectAfterSignIn(withCurrentLocale(returnTo));
        } catch {
          setPending(false);
          setError("Couldn't reach the auth server. Please try again.");
        }
      }),
    [form, returnTo],
  );

  if (sessionPending || data?.user) {
    return null;
  }

  return (
    <LoginPageView
      mode={mode}
      pending={pending || (hydrated && sessionPending)}
      error={error}
      register={form.register}
      errors={form.formState.errors}
      policyHref="/policy"
      cookiesHref="/policy/cookies"
      homeHref={marketingUrl}
      onModeChange={changeMode}
      onSubmit={onSubmit}
    />
  );
}
