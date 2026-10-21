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

const SYNC_DONE_MESSAGE = "engli:session-sync-done";
const SILENT_SYNC_TIMEOUT_MS = 6_000;

/**
 * Load the target host's sync page in a hidden iframe so the user never sees
 * it. Resolves true once the iframe reports the token was exchanged, false on
 * timeout. Both hosts share a registrable domain, so the host-only cookie set
 * by the iframe response is a same-site cookie.
 */
function syncInBackground(url: string, targetOrigin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.referrerPolicy = "no-referrer";
    frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      frame.remove();
      resolve(ok);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin || event.source !== frame.contentWindow) return;
      if ((event.data as { type?: unknown } | null)?.type === SYNC_DONE_MESSAGE) finish(true);
    };
    const timer = window.setTimeout(() => finish(false), SILENT_SYNC_TIMEOUT_MS);

    window.addEventListener("message", onMessage);
    frame.src = url;
    document.body.appendChild(frame);
  });
}

async function generateSyncUrl(
  client: EngliAuthClient,
  target: string,
  params: Record<string, string>,
): Promise<string | null> {
  const { data, error } = await client.oneTimeToken.generate();
  if (error || !data?.token) return null;
  const url = new URL(SESSION_SYNC_PATH, target);
  url.searchParams.set("token", data.token);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

/**
 * Hand the current session to `targetOrigin`, then land on `returnTo`.
 * The hand-off runs in a hidden iframe; if that does not finish in time it
 * falls back to a visible redirect through the sync page.
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
    const silentUrl = await generateSyncUrl(client, target, {});
    if (!silentUrl) {
      syncInFlight = false;
      return false;
    }
    if (await syncInBackground(silentUrl, target)) {
      window.location.assign(returnTo);
      return true;
    }

    // The token may already be spent, so the visible fallback needs a fresh one.
    const visibleUrl = await generateSyncUrl(client, target, { returnTo });
    if (!visibleUrl) {
      syncInFlight = false;
      return false;
    }
    window.location.assign(visibleUrl);
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

/**
 * Receiving-page entry point. Inside the hidden iframe it tells the parent the
 * session is ready; as a top-level page (fallback) it continues to the target.
 */
export async function finishSessionSync(
  client: EngliAuthClient,
  options: { allowedOrigins: readonly string[]; fallback: string },
): Promise<void> {
  const next = await completeSessionSync(client, options);
  if (window.parent !== window) {
    // A mismatched targetOrigin is dropped silently, so only the real parent hears this.
    for (const origin of new Set(options.allowedOrigins.map(toOrigin))) {
      if (origin && origin !== window.location.origin) {
        window.parent.postMessage({ type: SYNC_DONE_MESSAGE }, origin);
      }
    }
    return;
  }
  window.location.replace(next);
}
