"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import en from "@engli-tutor/i18n/messages/en";
import vi from "@engli-tutor/i18n/messages/vi";
import { createTranslator, isLocale, LOCALE_COOKIE, type Locale } from "@engli-tutor/i18n";

type WorkspaceMessages = typeof en & { workspace?: Record<string, unknown> };
const messages: Record<Locale, WorkspaceMessages> = { en, vi };
const Context = createContext<(key: string) => string>(() => "");

function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const value = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))?.[1];
  return isLocale(value) ? value : "en";
}

export function WorkspaceI18n({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routeLocale = isLocale(pathname?.split("/")[1]) ? (pathname.split("/")[1] as Locale) : null;
  const [locale, setLocale] = useState<Locale>(() => routeLocale ?? readLocale());
  useEffect(() => {
    const sync = () => setLocale(routeLocale ?? readLocale());
    sync();
    if (typeof document !== "undefined") document.documentElement.lang = routeLocale ?? readLocale();
    window.addEventListener("englitutor-locale-change", sync);
    return () => window.removeEventListener("englitutor-locale-change", sync);
  }, [routeLocale]);
  const t = useMemo(() => createTranslator(messages[locale]), [locale]);
  return <Context.Provider value={t}>{children}</Context.Provider>;
}

export function useWorkspaceI18n() {
  return useContext(Context);
}
