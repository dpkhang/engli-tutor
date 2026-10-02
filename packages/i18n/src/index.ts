export const SUPPORTED_LOCALES = ["en", "vi"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "englitutor-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  const language = value?.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(language) ? language : DEFAULT_LOCALE;
}

export function resolveLocale({
  cookie,
  account,
  acceptLanguage,
}: {
  cookie?: string | null;
  account?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(cookie)) return cookie;
  if (isLocale(account)) return account;
  if (acceptLanguage) {
    for (const item of acceptLanguage.split(",")) {
      const candidate = item.trim().split(";", 1)[0].toLowerCase().split(/[-_]/)[0];
      if (isLocale(candidate)) return candidate;
    }
  }
  return DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export type MessageTree = { [key: string]: string | { [key: string]: unknown } };

export function createTranslator<T extends MessageTree>(messages: T) {
  return (key: string): string => {
    const value = key.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object") return undefined;
      return (current as Record<string, unknown>)[part];
    }, messages);
    return typeof value === "string" ? value : key;
  };
}
