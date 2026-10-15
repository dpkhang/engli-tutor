"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient, authErrorMessage, redirectAfterSignIn, useSession } from "@/lib/auth-client";
import { getAppUrl, getSiteUrl } from "../../model/session";
import { authFormSchema, type AuthFormValues, type AuthPayload } from "../../model/auth-schema";
import { AuthPageView, type AuthMode } from "./auth-page.view";
import { useMarketingI18n } from "@/features/i18n";

function resolveReturnTo(raw: string | null): string {
  const fallback = getAppUrl();
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    const allowed = [getAppUrl(), getSiteUrl()].map((origin) => new URL(origin).origin);
    if (!allowed.includes(url.origin)) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export function AuthPage() {
  const t = useMarketingI18n();
  const searchParams = useSearchParams();
  const returnTo = resolveReturnTo(searchParams.get("returnTo"));
  const { data, isPending: sessionPending } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const form = useForm<AuthFormValues, unknown, AuthPayload>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { mode: "login", name: "", email: "", password: "" },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (sessionPending || !data?.user) return;
    void redirectAfterSignIn(returnTo);
  }, [sessionPending, data?.user, returnTo]);

  const changeMode = useCallback(
    (nextMode: AuthMode) => {
      if (pending || nextMode === mode) return;
      setMode(nextMode);
      setError(null);
      form.reset({
        mode: nextMode,
        name: "",
        email: form.getValues("email"),
        password: "",
      });
    },
    [form, mode, pending],
  );

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (values) => {
        setError(null);
        setPending(true);

        try {
          if (values.mode === "register") {
            const result = await authClient.signUp.email({
              email: values.email,
              password: values.password,
              name: values.name,
            });
            if (result.error) {
              setError(authErrorMessage(result.error, t("auth.genericError")));
              setPending(false);
              return;
            }
          } else {
            const result = await authClient.signIn.email({
              email: values.email,
              password: values.password,
            });
            if (result.error) {
              setError(authErrorMessage(result.error, t("auth.genericError")));
              setPending(false);
              return;
            }
          }

          await redirectAfterSignIn(returnTo);
        } catch {
          setPending(false);
          setError(t("auth.serverUnreachable"));
        }
      }),
    [form, returnTo, t],
  );

  return (
    <AuthPageView
      mode={mode}
      pending={pending || (hydrated && sessionPending)}
      error={error}
      register={form.register}
      errors={form.formState.errors}
      onModeChange={changeMode}
      onSubmit={onSubmit}
    />
  );
}
