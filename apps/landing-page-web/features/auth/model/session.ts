/** Workspace app URL — read in the Next app so NEXT_PUBLIC_* is inlined. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Marketing site URL (this app). */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002").replace(/\/$/, "");
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
  return isLoggedIn ? getAppUrl() : getMarketingAuthHref();
}

export function goToEntry(isLoggedIn: boolean): void {
  window.location.assign(getEntryHref(isLoggedIn));
}

export function goToWorkspace(): void {
  window.location.assign(getAppUrl());
}
