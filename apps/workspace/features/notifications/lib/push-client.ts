import {
  notificationsApi,
  type NotificationPreferences,
  type PushKeys,
} from "../api/notifications-api";
import { resolveDevicePushState, type DevicePushState } from "./push-state";

type PushResult = { ok: true } | { ok: false; message: string };

type Translate = (key: string) => string;

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function iosNeedsHomeScreen() {
  const ua = navigator.userAgent;
  const ios =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  return ios && !standalone;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1)
    output[index] = raw.charCodeAt(index);
  return output;
}

function canPush() {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/** Read-only: never prompts the user. */
export function readDevicePushState(): DevicePushState {
  if (typeof window === "undefined") return "unknown";
  const supported = canPush();
  return resolveDevicePushState({
    iosNeedsHomeScreen: iosNeedsHomeScreen(),
    canPush: supported,
    permission: supported ? Notification.permission : null,
  });
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.getRegistration("/");
  return registration?.pushManager.getSubscription() ?? null;
}

class PushSetupError extends Error {
  constructor(readonly messageKey: string) {
    super(messageKey);
  }
}

export async function subscribeCurrentDevice() {
  const key = await notificationsApi.publicKey();
  if (!key.configured || !key.publicKey) {
    throw new PushSetupError("settings.notifications.notConfigured");
  }
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key.publicKey),
    }));
  const json = subscription.toJSON() as PushKeys;
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new PushSetupError("settings.notifications.noSubscription");
  }
  await notificationsApi.subscribe(json);
}

export async function dropSubscription() {
  if (!("serviceWorker" in navigator)) return;
  const subscription = await currentSubscription();
  if (!subscription) return;
  await notificationsApi
    .unsubscribe(subscription.endpoint)
    .catch(() => undefined);
  await subscription.unsubscribe();
}

export async function enableDevicePush(t: Translate): Promise<PushResult> {
  if (iosNeedsHomeScreen()) {
    return {
      ok: false,
      message: t("settings.notifications.iosHomeScreen"),
    };
  }
  if (!canPush())
    return { ok: false, message: t("settings.notifications.unsupported") };
  // iOS does not treat <select> changes as a user gesture, so re-requesting there reports "denied".
  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      message: t("settings.notifications.blocked"),
    };
  }
  try {
    await subscribeCurrentDevice();
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof PushSetupError
        ? t(error.messageKey)
        : error instanceof Error
          ? error.message
          : t("settings.notifications.enableFailed");
    return { ok: false, message };
  }
}

export async function syncGrantedSubscription() {
  if (
    !canPush() ||
    Notification.permission !== "granted" ||
    iosNeedsHomeScreen()
  )
    return;
  const prefs = await notificationsApi.preferences();
  if (
    !prefs.notifyReminders &&
    !prefs.notifyTutor &&
    !prefs.notifyLessons &&
    !prefs.notifyCredits &&
    !prefs.notifyBilling
  ) {
    await dropSubscription();
    return;
  }
  await subscribeCurrentDevice();
}

export function preferencePayload(
  prefs: Omit<NotificationPreferences, "configured" | "reminderTimeZone">,
): Omit<NotificationPreferences, "configured"> {
  return {
    notifyReminders: prefs.notifyReminders,
    notifyTutor: prefs.notifyTutor,
    notifyLessons: prefs.notifyLessons,
    notifyCredits: prefs.notifyCredits,
    notifyBilling: prefs.notifyBilling,
    reminderMinutes: prefs.reminderMinutes,
    reminderTimeZone: browserTimeZone(),
  };
}
