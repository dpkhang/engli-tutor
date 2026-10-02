"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@engli-tutor/i18n";
import en from "@engli-tutor/i18n/messages/en";
import vi from "@engli-tutor/i18n/messages/vi";
import { createTranslator } from "@engli-tutor/i18n";

const messages = { en, vi } as const;
const I18nContext = createContext<(key: string) => string>(() => "");

export function MarketingI18n({ locale, children }: { locale: Locale; children: ReactNode }) {
  const translate = useMemo(() => createTranslator(messages[locale]), [locale]);
  return <I18nContext.Provider value={translate}>{children}</I18nContext.Provider>;
}

export function useMarketingI18n() {
  return useContext(I18nContext);
}
