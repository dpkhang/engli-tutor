"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { withCurrentLocale } from "@/lib/locale-path";
import { useSignOutLoading } from "@/features/layout";
import { resetAccountAppearance } from "@/features/settings";

const SESSION_EVENTS_URL = "/api/account/session-events";
const RECONNECT_DELAY_MS = 5_000;
export const SESSION_REVOKED_REASON = "session-revoked";

/**
 * Listens for server-sent session events and force-logs-out this device when
 * its session is revoked from another device (or another tab signs out).
 */
export function SessionRevocationWatcher({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { signingOut, beginSignOut } = useSignOutLoading();
  const signingOutRef = useRef(signingOut);
  useEffect(() => {
    signingOutRef.current = signingOut;
  }, [signingOut]);

  useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const forceLogout = async () => {
      if (stopped) return;
      stopped = true;
      source?.close();
      // This device started its own sign-out; that flow handles navigation.
      if (signingOutRef.current) return;
      beginSignOut();
      try {
        // The server session is already gone; this clears the local cookie/cache.
        await authClient.signOut();
      } catch {
        // Ignore — the session no longer exists server-side.
      }
      resetAccountAppearance();
      queryClient.clear();
      window.location.replace(
        `${withCurrentLocale("/login")}?reason=${SESSION_REVOKED_REASON}`,
      );
    };

    const verifySession = async () => {
      if (stopped) return;
      try {
        const { data } = await authClient.getSession({
          query: { disableCookieCache: true },
        });
        if (!data?.user) {
          void forceLogout();
          return;
        }
      } catch {
        // Network trouble — just retry the stream later.
      }
      if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    function connect() {
      if (stopped) return;
      source = new EventSource(SESSION_EVENTS_URL, { withCredentials: true });
      source.addEventListener("session-revoked", () => void forceLogout());
      source.onerror = () => {
        // EventSource retries transient drops itself; a CLOSED state means the
        // server rejected the stream (e.g. 401), so confirm the session.
        if (source?.readyState !== EventSource.CLOSED) return;
        source.close();
        void verifySession();
      };
    }

    connect();
    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [beginSignOut, queryClient, userId]);

  return null;
}
