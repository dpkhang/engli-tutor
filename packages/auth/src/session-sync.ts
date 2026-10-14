import type { EngliAuthClient } from "./client";

/**
 * Marketing and workspace keep host-only session cookies. After sign-in on one
 * host, the session is handed to the other host through this page with a
 * single-use token, so no other subdomain ever receives the cookie.
 */
export const SESSION_SYNC_PATH = "/auth/sync";

function toOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Absolute URL of `raw` when its origin is one of `allowedOrigins`, otherwise null. */
export function resolveAllowedUrl(
  raw: string | null | undefined,
  allowedOrigins: readonly string[],
): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const allowed = allowedOrigins.map(toOrigin).filter((origin): origin is string => Boolean(origin));
    return allowed.includes(url.origin) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isAllowedSyncOrigin(raw: string, allowedOrigins: readonly string[]): boolean {
  return resolveAllowedUrl(raw, allowedOrigins) !== null;
}

let syncInFlight = false;

/**
 * Hand the current session to `targetOrigin`, then land on `returnTo`.
 * Returns false (without navigating) when there is nothing to sync, so the
 * caller can fall back to a plain redirect.
 */
export async function startSessionSync(
  client: EngliAuthClient,
  targetOrigin: string,
  returnTo: string,
): Promise<boolean> {
  const target = toOrigin(targetOrigin);
  if (!target || target === window.location.origin) return false;
  // Cookies ignore ports, so hosts that differ only by port already share them.
  if (new URL(target).hostname === window.location.hostname) return false;
  if (syncInFlight) return true;
  syncInFlight = true;

  try {
    const { data, error } = await client.oneTimeToken.generate();
    if (error || !data?.token) {
      syncInFlight = false;
      return false;
    }
    const url = new URL(SESSION_SYNC_PATH, target);
    url.searchParams.set("token", data.token);
    url.searchParams.set("returnTo", returnTo);
    window.location.assign(url.toString());
    return true;
  } catch {
    syncInFlight = false;
    return false;
  }
}

/**
 * Runs on the receiving host: exchange the token for a host-only session
 * cookie and return the URL to continue to.
 */
export async function completeSessionSync(
  client: EngliAuthClient,
  options: { allowedOrigins: readonly string[]; fallback: string },
): Promise<string> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const returnTo = resolveAllowedUrl(params.get("returnTo"), options.allowedOrigins) ?? options.fallback;

  // Keep the token out of history and any later Referer header.
  window.history.replaceState(null, "", window.location.pathname);

  if (token) {
    try {
      await client.oneTimeToken.verify({ token });
    } catch {
      // An invalid or expired token only means this host stays signed out.
    }
  }
  return returnTo;
}
