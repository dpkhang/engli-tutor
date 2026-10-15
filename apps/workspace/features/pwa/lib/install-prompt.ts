"use client";

import { useCallback, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let listening = false;
const subscribers = new Set<() => void>();

function notify() {
  for (const callback of subscribers) callback();
}

export function listenForInstallPrompt() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios && !/CriOS|FxiOS|EdgiOS/i.test(ua);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

/** "android" = Android without a native prompt (HTTP, unsupported browser, or Chrome's heuristics not met yet). */
export type InstallState = "unavailable" | "prompt" | "ios" | "android" | "installed";

function readState(): InstallState {
  if (installed || isStandaloneDisplay()) return "installed";
  if (deferredPrompt) return "prompt";
  if (isIosSafari()) return "ios";
  if (isAndroid()) return "android";
  return "unavailable";
}

// Chrome can fire beforeinstallprompt before hydration; listen as soon as this module loads.
listenForInstallPrompt();

export function useInstallPrompt() {
  const state = useSyncExternalStore(subscribe, readState, () => "unavailable" as const);

  const promptInstall = useCallback(async () => {
    const event = deferredPrompt;
    if (!event) return false;
    deferredPrompt = null;
    await event.prompt();
    const { outcome } = await event.userChoice;
    notify();
    return outcome === "accepted";
  }, []);

  return { state, promptInstall };
}
