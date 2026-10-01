"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "@engli-tutor/ui";
import { getMarketingUrl, useSession } from "@/lib/auth-client";
import { accountApi } from "@/features/accounts";
import {
  hasSeenWelcome,
  needsOnboarding,
  ONBOARDING_PATH,
  safeOnboardingReturnTo,
  WELCOME_PATH,
} from "@/features/onboarding";
import { CACHE_TIMES, queryKeys } from "@/lib/query";

const LOGIN_PATH = "/login";

function isPublicPath(pathname: string) {
  return (
    pathname === LOGIN_PATH ||
    pathname === "/domain-unavailable" ||
    pathname.startsWith("/policy")
  );
}

function AuthSplash({ message }: { message: string }) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-background px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandLogo size={40} />
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
  const router = useRouter();
  const isLogin = pathname === LOGIN_PATH;
  const isOnboarding = pathname === ONBOARDING_PATH;
  const isWelcome = pathname === WELCOME_PATH;
  const isPaymentResult = pathname === "/payments/result";
  const isPublic = isPublicPath(pathname);
  const { data, isPending } = useSession();
  const user = data?.user;
  const redirected = useRef(false);
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
    enabled: Boolean(user) && !isPublic,
    staleTime: CACHE_TIMES.session,
    retry: 1,
  });

  const profile = profileQuery.data;
  const profileReady = profileQuery.isSuccess || profileQuery.isError;
  const needsSetup = !profileQuery.isError && needsOnboarding(profile);
  const needsWelcome =
    Boolean(user) &&
    profileReady &&
    !profileQuery.isError &&
    Boolean(profile?.id) &&
    !needsOnboarding(profile) &&
    !hasSeenWelcome(profile);

  useEffect(() => {
    redirected.current = false;
  }, [pathname]);

  useEffect(() => {
    if (isPending || redirected.current) return;

    if (isLogin && user) {
      redirected.current = true;
      window.location.replace(getSafeReturnTo());
      return;
    }

    if (user && isWelcome && profileQuery.isSuccess && !needsSetup && !needsWelcome) {
      redirected.current = true;
      window.location.replace(getSafeReturnTo());
      return;
    }

    if (user && isWelcome && profileQuery.isSuccess && needsSetup) {
      redirected.current = true;
      window.location.replace(
        `${ONBOARDING_PATH}?returnTo=${encodeURIComponent(safeOnboardingReturnTo(getSafeReturnTo()))}`,
      );
      return;
    }

    if (user && !isOnboarding && !isWelcome && !isPublic && profileQuery.isSuccess && needsSetup) {
      redirected.current = true;
      const returnTo = encodeURIComponent(safeOnboardingReturnTo(pathname));
      window.location.replace(`${ONBOARDING_PATH}?returnTo=${returnTo}`);
      return;
    }

    if (user && needsWelcome && !isWelcome && !isOnboarding && !isPublic && !isLogin && !isPaymentResult) {
      redirected.current = true;
      router.replace(
        `${WELCOME_PATH}?returnTo=${encodeURIComponent(safeOnboardingReturnTo(pathname))}`,
      );
      return;
    }

    if (isPublic || user) return;
    redirected.current = true;
    const returnTo = encodeURIComponent(pathname || "/");
    window.location.replace(`/login?returnTo=${returnTo}`);
  }, [
    isLogin,
    isOnboarding,
    isWelcome,
    isPaymentResult,
    isPublic,
    isPending,
    user,
    pathname,
    profileQuery.isSuccess,
    profileQuery.isError,
    needsSetup,
    needsWelcome,
    router,
  ]);

  if (isLogin) {
    if (isPending || user) {
      return <AuthSplash message={user ? "Opening workspace..." : "Checking session..."} />;
    }
    return <>{children}</>;
  }

  if (isPending && !isPublic) {
    return <AuthSplash message="Preparing workspace..." />;
  }

  if (isPublic) return <>{children}</>;

  if (isPending) return <AuthSplash message="Preparing workspace..." />;
  if (!user) return <AuthSplash message="Redirecting to sign in..." />;

  if (!isOnboarding && !isWelcome && !isPaymentResult && !profileReady) {
    return <AuthSplash message="Preparing workspace..." />;
  }

  if (!isOnboarding && !isWelcome && !isPaymentResult && needsSetup) {
    return <AuthSplash message="Setting up your path..." />;
  }

  if (!isOnboarding && !isWelcome && !isPaymentResult && needsWelcome) {
    return <AuthSplash message="Welcome in..." />;
  }

  return <>{children}</>;
}
