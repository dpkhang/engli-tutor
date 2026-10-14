"use client";

import { useSession } from "@/lib/auth-client";
import { useMarketingI18n } from "@/features/i18n";
import { getEntryHref } from "../model/session";

export function useAuthSession() {
  const t = useMarketingI18n();
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
    entryLabel: isLoggedIn ? t("header.openWorkspace") : t("header.startLesson"),
    getEntryHref: () => getEntryHref(isLoggedIn),
  };
}

/** @deprecated Use useAuthSession */
export const useDemoSession = useAuthSession;
