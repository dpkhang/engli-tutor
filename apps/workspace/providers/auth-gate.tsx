"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "@engli-tutor/ui";
import { SESSION_SYNC_PATH } from "@engli-tutor/auth";
import { getMarketingUrl, redirectAfterSignIn, useSession } from "@/lib/auth-client";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { accountApi } from "@/features/accounts";
import {
  hasSeenWelcome,
  needsOnboarding,
  ONBOARDING_PATH,
  safeOnboardingReturnTo,
  WELCOME_PATH,
} from "@/features/onboarding";
import { useSignOutLoading } from "@/features/layout";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import { withCurrentLocale } from "@/lib/locale-path";
import { useWorkspaceI18n } from "@/features/i18n";

const LOGIN_PATH = "/login";

function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const segment = pathname.split("/")[1];
  return isLocale(segment)
    ? { locale: segment, path: pathname.slice(segment.length + 1) || "/" }
    : { locale: null, path: pathname };
}

function isPublicPath(pathname: string) {
  return (
    pathname === LOGIN_PATH ||
    pathname === SESSION_SYNC_PATH ||
    pathname.startsWith("/policy")
  );
}

export function AuthSplash({ message, busy = true, children }: { message: string; busy?: boolean; children?: React.ReactNode }) {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-background px-6"
      aria-busy={busy}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <BrandLogo size={40} />
        <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-[splash-progress_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {children}
      </div>
    </main>
  );
}

function getSafeReturnTo(): string {
  const value = new URLSearchParams(window.location.search).get("returnTo");
  if (value?.startsWith("/") && !value.startsWith("//")) return withCurrentLocale(value);
  try {
    const target = new URL(value ?? "");
    if (target.origin === new URL(getMarketingUrl()).origin) return target.toString();
  } catch {
    // Invalid and external return URLs fall back to the workspace root.
  }
  return withCurrentLocale("/");
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const t = useWorkspaceI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { locale, path: routePath } = stripLocale(pathname);
  const withLocale = (path: string) => locale ? (path === "/" ? `/${locale}` : `/${locale}${path}`) : path;
  const isLogin = routePath === LOGIN_PATH;
  const isOnboarding = routePath === ONBOARDING_PATH;
  const isWelcome = routePath === WELCOME_PATH;
  const isPaymentResult = routePath === "/payments/result";
  const isPublic = isPublicPath(routePath);
  const { data, isPending } = useSession();
  const user = data?.user;
  const { signingOut } = useSignOutLoading();
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
      void redirectAfterSignIn(getSafeReturnTo());
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
        `${withLocale(ONBOARDING_PATH)}?returnTo=${encodeURIComponent(safeOnboardingReturnTo(getSafeReturnTo()))}`,
      );
      return;
    }

    if (user && !isOnboarding && !isWelcome && !isPublic && profileQuery.isSuccess && needsSetup) {
      redirected.current = true;
      const returnTo = encodeURIComponent(safeOnboardingReturnTo(pathname));
      window.location.replace(`${withLocale(ONBOARDING_PATH)}?returnTo=${returnTo}`);
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
    // An explicit sign-out navigates to a plain login URL; don't race it with a returnTo redirect.
    if (signingOut) return;
    redirected.current = true;
    const returnTo = encodeURIComponent(pathname || "/");
    window.location.replace(`${withLocale(LOGIN_PATH)}?returnTo=${returnTo}`);
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
    signingOut,
  ]);

  if (isLogin) {
    if (isPending || user) {
      return <AuthSplash message={user ? t("shell.opening") : t("shell.checkingSession")} />;
    }
    return <>{children}</>;
  }

  if (isPending && !isPublic) {
    return <AuthSplash message={t("shell.preparing")} />;
  }

  if (isPublic) return <>{children}</>;

  if (isPending) return <AuthSplash message={t("shell.preparing")} />;
  if (!user) return <AuthSplash message={t("shell.redirectingSignIn")} />;

  if (!isOnboarding && !isWelcome && !isPaymentResult && !profileReady) {
    return <AuthSplash message={t("shell.preparing")} />;
  }

  if (!isOnboarding && !isWelcome && !isPaymentResult && needsSetup) {
    return <AuthSplash message={t("shell.settingUpPath")} />;
  }

  if (!isOnboarding && !isWelcome && !isPaymentResult && needsWelcome) {
    return <AuthSplash message={t("shell.welcomeIn")} />;
  }

  return <>{children}</>;
}
