import { getWorkspaceUrl } from "@landing-page-generator/auth";

/** Workspace app URL. */
export function getAppUrl(): string {
  return getWorkspaceUrl();
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
