export type DemoSession = {
  email: string;
  name?: string;
  provider: "email" | "google" | "apple" | "facebook" | "github";
  mode: "login" | "register";
  loggedInAt: string;
};

const STORAGE_KEY = "pagecraft.demo.session";

export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function saveDemoSession(session: DemoSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearDemoSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Auth page if guest, main app Workspace if already signed in. */
export function getEntryHref(): string {
  return readDemoSession() ? getAppUrl() : "/auth";
}

export function goToEntry(): void {
  const href = getEntryHref();
  if (href.startsWith("http")) {
    window.location.assign(href);
    return;
  }
  window.location.assign(href);
}

/** Demo sign-in: persist session then return to marketing home (header updates). */
export async function simulateSignIn(input: {
  email: string;
  name?: string;
  provider: DemoSession["provider"];
  mode: DemoSession["mode"];
  delayMs?: number;
}): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, input.delayMs ?? 800));

  saveDemoSession({
    email: input.email,
    name: input.name,
    provider: input.provider,
    mode: input.mode,
    loggedInAt: new Date().toISOString(),
  });

  window.dispatchEvent(new Event("pagecraft:auth"));
  window.location.assign("/");
}
