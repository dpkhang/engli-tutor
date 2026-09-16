"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import {
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

  const firstName =
    session?.user?.name?.trim()?.split(/\s+/)[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";
  const dest = safeOnboardingReturnTo(peekWelcomePending() ?? searchParams.get("returnTo"));

  useEffect(() => {
    router.prefetch(dest);
  }, [dest, router]);

  const enterWorkspace = useCallback(async () => {
    await persistWelcomeSeen(queryClient);
    takeWelcomePending();
    router.replace(dest);
  }, [dest, queryClient, router]);

  return <WelcomePageView firstName={firstName} onFinished={enterWorkspace} />;
}
