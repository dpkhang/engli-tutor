"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { listenForInstallPrompt } from "./install-prompt";

export function ServiceWorkerRegistrar() {
  const { toast } = useToast();
  const t = useWorkspaceI18n();
  const notifyUpdate = useRef(() => {});
  notifyUpdate.current = () =>
    toast({ title: t("workspace.pwaUpdatedTitle"), description: t("workspace.pwaUpdatedDescription"), durationMs: 8000 });

  useEffect(() => {
    listenForInstallPrompt();
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    // First install also fires controllerchange (clients.claim); only an existing controller means an update.
    const hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (hadController) notifyUpdate.current();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
