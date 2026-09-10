import { isSkillLevel, type SkillLevel } from "@/features/learn/model/skill-exercises";

export const LEVEL_STORAGE_KEY = "englitutor-preferred-level";
export const SPEECH_RATE_KEY = "englitutor-speech-rate";
export const AUTOPLAY_LISTENING_KEY = "englitutor-autoplay-listening";
export const THEME_STORAGE_KEY = "pagecraft-theme";
export const PREFERENCES_EVENT = "englitutor-preferences";

export type SpeechRateId = "slow" | "normal" | "fast";
export type ThemePreference = "light" | "dark" | "system";

export const SPEECH_RATES: Record<
  SpeechRateId,
  { label: string; hint: string; tts: number; audio: number }
> = {
  slow: { label: "Slow", hint: "Easier for dictation", tts: 0.82, audio: 0.85 },
  normal: { label: "Normal", hint: "Natural pace", tts: 0.94, audio: 1 },
  fast: { label: "Faster", hint: "Closer to native speed", tts: 1.08, audio: 1.15 },
};

function notifyPreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
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

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

export function applyThemePreference(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  notifyPreferences();
}

export function resolveSpeechRates() {
  return SPEECH_RATES[getSpeechRateId()];
}
