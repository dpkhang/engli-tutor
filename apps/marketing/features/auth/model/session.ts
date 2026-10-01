const PROD_APP_URL = "https://app.pagecraft-ai.site";
const PROD_SITE_URL = "https://pagecraft-ai.site";

function publicUrl(value: string | undefined, prodFallback: string, devFallback: string): string {
  const explicit = value?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const fallback = process.env.NODE_ENV === "production" ? prodFallback : devFallback;
  return fallback.replace(/\/$/, "");
}

/** Workspace app URL — read in the Next app so NEXT_PUBLIC_* is inlined. */
export function getAppUrl(): string {
  return publicUrl(process.env.NEXT_PUBLIC_APP_URL, PROD_APP_URL, "http://localhost:3000");
}

/** Marketing site URL (this app). */
export function getSiteUrl(): string {
  return publicUrl(process.env.NEXT_PUBLIC_SITE_URL, PROD_SITE_URL, "http://localhost:3002");
}

/** Login lives on workspace (same-origin cookies). Marketing only deep-links there. */
export function getAuthHref(returnTo?: string): string {
  const base = `${getAppUrl()}/login`;
  if (!returnTo) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getMarketingAuthHref(returnTo?: string): string {
  const base = "/auth";
  if (!returnTo) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function getEntryHref(isLoggedIn: boolean): string {
  return isLoggedIn ? getAppUrl() : getAuthHref();
}

export function goToEntry(isLoggedIn: boolean): void {
  window.location.assign(getEntryHref(isLoggedIn));
}

export function goToWorkspace(): void {
  window.location.assign(getAppUrl());
}
