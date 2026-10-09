import { isLocale, type Locale } from "@engli-tutor/i18n";

export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export function withLocalePath(pathname: string, locale: Locale | null): string {
  if (!locale || !pathname.startsWith("/") || pathname.startsWith("//")) return pathname;
  const segment = pathname.split(/[/?#]/)[1];
  if (isLocale(segment)) return pathname;
  return pathname === "/" ? `/${locale}` : /^\/[?#]/.test(pathname) ? `/${locale}${pathname.slice(1)}` : `/${locale}${pathname}`;
}

export function stripLocalePath(pathname: string): string {
  const segment = pathname.split(/[/?#]/)[1];
  if (!isLocale(segment)) return pathname;
  const rest = pathname.slice(segment.length + 1);
  return rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}`;
}

/** Client-only: prefixes an internal path with the locale of the current URL. */
export function withCurrentLocale(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  return withLocalePath(pathname, getPathLocale(window.location.pathname));
}
