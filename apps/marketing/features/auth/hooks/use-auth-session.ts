"use client";

import { useSession } from "@/lib/auth-client";
import { getAppUrl, getEntryHref, getMarketingAuthHref } from "../model/session";

export function useAuthSession() {
  const { data, isPending, error } = useSession();
  const user = data?.user ?? null;
  const isLoggedIn = Boolean(user);

  return {
    user,
    session: data?.session ?? null,
    ready: !isPending,
    isPending,
    error,
    isLoggedIn,
    entryHref: isLoggedIn ? getAppUrl() : getMarketingAuthHref(),
    entryLabel: isLoggedIn ? "Open Workspace" : "Start speaking",
    getEntryHref: () => getEntryHref(isLoggedIn),
  };
}

/** @deprecated Use useAuthSession */
export const useDemoSession = useAuthSession;
