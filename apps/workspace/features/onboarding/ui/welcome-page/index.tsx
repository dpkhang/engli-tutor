"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { useSession } from "@/lib/auth-client";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import {
  hasSeenWelcome,
  localizedDestination,
  peekWelcomePending,
  persistWelcomeSeen,
  rememberUiLocale,
  safeOnboardingReturnTo,
  takeWelcomePending,
} from "../../model/onboarding";
import { WelcomePageView } from "./welcome-page.view";

export function WelcomePage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
    staleTime: CACHE_TIMES.session,
  });

  const firstName =
    session?.user?.name?.trim()?.split(/\s+/)[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";
  const dest = safeOnboardingReturnTo(peekWelcomePending() ?? searchParams.get("returnTo"));
  const uiLocale = profileQuery.data?.uiLocale ?? null;

  const leaving = useRef(false);

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    takeWelcomePending();
    rememberUiLocale(uiLocale);
    window.location.replace(localizedDestination(dest, uiLocale));
  }, [dest, uiLocale]);

  useEffect(() => {
    if (hasSeenWelcome(profileQuery.data)) leave();
  }, [leave, profileQuery.data]);

  const enterWorkspace = useCallback(async () => {
    await persistWelcomeSeen(queryClient);
    leave();
  }, [leave, queryClient]);

  return <WelcomePageView firstName={firstName} onFinished={enterWorkspace} />;
}
