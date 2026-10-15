import en from "@engli-tutor/i18n/messages/en";
import vi from "@engli-tutor/i18n/messages/vi";
import { createTranslator, isLocale, type Locale, type Translator } from "@engli-tutor/i18n";

const messages: Record<Locale, typeof en> = { en, vi };

export function getServerTranslator(locale: string): Translator {
  return createTranslator(messages[isLocale(locale) ? locale : "en"]);
}
