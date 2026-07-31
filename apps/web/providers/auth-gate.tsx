"use client";

import { useEffect, useRef } from "react";
import { getMarketingUrl, useSession } from "@/lib/auth-client";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, isPending, error } = useSession();
  const user = data?.user;
  const redirected = useRef(false);

  useEffect(() => {
    if (isPending || redirected.current) return;
    if (user) return;

    redirected.current = true;
    const marketing = getMarketingUrl();
    const returnTo = encodeURIComponent(window.location.href);
    window.location.replace(`${marketing}/auth?returnTo=${returnTo}`);
  }, [isPending, user]);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p>Đang chuyển tới trang đăng nhập...</p>
        {error ? (
          <p className="max-w-md text-center text-xs text-destructive">
            Không đọc được session từ API. Kiểm tra cookie / CORS / WEB_ORIGIN trên backend.
          </p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
