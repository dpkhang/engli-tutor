import type { TranslateDirection, TranslateResult } from "../api";

type CacheEntry = {
  storedAt: number;
  result: TranslateResult;
};

const STORAGE_KEY = "englitutor.translate-cache.v1";
const MAX_ENTRIES = 250;
const TTL_MS = 1000 * 60 * 60 * 24 * 14;

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<TranslateResult | null>>();
let hydrated = false;

export function cacheKey(direction: TranslateDirection, text: string, focusWord = "") {
  const query = text.trim().replace(/\s+/g, " ").toLowerCase();
  const focus = focusWord.trim().toLowerCase();
  return focus ? `${direction}:${query}::${focus}` : `${direction}:${query}`;
}

function isFresh(entry: CacheEntry) {
  return Date.now() - entry.storedAt < TTL_MS;
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry?.result && isFresh(entry)) memory.set(key, entry);
    }
  } catch {
    memory.clear();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  const entries = [...memory.entries()]
    .sort((a, b) => b[1].storedAt - a[1].storedAt)
    .slice(0, MAX_ENTRIES);
  memory.clear();
  for (const [key, entry] of entries) memory.set(key, entry);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Quota or private mode — memory cache still works.
  }
}

export function getCachedLookup(
  direction: TranslateDirection,
  text: string,
  focusWord = "",
): TranslateResult | null {
  hydrate();
  const key = cacheKey(direction, text, focusWord);
  const entry = memory.get(key);
  if (!entry || !isFresh(entry)) {
    if (entry) memory.delete(key);
    return null;
  }
  return entry.result;
}

export function putCachedLookup(
  direction: TranslateDirection,
  text: string,
  result: TranslateResult,
  focusWord = "",
) {
  if (result.demo) return;
  hydrate();
  memory.set(cacheKey(direction, text, focusWord), { storedAt: Date.now(), result });
  persist();
}

export function takeInflight(key: string) {
  return inflight.get(key);
}

export function setInflight(key: string, promise: Promise<TranslateResult | null>) {
  inflight.set(key, promise);
  void promise.finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
}
