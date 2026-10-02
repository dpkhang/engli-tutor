import { isLocale, type Locale } from "@engli-tutor/i18n";

export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function withLocalePath(pathname: string, locale: Locale | null): string {
  if (!locale || pathname.startsWith("http") || pathname.startsWith("mailto:")) return pathname;
  const segment = pathname.split("/")[1];
  if (isLocale(segment)) return pathname;
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}
