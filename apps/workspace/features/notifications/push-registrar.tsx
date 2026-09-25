"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { syncGrantedSubscription } from "./push-client";

export function PushRegistrar() {
  const { data } = useSession();
  const userId = data?.user?.id;

  useEffect(() => {
    if (!userId || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    void syncGrantedSubscription().catch(() => undefined);

    const onMessage = (event: MessageEvent) => {
      const url = event.data?.type === "navigate" ? event.data.url : null;
      if (typeof url === "string" && url.startsWith("/")) window.location.assign(url);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [userId]);

  return null;
}
