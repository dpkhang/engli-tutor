"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withCurrentLocale } from "@/lib/locale-path";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { useSession } from "@/lib/auth-client";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import {
  hasSeenWelcome,
  peekWelcomePending,
  persistWelcomeSeen,
  safeOnboardingReturnTo,
  takeWelcomePending,
} from "../../model/onboarding";
import { WelcomePageView } from "./welcome-page.view";

export function WelcomePage() {
  const router = useRouter();
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

  useEffect(() => {
    router.prefetch(withCurrentLocale(dest));
  }, [dest, router]);

  useEffect(() => {
    if (!hasSeenWelcome(profileQuery.data)) return;
    takeWelcomePending();
    router.replace(withCurrentLocale(dest));
  }, [dest, profileQuery.data, router]);

  const enterWorkspace = useCallback(async () => {
    await persistWelcomeSeen(queryClient);
    takeWelcomePending();
    router.replace(withCurrentLocale(dest));
  }, [dest, queryClient, router]);

  return <WelcomePageView firstName={firstName} onFinished={enterWorkspace} />;
}
