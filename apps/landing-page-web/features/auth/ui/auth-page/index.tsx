"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getAppUrl, readDemoSession, simulateSignIn } from "@/features/auth/model/session";
import { AuthPageView, type AuthMode } from "./auth-page.view";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (readDemoSession()) {
      window.location.replace(getAppUrl());
    }
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();

    void simulateSignIn({
      email,
      name: name || undefined,
      provider: "email",
      mode,
    }).catch(() => {
      setPending(false);
      setError("Không thể chuyển sang workspace. Thử lại.");
    });
  };

  return (
    <AuthPageView
      mode={mode}
      pending={pending}
      error={error}
      onModeChange={setMode}
      onSubmit={onSubmit}
    />
  );
}
