import { lessonProgressApi } from "../api/progress-api";
import type { SkillId } from "./skill-exercises";
import { isSkillId } from "./skill-exercises";

export type LessonProgressStatus = "started" | "completed";

export type LessonProgressEntry = {
  lessonId: string;
  status: LessonProgressStatus;
  updatedAt: string;
};

export type LessonFavoriteEntry = {
  lessonId: string;
  updatedAt: string;
};

export type ExerciseFavoriteEntry = {
  skillId: SkillId;
  exerciseId: string;
  updatedAt: string;
};

export type LessonProgressState = {
  started: LessonProgressEntry[];
  completed: LessonProgressEntry[];
  favorites: LessonFavoriteEntry[];
  exerciseFavorites: ExerciseFavoriteEntry[];
};

export type LessonListKind = LessonProgressStatus | "favorites" | "exerciseFavorites";

export const LESSON_PROGRESS_KEY = "englitutor-lesson-progress";
export const LESSON_PROGRESS_EVENT = "englitutor-lesson-progress";
export const LESSON_PROGRESS_SYNCED_PREFIX = "englitutor-lesson-progress-synced";

let activeUserId: string | null = null;
let syncArmed = false;
let applyingRemote = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let hydrateGeneration = 0;

function emptyState(): LessonProgressState {
  return { started: [], completed: [], favorites: [], exerciseFavorites: [] };
}

let cachedRaw: string | null | undefined;
let cachedState: LessonProgressState = emptyState();

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LESSON_PROGRESS_EVENT));
}

function isProgressEntry(value: unknown): value is LessonProgressEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as LessonProgressEntry;
  return (
    typeof row.lessonId === "string" &&
    (row.status === "started" || row.status === "completed") &&
    typeof row.updatedAt === "string"
  );
}

function isFavoriteEntry(value: unknown): value is LessonFavoriteEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as LessonFavoriteEntry;
  return typeof row.lessonId === "string" && typeof row.updatedAt === "string";
}

function isExerciseFavoriteEntry(value: unknown): value is ExerciseFavoriteEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as ExerciseFavoriteEntry;
  return (
    isSkillId(row.skillId) &&
    typeof row.exerciseId === "string" &&
    typeof row.updatedAt === "string"
  );
}

function parseState(raw: string | null): LessonProgressState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<LessonProgressState>;
    const started = Array.isArray(parsed.started) ? parsed.started.filter(isProgressEntry) : [];
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter(isProgressEntry)
      : [];
    const favorites = Array.isArray(parsed.favorites)
      ? parsed.favorites.filter(isFavoriteEntry)
      : [];
    const exerciseFavorites = Array.isArray(parsed.exerciseFavorites)
      ? parsed.exerciseFavorites.filter(isExerciseFavoriteEntry)
      : [];
    return { started, completed, favorites, exerciseFavorites };
  } catch {
    return emptyState();
  }
}

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
    if (!localStorage.getItem(syncedFlag(activeUserId))) {
      return localStorage.getItem(LESSON_PROGRESS_KEY);
    }
    return null;
  }
  return localStorage.getItem(LESSON_PROGRESS_KEY);
}

export function getLessonProgress(): LessonProgressState {
  if (typeof window === "undefined") return emptyState();
  const raw = readRaw();
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  cachedState = parseState(raw);
  return cachedState;
}

function byUpdatedAtDesc<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function latestMap<T extends { updatedAt: string }>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T>();
  for (const item of items) {
    const id = key(item);
    const previous = map.get(id);
    if (!previous || item.updatedAt > previous.updatedAt) map.set(id, item);
  }
  return map;
}

export function mergeLessonProgress(
  local: LessonProgressState,
  remote: LessonProgressState,
): LessonProgressState {
  const statuses = latestMap(
    [...remote.started, ...remote.completed, ...local.started, ...local.completed],
    (entry) => entry.lessonId,
  );
  const started: LessonProgressEntry[] = [];
  const completed: LessonProgressEntry[] = [];
  for (const entry of statuses.values()) {
    if (entry.status === "completed") completed.push(entry);
    else started.push({ ...entry, status: "started" });
  }
  return {
    started: byUpdatedAtDesc(started),
    completed: byUpdatedAtDesc(completed),
    favorites: byUpdatedAtDesc([
      ...latestMap([...local.favorites, ...remote.favorites], (entry) => entry.lessonId).values(),
    ]),
    exerciseFavorites: byUpdatedAtDesc([
      ...latestMap(
        [...local.exerciseFavorites, ...remote.exerciseFavorites],
        (entry) => `${entry.skillId}:${entry.exerciseId}`,
      ).values(),
    ]),
  };
}

export function setActiveLessonProgressUser(userId: string | null) {
  if (activeUserId === userId) return;
  activeUserId = userId;
  syncArmed = false;
  invalidateLessonProgressCache();
  notify();
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

function queueSync(state: LessonProgressState) {
  if (!syncArmed || !activeUserId || applyingRemote) return;
  if (syncTimer) clearTimeout(syncTimer);
  const snapshot = state;
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void lessonProgressApi.put(snapshot);
  }, 300);
}

/** Force the next read to re-parse localStorage (e.g. after a cross-tab storage event). */
export function invalidateLessonProgressCache() {
  cachedRaw = undefined;
}

function saveLessonProgress(state: LessonProgressState) {
  const raw = JSON.stringify(state);
  localStorage.setItem(storageKey(), raw);
  if (activeUserId) localStorage.removeItem(LESSON_PROGRESS_KEY);
  cachedRaw = raw;
  cachedState = state;
  notify();
  queueSync(state);
}

function withoutLesson<T extends { lessonId: string }>(entries: T[], lessonId: string) {
  return entries.filter((entry) => entry.lessonId !== lessonId);
}

function withoutExercise(entries: ExerciseFavoriteEntry[], skillId: SkillId, exerciseId: string) {
  return entries.filter(
    (entry) => !(entry.skillId === skillId && entry.exerciseId === exerciseId),
  );
}

function upsertProgress(
  entries: LessonProgressEntry[],
  lessonId: string,
  status: LessonProgressStatus,
): LessonProgressEntry[] {
  const next: LessonProgressEntry = {
    lessonId,
    status,
    updatedAt: new Date().toISOString(),
  };
  return [next, ...withoutLesson(entries, lessonId)];
}

function upsertFavorite(
  entries: LessonFavoriteEntry[],
  lessonId: string,
): LessonFavoriteEntry[] {
  const next: LessonFavoriteEntry = {
    lessonId,
    updatedAt: new Date().toISOString(),
  };
  return [next, ...withoutLesson(entries, lessonId)];
}

function upsertExerciseFavorite(
  entries: ExerciseFavoriteEntry[],
  skillId: SkillId,
  exerciseId: string,
): ExerciseFavoriteEntry[] {
  const next: ExerciseFavoriteEntry = {
    skillId,
    exerciseId,
    updatedAt: new Date().toISOString(),
  };
  return [next, ...withoutExercise(entries, skillId, exerciseId)];
}

export function getLessonStatus(lessonId: string): LessonProgressStatus | null {
  const state = getLessonProgress();
  if (state.completed.some((entry) => entry.lessonId === lessonId)) return "completed";
  if (state.started.some((entry) => entry.lessonId === lessonId)) return "started";
  return null;
}

export function isLessonFavorite(lessonId: string): boolean {
  return getLessonProgress().favorites.some((entry) => entry.lessonId === lessonId);
}

export function isExerciseFavorite(skillId: SkillId, exerciseId: string): boolean {
  return getLessonProgress().exerciseFavorites.some(
    (entry) => entry.skillId === skillId && entry.exerciseId === exerciseId,
  );
}

/** Mark a lesson as in progress. No-ops if already completed or already started. */
export function markLessonStarted(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  if (state.completed.some((entry) => entry.lessonId === lessonId)) return;
  if (state.started.some((entry) => entry.lessonId === lessonId)) return;
  saveLessonProgress({
    ...state,
    started: upsertProgress(state.started, lessonId, "started"),
  });
}

export function markLessonCompleted(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  saveLessonProgress({
    ...state,
    started: withoutLesson(state.started, lessonId),
    completed: upsertProgress(state.completed, lessonId, "completed"),
  });
}

export function reopenLesson(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  saveLessonProgress({
    ...state,
    completed: withoutLesson(state.completed, lessonId),
    started: upsertProgress(state.started, lessonId, "started"),
  });
}

export function removeLessonProgress(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  saveLessonProgress({
    ...state,
    started: withoutLesson(state.started, lessonId),
    completed: withoutLesson(state.completed, lessonId),
  });
}

export function toggleLessonFavorite(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  const isFavorite = state.favorites.some((entry) => entry.lessonId === lessonId);
  saveLessonProgress({
    ...state,
    favorites: isFavorite
      ? withoutLesson(state.favorites, lessonId)
      : upsertFavorite(state.favorites, lessonId),
  });
}

export function removeLessonFavorite(lessonId: string) {
  if (!lessonId || typeof window === "undefined") return;
  const state = getLessonProgress();
  if (!state.favorites.some((entry) => entry.lessonId === lessonId)) return;
  saveLessonProgress({
    ...state,
    favorites: withoutLesson(state.favorites, lessonId),
  });
}

export function toggleExerciseFavorite(skillId: SkillId, exerciseId: string) {
  if (!skillId || !exerciseId || typeof window === "undefined") return;
  const state = getLessonProgress();
  const isFavorite = state.exerciseFavorites.some(
    (entry) => entry.skillId === skillId && entry.exerciseId === exerciseId,
  );
  saveLessonProgress({
    ...state,
    exerciseFavorites: isFavorite
      ? withoutExercise(state.exerciseFavorites, skillId, exerciseId)
      : upsertExerciseFavorite(state.exerciseFavorites, skillId, exerciseId),
  });
}

export function removeExerciseFavorite(skillId: SkillId, exerciseId: string) {
  if (!skillId || !exerciseId || typeof window === "undefined") return;
  const state = getLessonProgress();
  if (
    !state.exerciseFavorites.some(
      (entry) => entry.skillId === skillId && entry.exerciseId === exerciseId,
    )
  ) {
    return;
  }
  saveLessonProgress({
    ...state,
    exerciseFavorites: withoutExercise(state.exerciseFavorites, skillId, exerciseId),
  });
}

export function clearLessonProgress(kind?: LessonListKind) {
  if (typeof window === "undefined") return;
  const state = getLessonProgress();
  if (kind === "started") {
    saveLessonProgress({ ...state, started: [] });
    return;
  }
  if (kind === "completed") {
    saveLessonProgress({ ...state, completed: [] });
    return;
  }
  if (kind === "favorites") {
    saveLessonProgress({ ...state, favorites: [] });
    return;
  }
  if (kind === "exerciseFavorites") {
    saveLessonProgress({ ...state, exerciseFavorites: [] });
    return;
  }
  saveLessonProgress(emptyState());
}
