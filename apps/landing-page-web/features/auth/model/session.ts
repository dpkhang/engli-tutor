/** Workspace app URL — read in the Next app so NEXT_PUBLIC_* is inlined. */
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAuthHref(): string {
  return "/auth";
}

/** Auth page if guest intent; workspace if caller already knows user is signed in. */
export function getEntryHref(isLoggedIn: boolean): string {
  return isLoggedIn ? getAppUrl() : getAuthHref();
}

export function goToEntry(isLoggedIn: boolean): void {
  const href = getEntryHref(isLoggedIn);
  if (href.startsWith("http")) {
    window.location.assign(href);
    return;
  }
  window.location.assign(href);
}

export function goToWorkspace(): void {
  window.location.assign(getAppUrl());
}
