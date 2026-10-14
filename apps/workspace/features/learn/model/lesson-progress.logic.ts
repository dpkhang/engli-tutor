import type { SkillId } from "./skill-exercises";
import { isSkillId } from "./skill-exercises";

/**
 * Pure lesson-progress logic: types, parsing, merging and state transitions.
 * No storage, network or React here, so it can be unit-tested in isolation.
 */

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

export function emptyLessonProgress(): LessonProgressState {
  return { started: [], completed: [], favorites: [], exerciseFavorites: [] };
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

/** Parse the persisted JSON, dropping malformed entries. Never throws. */
export function parseLessonProgress(raw: string | null): LessonProgressState {
  if (!raw) return emptyLessonProgress();
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
    return emptyLessonProgress();
  }
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

/** Merge local and remote state: for every id the entry with the newest `updatedAt` wins. */
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
  now: string,
): LessonProgressEntry[] {
  return [{ lessonId, status, updatedAt: now }, ...withoutLesson(entries, lessonId)];
}

function upsertFavorite(
  entries: LessonFavoriteEntry[],
  lessonId: string,
  now: string,
): LessonFavoriteEntry[] {
  return [{ lessonId, updatedAt: now }, ...withoutLesson(entries, lessonId)];
}

function upsertExerciseFavorite(
  entries: ExerciseFavoriteEntry[],
  skillId: SkillId,
  exerciseId: string,
  now: string,
): ExerciseFavoriteEntry[] {
  return [{ skillId, exerciseId, updatedAt: now }, ...withoutExercise(entries, skillId, exerciseId)];
}

const nowIso = () => new Date().toISOString();

export function lessonStatusIn(state: LessonProgressState, lessonId: string): LessonProgressStatus | null {
  if (state.completed.some((entry) => entry.lessonId === lessonId)) return "completed";
  if (state.started.some((entry) => entry.lessonId === lessonId)) return "started";
  return null;
}

export function isLessonFavoriteIn(state: LessonProgressState, lessonId: string): boolean {
  return state.favorites.some((entry) => entry.lessonId === lessonId);
}

export function isExerciseFavoriteIn(
  state: LessonProgressState,
  skillId: SkillId,
  exerciseId: string,
): boolean {
  return state.exerciseFavorites.some(
    (entry) => entry.skillId === skillId && entry.exerciseId === exerciseId,
  );
}

// Transitions below return the *same* state object when nothing changes,
// so callers can skip persisting and re-rendering.

/** Mark a lesson as in progress. No-op if already completed or already started. */
export function withLessonStarted(
  state: LessonProgressState,
  lessonId: string,
  now = nowIso(),
): LessonProgressState {
  if (lessonStatusIn(state, lessonId)) return state;
  return { ...state, started: upsertProgress(state.started, lessonId, "started", now) };
}

export function withLessonCompleted(
  state: LessonProgressState,
  lessonId: string,
  now = nowIso(),
): LessonProgressState {
  return {
    ...state,
    started: withoutLesson(state.started, lessonId),
    completed: upsertProgress(state.completed, lessonId, "completed", now),
  };
}

export function withLessonReopened(
  state: LessonProgressState,
  lessonId: string,
  now = nowIso(),
): LessonProgressState {
  return {
    ...state,
    completed: withoutLesson(state.completed, lessonId),
    started: upsertProgress(state.started, lessonId, "started", now),
  };
}

export function withoutLessonProgress(
  state: LessonProgressState,
  lessonId: string,
): LessonProgressState {
  return {
    ...state,
    started: withoutLesson(state.started, lessonId),
    completed: withoutLesson(state.completed, lessonId),
  };
}

export function withLessonFavoriteToggled(
  state: LessonProgressState,
  lessonId: string,
  now = nowIso(),
): LessonProgressState {
  return {
    ...state,
    favorites: isLessonFavoriteIn(state, lessonId)
      ? withoutLesson(state.favorites, lessonId)
      : upsertFavorite(state.favorites, lessonId, now),
  };
}

export function withoutLessonFavorite(
  state: LessonProgressState,
  lessonId: string,
): LessonProgressState {
  if (!isLessonFavoriteIn(state, lessonId)) return state;
  return { ...state, favorites: withoutLesson(state.favorites, lessonId) };
}

export function withExerciseFavoriteToggled(
  state: LessonProgressState,
  skillId: SkillId,
  exerciseId: string,
  now = nowIso(),
): LessonProgressState {
  return {
    ...state,
    exerciseFavorites: isExerciseFavoriteIn(state, skillId, exerciseId)
      ? withoutExercise(state.exerciseFavorites, skillId, exerciseId)
      : upsertExerciseFavorite(state.exerciseFavorites, skillId, exerciseId, now),
  };
}

export function withoutExerciseFavorite(
  state: LessonProgressState,
  skillId: SkillId,
  exerciseId: string,
): LessonProgressState {
  if (!isExerciseFavoriteIn(state, skillId, exerciseId)) return state;
  return {
    ...state,
    exerciseFavorites: withoutExercise(state.exerciseFavorites, skillId, exerciseId),
  };
}

/** Clear one list, or everything when `kind` is omitted. */
export function withCleared(state: LessonProgressState, kind?: LessonListKind): LessonProgressState {
  if (kind === "started") return { ...state, started: [] };
  if (kind === "completed") return { ...state, completed: [] };
  if (kind === "favorites") return { ...state, favorites: [] };
  if (kind === "exerciseFavorites") return { ...state, exerciseFavorites: [] };
  return emptyLessonProgress();
}
