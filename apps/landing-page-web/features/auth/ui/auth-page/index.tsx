"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { authClient, authErrorMessage, useSession } from "@/lib/auth-client";
import { getAppUrl, getSiteUrl } from "@/features/auth/model/session";
import { AuthPageView, type AuthMode } from "./auth-page.view";

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
  const searchParams = useSearchParams();
  const returnTo = resolveReturnTo(searchParams.get("returnTo"));
  const { data, isPending: sessionPending } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPending || !data?.user) return;
    window.location.replace(returnTo);
  }, [sessionPending, data?.user, returnTo]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      if (mode === "register") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "User",
        });
        if (result.error) {
          setError(authErrorMessage(result.error));
          setPending(false);
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        });
        if (result.error) {
          setError(authErrorMessage(result.error));
          setPending(false);
          return;
        }
      }

      window.location.assign(returnTo);
    } catch {
      setPending(false);
      setError("Could not reach the auth server. Please try again.");
    }
  };

  return (
    <AuthPageView
      mode={mode}
      pending={pending || sessionPending}
      error={error}
      onModeChange={setMode}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    />
  );
}
