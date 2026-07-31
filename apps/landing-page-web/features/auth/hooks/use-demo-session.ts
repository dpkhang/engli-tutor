"use client";

import { useEffect, useState } from "react";
import {
  getAppUrl,
  getEntryHref,
  readDemoSession,
  type DemoSession,
} from "@/features/auth/model/session";

export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSession(readDemoSession());
      setReady(true);
    };
    sync();
    window.addEventListener("pagecraft:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pagecraft:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isLoggedIn = Boolean(session);

  return {
    session,
    ready,
    isLoggedIn,
    entryHref: isLoggedIn ? getAppUrl() : "/auth",
    entryLabel: isLoggedIn ? "Mở Workspace" : "Bắt đầu miễn phí",
    getEntryHref,
  };
}
