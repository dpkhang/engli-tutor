/** Workspace app URL — read in the Next app so NEXT_PUBLIC_* is inlined. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Login lives on workspace (same-origin cookies). Marketing only deep-links there. */
export function getAuthHref(): string {
  return `${getAppUrl()}/login`;
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
