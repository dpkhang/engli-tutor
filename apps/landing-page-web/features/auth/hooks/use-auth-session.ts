"use client";

import { useSession } from "@landing-page-generator/auth";
import { getAppUrl, getAuthHref, getEntryHref } from "@/features/auth/model/session";

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
    entryHref: isLoggedIn ? getAppUrl() : getAuthHref(),
    entryLabel: isLoggedIn ? "Mở Workspace" : "Bắt đầu miễn phí",
    getEntryHref: () => getEntryHref(isLoggedIn),
  };
}

/** @deprecated Use useAuthSession */
export const useDemoSession = useAuthSession;
