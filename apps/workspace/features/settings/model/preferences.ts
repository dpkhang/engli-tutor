import { isSkillLevel, type SkillLevel } from "@/features/learn";

export const LEVEL_STORAGE_KEY = "englitutor-preferred-level";
export const SPEECH_RATE_KEY = "englitutor-speech-rate";
export const AUTOPLAY_LISTENING_KEY = "englitutor-autoplay-listening";
export const THEME_STORAGE_KEY = "englitutor-theme";
/** Key used before the rebrand; still read (and migrated) so saved themes survive. */
export const LEGACY_THEME_STORAGE_KEY = "pagecraft-theme";
export const ACCENT_STORAGE_KEY = "englitutor-accent";
export const TEXT_SIZE_STORAGE_KEY = "englitutor-text-size";
export const REDUCE_MOTION_STORAGE_KEY = "englitutor-reduce-motion";
export const PREFERENCES_EVENT = "englitutor-preferences";
export const THEME_EVENT = "englitutor-theme";

export type SpeechRateId = "slow" | "normal" | "fast";
export type ThemePreference =
  | "light"
  | "warm"
  | "dark"
  | "midnight"
  | "forest"
  | "ocean"
  | "dusk"
  | "system";

const THEME_IDS: ThemePreference[] = [
  "light",
  "warm",
  "dark",
  "midnight",
  "forest",
  "ocean",
  "dusk",
  "system",
];

const DARK_THEMES = new Set<ThemePreference>(["dark", "midnight", "forest", "ocean", "dusk"]);

export function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && THEME_IDS.includes(value as ThemePreference);
}

export function isAccentId(value: string | null): value is AccentId {
  return value !== null && ACCENTS.some((item) => item.id === value);
}

export function isTextSizeId(value: string | null): value is TextSizeId {
  return value === "default" || value === "comfortable" || value === "large";
}
export type AccentId =
  | "indigo"
  | "violet"
  | "fuchsia"
  | "sky"
  | "blue"
  | "teal"
  | "emerald"
  | "lime"
  | "amber"
  | "orange"
  | "rose"
  | "slate";
export type TextSizeId = "default" | "comfortable" | "large";
export type ReduceMotionPreference = "system" | "on" | "off";

export const ACCENTS: Array<{ id: AccentId; label: string; swatch: string }> = [
  { id: "indigo", label: "Indigo", swatch: "244 72% 56%" },
  { id: "violet", label: "Violet", swatch: "262 72% 54%" },
  { id: "fuchsia", label: "Fuchsia", swatch: "292 72% 50%" },
  { id: "sky", label: "Sky", swatch: "201 90% 44%" },
  { id: "blue", label: "Blue", swatch: "217 88% 50%" },
  { id: "teal", label: "Teal", swatch: "173 70% 36%" },
  { id: "emerald", label: "Emerald", swatch: "156 64% 36%" },
  { id: "lime", label: "Lime", swatch: "84 70% 38%" },
  { id: "amber", label: "Amber", swatch: "32 94% 48%" },
  { id: "orange", label: "Orange", swatch: "24 94% 50%" },
  { id: "rose", label: "Rose", swatch: "348 78% 52%" },
  { id: "slate", label: "Slate", swatch: "215 22% 42%" },
];

export const TEXT_SIZES: Array<{ id: TextSizeId; labelKey: string; hintKey: string }> = [
  { id: "default", labelKey: "settings.textSize.default", hintKey: "settings.textSize.defaultHint" },
  { id: "comfortable", labelKey: "settings.textSize.comfortable", hintKey: "settings.textSize.comfortableHint" },
  { id: "large", labelKey: "settings.textSize.large", hintKey: "settings.textSize.largeHint" },
];

export const REDUCE_MOTION_OPTIONS: Array<{
  id: ReduceMotionPreference;
  labelKey: string;
  hintKey: string;
}> = [
  { id: "system", labelKey: "workspace.system", hintKey: "settings.motion.systemHint" },
  { id: "on", labelKey: "settings.motion.reduce", hintKey: "settings.motion.reduceHint" },
  { id: "off", labelKey: "settings.motion.keep", hintKey: "settings.motion.keepHint" },
];

export const SPEECH_RATES: Record<
  SpeechRateId,
  { labelKey: string; hintKey: string; tts: number; audio: number }
> = {
  slow: { labelKey: "settings.speechRate.slow", hintKey: "settings.speechRate.slowHint", tts: 0.82, audio: 0.85 },
  normal: { labelKey: "settings.speechRate.normal", hintKey: "settings.speechRate.normalHint", tts: 0.94, audio: 1 },
  fast: { labelKey: "settings.speechRate.fast", hintKey: "settings.speechRate.fastHint", tts: 1.08, audio: 1.15 },
};

function notifyPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

let appearanceGeneration = 0;
let appearanceSyncArmed = false;
let applyingRemoteAppearance = false;
let appearanceSyncTimer: ReturnType<typeof setTimeout> | null = null;

function queueAppearanceSync() {
  if (!appearanceSyncArmed || applyingRemoteAppearance || typeof window === "undefined") return;
  if (appearanceSyncTimer) clearTimeout(appearanceSyncTimer);
  appearanceSyncTimer = setTimeout(() => {
    appearanceSyncTimer = null;
    const generation = appearanceGeneration;
    const appearance = {
      appearanceTheme: getThemePreference(),
      appearanceAccent: getAccentPreference(),
      appearanceTextSize: getTextSizePreference(),
    };
    void import("@/features/accounts/api/accounts-api").then(({ accountApi }) => {
      if (!appearanceSyncArmed || generation !== appearanceGeneration) return;
      return accountApi.update(appearance);
    }).catch(() => undefined);
  }, 300);
}

export function disarmAppearanceSync() {
  appearanceGeneration += 1;
  appearanceSyncArmed = false;
  if (appearanceSyncTimer) clearTimeout(appearanceSyncTimer);
  appearanceSyncTimer = null;
}

/** Local reset only: never overwrite the account's saved appearance. */
export function resetAccountAppearance() {
  disarmAppearanceSync();
  if (typeof window === "undefined") return;
  localStorage.removeItem(THEME_STORAGE_KEY);
  localStorage.removeItem(ACCENT_STORAGE_KEY);
  paintTheme("system");
  paintAccent("indigo");
  window.dispatchEvent(new Event(THEME_EVENT));
  notifyPreferences();
}

export async function hydrateAppearancePreferences(expectedUserId?: string) {
  disarmAppearanceSync();
  const generation = appearanceGeneration;
  const { accountApi } = await import("@/features/accounts/api/accounts-api");
  const profile = await accountApi.get();
  if (generation !== appearanceGeneration || (expectedUserId && profile.id !== expectedUserId)) return false;
  applyingRemoteAppearance = true;
  const missing: {
    appearanceTheme?: ThemePreference;
    appearanceAccent?: AccentId;
    appearanceTextSize?: TextSizeId;
  } = {};
  if (isThemePreference(profile.appearanceTheme)) {
    paintTheme(profile.appearanceTheme);
    localStorage.setItem(THEME_STORAGE_KEY, profile.appearanceTheme);
  } else {
    paintTheme("system");
    localStorage.removeItem(THEME_STORAGE_KEY);
  }
  if (isAccentId(profile.appearanceAccent)) {
    paintAccent(profile.appearanceAccent);
    localStorage.setItem(ACCENT_STORAGE_KEY, profile.appearanceAccent);
  } else {
    paintAccent("indigo");
    localStorage.removeItem(ACCENT_STORAGE_KEY);
  }
  if (isTextSizeId(profile.appearanceTextSize)) {
    paintTextSize(profile.appearanceTextSize);
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, profile.appearanceTextSize);
  } else {
    missing.appearanceTextSize = getTextSizePreference();
  }
  applyingRemoteAppearance = false;
  window.dispatchEvent(new Event(THEME_EVENT));
  notifyPreferences();
  appearanceSyncArmed = true;
  if (Object.keys(missing).length > 0) {
    await accountApi.update(missing);
  }
  return generation === appearanceGeneration;
}

export function getPreferredLevel(): SkillLevel | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LEVEL_STORAGE_KEY);
  if (stored === "A2+") return "TOEIC";
  return stored && isSkillLevel(stored) ? stored : null;
}

export function setPreferredLevel(level: SkillLevel | null) {
  if (level) localStorage.setItem(LEVEL_STORAGE_KEY, level);
  else localStorage.removeItem(LEVEL_STORAGE_KEY);
  notifyPreferences();
}

export function getSpeechRateId(): SpeechRateId {
  if (typeof window === "undefined") return "normal";
  const stored = localStorage.getItem(SPEECH_RATE_KEY);
  return stored === "slow" || stored === "fast" ? stored : "normal";
}

export function setSpeechRateId(id: SpeechRateId) {
  localStorage.setItem(SPEECH_RATE_KEY, id);
  notifyPreferences();
}

export function getAutoPlayListening(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTOPLAY_LISTENING_KEY) === "1";
}

export function setAutoPlayListening(value: boolean) {
  localStorage.setItem(AUTOPLAY_LISTENING_KEY, value ? "1" : "0");
  notifyPreferences();
}

export function applyLearningPreferences(prefs: {
  level: SkillLevel | null;
  speechRate: SpeechRateId;
  autoPlay: boolean;
}) {
  setPreferredLevel(prefs.level);
  setSpeechRateId(prefs.speechRate);
  setAutoPlayListening(prefs.autoPlay);
}

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemePreference(stored)) return stored;
  const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (isThemePreference(legacy)) {
    localStorage.setItem(THEME_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    return legacy;
  }
  return "system";
}

function paintTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  const dark = DARK_THEMES.has(resolved as ThemePreference);
  root.classList.toggle("dark", dark);
  root.classList.remove("midnight");
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function applyThemePreference(theme: ThemePreference) {
  paintTheme(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
  notifyPreferences();
  queueAppearanceSync();
}

export function getAccentPreference(): AccentId {
  if (typeof window === "undefined") return "indigo";
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  return ACCENTS.some((item) => item.id === stored) ? (stored as AccentId) : "indigo";
}

function paintAccent(accent: AccentId) {
  document.documentElement.setAttribute("data-accent", accent);
}

export function applyAccentPreference(accent: AccentId) {
  paintAccent(accent);
  localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  notifyPreferences();
  queueAppearanceSync();
}

export function getTextSizePreference(): TextSizeId {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
  return stored === "comfortable" || stored === "large" ? stored : "default";
}

function paintTextSize(size: TextSizeId) {
  document.documentElement.setAttribute("data-text-size", size);
}

export function applyTextSizePreference(size: TextSizeId) {
  paintTextSize(size);
  localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  notifyPreferences();
  queueAppearanceSync();
}

export function getReduceMotionPreference(): ReduceMotionPreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(REDUCE_MOTION_STORAGE_KEY);
  return stored === "on" || stored === "off" ? stored : "system";
}

function paintReduceMotion(pref: ReduceMotionPreference) {
  document.documentElement.setAttribute("data-reduce-motion", pref);
  document.documentElement.classList.toggle("reduce-motion", pref === "on");
}

export function applyReduceMotionPreference(pref: ReduceMotionPreference) {
  paintReduceMotion(pref);
  localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, pref);
  notifyPreferences();
}

export function applyStoredAppearance() {
  paintTheme(getThemePreference());
  paintAccent(getAccentPreference());
  paintTextSize(getTextSizePreference());
  paintReduceMotion(getReduceMotionPreference());
}

export function applyAppearancePreferences(prefs: {
  theme: ThemePreference;
  accent: AccentId;
  textSize: TextSizeId;
  reduceMotion: ReduceMotionPreference;
}) {
  paintTheme(prefs.theme);
  localStorage.setItem(THEME_STORAGE_KEY, prefs.theme);
  paintAccent(prefs.accent);
  localStorage.setItem(ACCENT_STORAGE_KEY, prefs.accent);
  paintTextSize(prefs.textSize);
  localStorage.setItem(TEXT_SIZE_STORAGE_KEY, prefs.textSize);
  paintReduceMotion(prefs.reduceMotion);
  localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, prefs.reduceMotion);
  window.dispatchEvent(new Event(THEME_EVENT));
  notifyPreferences();
  queueAppearanceSync();
}

export function resolveSpeechRates() {
  return SPEECH_RATES[getSpeechRateId()];
}

/**
 * Explicit "Save" for the Appearance page. Awaits the account update first and
 * throws on failure (so the caller keeps its draft); only then paints and stores
 * locally. The debounced background sync is skipped (and any pending one is
 * cancelled) because the server already has these values.
 */
export async function saveAppearancePreferences(prefs: {
  theme: ThemePreference;
  accent: AccentId;
  textSize: TextSizeId;
  reduceMotion: ReduceMotionPreference;
}) {
  const { accountApi } = await import("@/features/accounts/api/accounts-api");
  await accountApi.update({
    appearanceTheme: prefs.theme,
    appearanceAccent: prefs.accent,
    appearanceTextSize: prefs.textSize,
  });
  if (appearanceSyncTimer) clearTimeout(appearanceSyncTimer);
  appearanceSyncTimer = null;
  applyingRemoteAppearance = true;
  try {
    applyAppearancePreferences(prefs);
  } finally {
    applyingRemoteAppearance = false;
  }
}
