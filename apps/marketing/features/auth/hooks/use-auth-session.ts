"use client";

import { useSession } from "@/lib/auth-client";
import { getEntryHref } from "../model/session";

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
    entryHref: getEntryHref(isLoggedIn),
    entryLabel: isLoggedIn ? "Open Workspace" : "Start lesson",
    getEntryHref: () => getEntryHref(isLoggedIn),
  };
}

/** @deprecated Use useAuthSession */
export const useDemoSession = useAuthSession;
