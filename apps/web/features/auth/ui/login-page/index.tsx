"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient, authErrorMessage, getMarketingUrl, useSession } from "@/lib/auth-client";
import { loginFormSchema, type LoginFormValues } from "../../model/login-schema";
import { LoginPageView, type AuthMode } from "./login-page.view";

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
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { mode: "login", name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (sessionPending || !data?.user) return;
    window.location.replace(returnTo);
  }, [sessionPending, data?.user, returnTo]);

  const onSubmit = form.handleSubmit(async (values) => {
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
      window.location.assign(returnTo);
    } catch {
      setPending(false);
      setError("Không thể kết nối máy chủ xác thực. Thử lại.");
    }
  });

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    form.reset({
      mode: nextMode,
      name: "",
      email: form.getValues("email"),
      password: "",
    });
  };

  return (
    <LoginPageView
      mode={mode}
      pending={pending || sessionPending}
      error={error}
      marketingUrl={marketingUrl}
      register={form.register}
      errors={form.formState.errors}
      onModeChange={changeMode}
      onSubmit={onSubmit}
    />
  );
}
