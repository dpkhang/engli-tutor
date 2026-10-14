import assert from "node:assert/strict";
import { test } from "node:test";
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
  type LessonProgressState,
} from "./lesson-progress.logic";

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-01-02T00:00:00.000Z";
const T3 = "2026-01-03T00:00:00.000Z";

function state(partial: Partial<LessonProgressState> = {}): LessonProgressState {
  return { ...emptyLessonProgress(), ...partial };
}

test("parseLessonProgress returns empty state for null, junk and invalid JSON", () => {
  assert.deepEqual(parseLessonProgress(null), emptyLessonProgress());
  assert.deepEqual(parseLessonProgress("not json"), emptyLessonProgress());
  assert.deepEqual(parseLessonProgress("{}"), emptyLessonProgress());
});

test("parseLessonProgress drops malformed entries and keeps valid ones", () => {
  const raw = JSON.stringify({
    started: [
      { lessonId: "a", status: "started", updatedAt: T1 },
      { lessonId: "b", status: "bogus", updatedAt: T1 },
      { lessonId: 3, status: "started", updatedAt: T1 },
    ],
    completed: [{ lessonId: "c", status: "completed", updatedAt: T1 }],
    favorites: [{ lessonId: "d", updatedAt: T1 }, { lessonId: "e" }],
    exerciseFavorites: [
      { skillId: "reading", exerciseId: "r1", updatedAt: T1 },
      { skillId: "cooking", exerciseId: "x", updatedAt: T1 },
    ],
  });
  const parsed = parseLessonProgress(raw);
  assert.deepEqual(parsed.started.map((e) => e.lessonId), ["a"]);
  assert.deepEqual(parsed.completed.map((e) => e.lessonId), ["c"]);
  assert.deepEqual(parsed.favorites.map((e) => e.lessonId), ["d"]);
  assert.deepEqual(parsed.exerciseFavorites.map((e) => e.exerciseId), ["r1"]);
});

test("withLessonStarted adds a started entry", () => {
  const next = withLessonStarted(state(), "l1", T1);
  assert.equal(lessonStatusIn(next, "l1"), "started");
  assert.deepEqual(next.started, [{ lessonId: "l1", status: "started", updatedAt: T1 }]);
});

test("withLessonStarted is a no-op (same reference) when already started or completed", () => {
  const started = withLessonStarted(state(), "l1", T1);
  assert.equal(withLessonStarted(started, "l1", T2), started);
  const completed = withLessonCompleted(state(), "l2", T1);
  assert.equal(withLessonStarted(completed, "l2", T2), completed);
});

test("withLessonCompleted moves a lesson from started to completed", () => {
  const started = withLessonStarted(state(), "l1", T1);
  const done = withLessonCompleted(started, "l1", T2);
  assert.equal(lessonStatusIn(done, "l1"), "completed");
  assert.equal(done.started.length, 0);
  assert.equal(done.completed[0]?.updatedAt, T2);
});

test("withLessonReopened moves a lesson from completed back to started", () => {
  const done = withLessonCompleted(state(), "l1", T1);
  const reopened = withLessonReopened(done, "l1", T2);
  assert.equal(lessonStatusIn(reopened, "l1"), "started");
  assert.equal(reopened.completed.length, 0);
});

test("withoutLessonProgress clears both started and completed for a lesson", () => {
  const s = withLessonCompleted(withLessonStarted(state(), "a", T1), "b", T1);
  const next = withoutLessonProgress(s, "a");
  assert.equal(lessonStatusIn(next, "a"), null);
  assert.equal(lessonStatusIn(next, "b"), "completed");
});

test("lesson favorite toggles on and off", () => {
  const on = withLessonFavoriteToggled(state(), "l1", T1);
  assert.equal(isLessonFavoriteIn(on, "l1"), true);
  const off = withLessonFavoriteToggled(on, "l1", T2);
  assert.equal(isLessonFavoriteIn(off, "l1"), false);
});

test("withoutLessonFavorite is a no-op when the lesson is not a favorite", () => {
  const s = state();
  assert.equal(withoutLessonFavorite(s, "nope"), s);
  const on = withLessonFavoriteToggled(s, "l1", T1);
  assert.equal(isLessonFavoriteIn(withoutLessonFavorite(on, "l1"), "l1"), false);
});

test("exercise favorite toggles per skill+exercise pair", () => {
  const on = withExerciseFavoriteToggled(state(), "reading", "e1", T1);
  assert.equal(isExerciseFavoriteIn(on, "reading", "e1"), true);
  assert.equal(isExerciseFavoriteIn(on, "listening", "e1"), false);
  const off = withExerciseFavoriteToggled(on, "reading", "e1", T2);
  assert.equal(isExerciseFavoriteIn(off, "reading", "e1"), false);
});

test("withoutExerciseFavorite is a no-op when absent", () => {
  const s = state();
  assert.equal(withoutExerciseFavorite(s, "reading", "e1"), s);
});

test("withCleared clears one list or everything", () => {
  const full = state({
    started: [{ lessonId: "a", status: "started", updatedAt: T1 }],
    completed: [{ lessonId: "b", status: "completed", updatedAt: T1 }],
    favorites: [{ lessonId: "c", updatedAt: T1 }],
    exerciseFavorites: [{ skillId: "reading", exerciseId: "e", updatedAt: T1 }],
  });
  assert.equal(withCleared(full, "started").started.length, 0);
  assert.equal(withCleared(full, "started").completed.length, 1);
  assert.equal(withCleared(full, "completed").completed.length, 0);
  assert.equal(withCleared(full, "favorites").favorites.length, 0);
  assert.equal(withCleared(full, "exerciseFavorites").exerciseFavorites.length, 0);
  assert.deepEqual(withCleared(full), emptyLessonProgress());
});

test("transitions do not mutate the previous state", () => {
  const before = withLessonStarted(state(), "l1", T1);
  const snapshot = JSON.stringify(before);
  withLessonCompleted(before, "l1", T2);
  withLessonFavoriteToggled(before, "l1", T2);
  withCleared(before);
  assert.equal(JSON.stringify(before), snapshot);
});

test("mergeLessonProgress: newest updatedAt wins per lesson across local and remote", () => {
  const local = state({
    started: [{ lessonId: "a", status: "started", updatedAt: T3 }],
    completed: [{ lessonId: "b", status: "completed", updatedAt: T1 }],
  });
  const remote = state({
    completed: [{ lessonId: "a", status: "completed", updatedAt: T2 }],
    started: [{ lessonId: "b", status: "started", updatedAt: T2 }],
  });
  const merged = mergeLessonProgress(local, remote);
  assert.equal(lessonStatusIn(merged, "a"), "started"); // local T3 beats remote T2
  assert.equal(lessonStatusIn(merged, "b"), "started"); // remote T2 beats local T1
  assert.equal(merged.started.length + merged.completed.length, 2);
});

test("mergeLessonProgress unions favorites and sorts newest first", () => {
  const local = state({
    favorites: [{ lessonId: "a", updatedAt: T1 }],
    exerciseFavorites: [{ skillId: "reading", exerciseId: "e1", updatedAt: T1 }],
  });
  const remote = state({
    favorites: [
      { lessonId: "a", updatedAt: T2 },
      { lessonId: "b", updatedAt: T3 },
    ],
    exerciseFavorites: [{ skillId: "writing", exerciseId: "e1", updatedAt: T2 }],
  });
  const merged = mergeLessonProgress(local, remote);
  assert.deepEqual(merged.favorites.map((e) => [e.lessonId, e.updatedAt]), [
    ["b", T3],
    ["a", T2],
  ]);
  assert.equal(merged.exerciseFavorites.length, 2);
});

test("mergeLessonProgress with empty sides returns the other side's data", () => {
  const only = state({ favorites: [{ lessonId: "a", updatedAt: T1 }] });
  assert.deepEqual(mergeLessonProgress(only, emptyLessonProgress()).favorites, only.favorites);
  assert.deepEqual(mergeLessonProgress(emptyLessonProgress(), only).favorites, only.favorites);
});
