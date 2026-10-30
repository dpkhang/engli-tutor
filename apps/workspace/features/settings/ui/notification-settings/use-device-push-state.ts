"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readDevicePushState,
  type DevicePushState,
} from "@/features/notifications";

export function useDevicePushState() {
  const [state, setState] = useState<DevicePushState>("unknown");

  const refresh = useCallback(() => {
    try {
      setState(readDevicePushState());
    } catch {
      setState("unknown");
    }
  }, []);

  useEffect(() => {
    refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    let status: PermissionStatus | null = null;
    let cancelled = false;
    try {
      void navigator.permissions
        ?.query({ name: "notifications" })
        .then((result) => {
          if (cancelled) return;
          status = result;
          result.addEventListener("change", refresh);
        })
        .catch(() => undefined);
    } catch {
      // Permissions API unavailable; focus/visibility refresh is enough.
    }

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      status?.removeEventListener("change", refresh);
    };
  }, [refresh]);

  return { state, refresh };
}
