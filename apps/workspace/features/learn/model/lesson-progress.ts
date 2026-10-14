import { create } from "zustand";
import { lessonProgressApi } from "../api/progress-api";
import {
  emptyLessonProgress,
  isExerciseFavoriteIn,
  isLessonFavoriteIn,
  lessonStatusIn,
  mergeLessonProgress,
  parseLessonProgress,
  withCleared,
  withExerciseFavoriteToggled,
  withLessonCompleted,
  withLessonFavoriteToggled,
  withLessonReopened,
  withLessonStarted,
  withoutExerciseFavorite,
  withoutLessonFavorite,
  withoutLessonProgress,
  type LessonListKind,
  type LessonProgressState,
  type LessonProgressStatus,
} from "./lesson-progress.logic";
import type { SkillId } from "./skill-exercises";

export type {
  ExerciseFavoriteEntry,
  LessonFavoriteEntry,
  LessonListKind,
  LessonProgressEntry,
  LessonProgressState,
  LessonProgressStatus,
} from "./lesson-progress.logic";
export { mergeLessonProgress };

export const LESSON_PROGRESS_KEY = "englitutor-lesson-progress";
export const LESSON_PROGRESS_SYNCED_PREFIX = "englitutor-lesson-progress-synced";

/**
 * Local-first store: localStorage (scoped per signed-in user) is the persisted copy,
 * the Zustand store is the in-memory copy React subscribes to, and changes are
 * debounced up to the server once the account has been hydrated.
 */
type LessonProgressStore = { progress: LessonProgressState };

export const useLessonProgressStore = create<LessonProgressStore>(() => ({
  progress: emptyLessonProgress(),
}));

// Sync bookkeeping is deliberately outside the store: nothing renders from it.
let activeUserId: string | null = null;
let syncArmed = false;
let applyingRemote = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let hydrateGeneration = 0;
/** Last raw string the store was built from; avoids re-parsing identical storage. */
let loadedRaw: string | null | undefined;

function storageKey() {
  return activeUserId ? `${LESSON_PROGRESS_KEY}:${activeUserId}` : LESSON_PROGRESS_KEY;
}

function syncedFlag(userId: string) {
  return `${LESSON_PROGRESS_SYNCED_PREFIX}:${userId}`;
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  if (activeUserId) {
    const scoped = localStorage.getItem(storageKey());
    if (scoped) return scoped;
    // Before the first server sync, fall back to progress made while signed out.
    if (!localStorage.getItem(syncedFlag(activeUserId))) {
      return localStorage.getItem(LESSON_PROGRESS_KEY);
    }
    return null;
  }
  return localStorage.getItem(LESSON_PROGRESS_KEY);
}

/** Rebuild the in-memory state from localStorage. `force` re-parses even if unchanged. */
function reloadFromStorage(force = false) {
  const raw = readRaw();
  if (!force && raw === loadedRaw) return;
  loadedRaw = raw;
  useLessonProgressStore.setState({ progress: parseLessonProgress(raw) });
}

export function getLessonProgress(): LessonProgressState {
  return useLessonProgressStore.getState().progress;
}

export function setActiveLessonProgressUser(userId: string | null) {
  if (activeUserId === userId) return;
  activeUserId = userId;
  syncArmed = false;
  reloadFromStorage(true);
}

function queueSync(state: LessonProgressState) {
  if (!syncArmed || !activeUserId || applyingRemote) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void lessonProgressApi.put(state);
  }, 300);
}

function saveLessonProgress(state: LessonProgressState) {
  const raw = JSON.stringify(state);
  localStorage.setItem(storageKey(), raw);
  if (activeUserId) localStorage.removeItem(LESSON_PROGRESS_KEY);
  loadedRaw = raw;
  useLessonProgressStore.setState({ progress: state });
  queueSync(state);
}

export function replaceLessonProgress(state: LessonProgressState) {
  applyingRemote = true;
  saveLessonProgress(state);
  applyingRemote = false;
}

export async function hydrateLessonProgress(userId: string) {
  const generation = ++hydrateGeneration;
  setActiveLessonProgressUser(userId);
  const remote = await lessonProgressApi.get();
  if (generation !== hydrateGeneration || !remote || activeUserId !== userId) return;
  const flag = syncedFlag(userId);
  if (!localStorage.getItem(flag)) {
    const merged = mergeLessonProgress(getLessonProgress(), remote);
    const saved = await lessonProgressApi.put(merged);
    if (generation !== hydrateGeneration || !saved || activeUserId !== userId) return;
    replaceLessonProgress(saved);
    localStorage.setItem(flag, "1");
    localStorage.removeItem(LESSON_PROGRESS_KEY);
  } else {
    replaceLessonProgress(remote);
  }
  if (generation === hydrateGeneration && activeUserId === userId) syncArmed = true;
}

/** Apply a pure transition and persist it unless the transition was a no-op. */
function update(transition: (state: LessonProgressState) => LessonProgressState) {
  if (typeof window === "undefined") return;
  const current = getLessonProgress();
  const next = transition(current);
  if (next !== current) saveLessonProgress(next);
}

export function getLessonStatus(lessonId: string): LessonProgressStatus | null {
  return lessonStatusIn(getLessonProgress(), lessonId);
}

export function isLessonFavorite(lessonId: string): boolean {
  return isLessonFavoriteIn(getLessonProgress(), lessonId);
}

export function isExerciseFavorite(skillId: SkillId, exerciseId: string): boolean {
  return isExerciseFavoriteIn(getLessonProgress(), skillId, exerciseId);
}

/** Mark a lesson as in progress. No-ops if already completed or already started. */
export function markLessonStarted(lessonId: string) {
  if (!lessonId) return;
  update((state) => withLessonStarted(state, lessonId));
}

export function markLessonCompleted(lessonId: string) {
  if (!lessonId) return;
  update((state) => withLessonCompleted(state, lessonId));
}

export function reopenLesson(lessonId: string) {
  if (!lessonId) return;
  update((state) => withLessonReopened(state, lessonId));
}

export function removeLessonProgress(lessonId: string) {
  if (!lessonId) return;
  update((state) => withoutLessonProgress(state, lessonId));
}

export function toggleLessonFavorite(lessonId: string) {
  if (!lessonId) return;
  update((state) => withLessonFavoriteToggled(state, lessonId));
}

export function removeLessonFavorite(lessonId: string) {
  if (!lessonId) return;
  update((state) => withoutLessonFavorite(state, lessonId));
}

export function toggleExerciseFavorite(skillId: SkillId, exerciseId: string) {
  if (!skillId || !exerciseId) return;
  update((state) => withExerciseFavoriteToggled(state, skillId, exerciseId));
}

export function removeExerciseFavorite(skillId: SkillId, exerciseId: string) {
  if (!skillId || !exerciseId) return;
  update((state) => withoutExerciseFavorite(state, skillId, exerciseId));
}

export function clearLessonProgress(kind?: LessonListKind) {
  update((state) => withCleared(state, kind));
}

if (typeof window !== "undefined") {
  reloadFromStorage();
  // Another tab changed the saved progress.
  window.addEventListener("storage", (event) => {
    if (event.key !== null && !event.key.startsWith(LESSON_PROGRESS_KEY)) return;
    reloadFromStorage(true);
  });
}
