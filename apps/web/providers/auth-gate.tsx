"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const PUBLIC_PATHS = new Set(["/login"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const { data, isPending } = useSession();
  const user = data?.user;
  const redirected = useRef(false);

  useEffect(() => {
    if (isPublic || isPending || redirected.current || user) return;
    redirected.current = true;
    const returnTo = encodeURIComponent(pathname || "/");
    window.location.replace(`/login?returnTo=${returnTo}`);
  }, [isPublic, isPending, user, pathname]);

  if (isPublic) return <>{children}</>;

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
