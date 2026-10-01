import type { LegacyFlashcardMarks } from "../api/vocab-api";

const LEGACY_REVIEW_KEY = "englitutor-flashcard-review";
const LEGACY_SAVED_KEY = "englitutor-flashcard-saved";
const IMPORT_LIMIT = 500;

function readIds(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((id): id is string => typeof id === "string" && /^fc-[a-z0-9-]+$/.test(id))
      .slice(0, IMPORT_LIMIT);
  } catch {
    return [];
  }
}

/** Marks saved in this browser before flashcards synced per account; null when nothing to import. */
export function readLegacyFlashcardMarks(): LegacyFlashcardMarks | null {
  if (typeof window === "undefined") return null;
  const marks = { unlearned: readIds(LEGACY_REVIEW_KEY), saved: readIds(LEGACY_SAVED_KEY) };
  const hasKeys =
    window.localStorage.getItem(LEGACY_REVIEW_KEY) !== null ||
    window.localStorage.getItem(LEGACY_SAVED_KEY) !== null;
  return hasKeys ? marks : null;
}

export function clearLegacyFlashcardMarks() {
  window.localStorage.removeItem(LEGACY_REVIEW_KEY);
  window.localStorage.removeItem(LEGACY_SAVED_KEY);
}
