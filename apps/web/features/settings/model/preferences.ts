import { isSkillLevel, type SkillLevel } from "@/features/learn/model/skill-exercises";

export const LEVEL_STORAGE_KEY = "englitutor-preferred-level";
export const SPEECH_RATE_KEY = "englitutor-speech-rate";
export const AUTOPLAY_LISTENING_KEY = "englitutor-autoplay-listening";
export const THEME_STORAGE_KEY = "pagecraft-theme";
export const ACCENT_STORAGE_KEY = "englitutor-accent";
export const TEXT_SIZE_STORAGE_KEY = "englitutor-text-size";
export const REDUCE_MOTION_STORAGE_KEY = "englitutor-reduce-motion";
export const PREFERENCES_EVENT = "englitutor-preferences";
export const THEME_EVENT = "pagecraft-theme";

export type SpeechRateId = "slow" | "normal" | "fast";
export type ThemePreference = "light" | "dark" | "system";
export type AccentId = "indigo" | "sky" | "teal" | "emerald" | "rose" | "amber";
export type TextSizeId = "default" | "comfortable" | "large";
export type ReduceMotionPreference = "system" | "on" | "off";

export const ACCENTS: Array<{ id: AccentId; label: string; swatch: string }> = [
  { id: "indigo", label: "Indigo", swatch: "244 72% 56%" },
  { id: "sky", label: "Sky", swatch: "201 90% 44%" },
  { id: "teal", label: "Teal", swatch: "173 70% 36%" },
  { id: "emerald", label: "Emerald", swatch: "156 64% 36%" },
  { id: "rose", label: "Rose", swatch: "348 78% 52%" },
  { id: "amber", label: "Amber", swatch: "32 94% 48%" },
];

export const TEXT_SIZES: Array<{ id: TextSizeId; label: string; hint: string }> = [
  { id: "default", label: "Default", hint: "16px" },
  { id: "comfortable", label: "Comfortable", hint: "A bit larger" },
  { id: "large", label: "Large", hint: "Easier to read" },
];

export const REDUCE_MOTION_OPTIONS: Array<{
  id: ReduceMotionPreference;
  label: string;
  hint: string;
}> = [
  { id: "system", label: "System", hint: "Match your device" },
  { id: "on", label: "Reduce", hint: "Fewer animations" },
  { id: "off", label: "Keep motion", hint: "Always animate" },
];

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
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function paintTheme(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function applyThemePreference(theme: ThemePreference) {
  paintTheme(theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
  notifyPreferences();
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
}

export function resolveSpeechRates() {
  return SPEECH_RATES[getSpeechRateId()];
}
