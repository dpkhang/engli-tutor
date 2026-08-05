"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { authClient, authErrorMessage, getMarketingUrl, useSession } from "@/lib/auth-client";
import { LoginPageView, type AuthMode } from "./login-page.view";

function resolveReturnTo(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export function LoginPage() {
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

      const sessionResult = await authClient.getSession();
      if (sessionResult.error || !sessionResult.data?.user) {
        setPending(false);
        setError(
          "Đăng nhập thành công nhưng trình duyệt không lưu được phiên. Vui lòng xóa cookie cũ của Pagecraft rồi thử lại.",
        );
        return;
      }

      // Reload the document so AuthGate starts with the session cookie that was
      // just committed by the auth response, instead of its pre-login cache.
      window.location.assign(returnTo);
    } catch {
      setPending(false);
      setError("Không thể kết nối máy chủ xác thực. Thử lại.");
    }
  };

  return (
    <LoginPageView
      mode={mode}
      pending={pending || sessionPending}
      error={error}
      marketingUrl={getMarketingUrl()}
      onModeChange={setMode}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    />
  );
}
