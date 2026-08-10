"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getMarketingUrl, useSession } from "@/lib/auth-client";
import { isCustomDomainHost } from "@/lib/platform-hosts";

const LOGIN_PATH = "/login";

function isPublicPath(pathname: string) {
  if (pathname === LOGIN_PATH || pathname.startsWith("/p/") || pathname === "/domain-unavailable") {
    return true;
  }
  if (typeof window !== "undefined" && isCustomDomainHost(window.location.hostname)) {
    return true;
  }
  return false;
}

function AuthSplash({ message }: { message: string }) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-background px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Pagecraft
        </div>
        <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[splash-progress_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}

function getSafeReturnTo(): string {
  const value = new URLSearchParams(window.location.search).get("returnTo");
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const target = new URL(value ?? "");
    if (target.origin === new URL(getMarketingUrl()).origin) return target.toString();
  } catch {
    // Invalid and external return URLs fall back to the workspace root.
  }
  return "/";
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === LOGIN_PATH;
  const isPublic = isPublicPath(pathname);
  const { data, isPending } = useSession();
  const user = data?.user;
  const redirected = useRef(false);

  useEffect(() => {
    if (isPending || redirected.current) return;

    // Logged-in users leaving /login go to workspace; /p/* stays viewable.
    if (isLogin && user) {
      redirected.current = true;
      window.location.replace(getSafeReturnTo());
      return;
    }

    if (isPublic || user) return;
    redirected.current = true;
    const returnTo = encodeURIComponent(pathname || "/");
    window.location.replace(`/login?returnTo=${returnTo}`);
  }, [isLogin, isPublic, isPending, user, pathname]);

  if (isPending && !isPublic) {
    return <AuthSplash message="Đang chuẩn bị workspace..." />;
  }

  if (isLogin) {
    return user ? <AuthSplash message="Đang mở workspace..." /> : <>{children}</>;
  }

  if (isPublic) return <>{children}</>;

  if (isPending) return <AuthSplash message="Đang chuẩn bị workspace..." />;
  if (!user) return <AuthSplash message="Đang chuyển tới trang đăng nhập..." />;

  return <>{children}</>;
}
