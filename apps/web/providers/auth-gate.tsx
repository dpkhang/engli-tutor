"use client";

import { useEffect } from "react";
import { getMarketingUrl, useSession } from "@landing-page-generator/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();
  const user = data?.user;

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      const marketing = getMarketingUrl();
      window.location.replace(`${marketing}/auth`);
    }
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
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang chuyển tới trang đăng nhập...
      </div>
    );
  }

  return <>{children}</>;
}
