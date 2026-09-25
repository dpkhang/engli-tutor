const FLASHCARD_REVIEW_KEY = "englitutor-flashcard-review";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FLASHCARD_REVIEW_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(FLASHCARD_REVIEW_KEY, JSON.stringify([...new Set(ids)]));
}

export function listFlashcardReview(): string[] {
  return readIds();
}

export function saveFlashcardForReview(id: string) {
  writeIds([id, ...readIds()]);
}

export function skipFlashcard(id: string) {
  writeIds(readIds().filter((item) => item !== id));
}

const FLASHCARD_SAVED_KEY = "englitutor-flashcard-saved";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FLASHCARD_SAVED_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function isFlashcardSaved(id: string) {
  return readSaved().includes(id);
}

export function saveFlashcard(id: string) {
  const ids = readSaved();
  if (ids.includes(id)) return;
  window.localStorage.setItem(FLASHCARD_SAVED_KEY, JSON.stringify([id, ...ids]));
}
