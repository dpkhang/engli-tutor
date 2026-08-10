"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const PUBLIC_PATHS = new Set(["/login"]);

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
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const { data, isPending } = useSession();
  const user = data?.user;
  const redirected = useRef(false);

  useEffect(() => {
    if (isPending || redirected.current) return;

    if (isPublic && user) {
      redirected.current = true;
      window.location.replace(getSafeReturnTo());
      return;
    }

    if (isPublic || user) return;
    redirected.current = true;
    const returnTo = encodeURIComponent(pathname || "/");
    window.location.replace(`/login?returnTo=${returnTo}`);
  }, [isPublic, isPending, user, pathname]);

  if (isPending) {
    return <AuthSplash message="Đang chuẩn bị workspace..." />;
  }

  if (isPublic) {
    return user ? <AuthSplash message="Đang mở workspace..." /> : <>{children}</>;
  }

  if (!user) return <AuthSplash message="Đang chuyển tới trang đăng nhập..." />;

  return <>{children}</>;
}
