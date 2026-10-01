import type { AccountProfile } from "../api";

const CHANNEL_NAME = "englitutor-account";
const STORAGE_KEY = "englitutor-account-sync";

type AccountSyncMessage = { profile?: AccountProfile };

let channel: BroadcastChannel | null | undefined;

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (channel === undefined) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }
  }
  return channel;
}

/** Tell other tabs the account profile changed (onboarding, welcome, settings). */
export function notifyAccountChanged(profile?: AccountProfile) {
  if (typeof window === "undefined") return;
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ profile } satisfies AccountSyncMessage);
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Other tabs can refetch later if this tab cannot signal them.
  }
}

export function subscribeAccountChanged(onChange: (profile?: AccountProfile) => void) {
  if (typeof window === "undefined") return () => {};

  const ch = getChannel();
  if (ch) {
    const onMessage = (event: MessageEvent<AccountSyncMessage>) => {
      onChange(event.data?.profile);
    };
    ch.addEventListener("message", onMessage);
    return () => ch.removeEventListener("message", onMessage);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
