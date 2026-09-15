"use client";

import { useCallback, useMemo, useState } from "react";
import { useLessonPacks } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import { getExercise, getSkillMeta } from "../../model/skill-exercises";
import { LessonProgressPageView } from "./lesson-progress-page.view";

export function LessonProgressPage() {
  const { packs, loading } = useLessonPacks();
  const {
    progress,
    hydrated,
    startLesson,
    completeLesson,
    reopen,
    remove,
    toggleFavorite,
    removeFavorite,
    removeExerciseFavorite,
    clear,
  } = useLessonProgress();
  const [addOpen, setAddOpen] = useState(false);

  const packById = useMemo(
    () => new Map(packs.map((lesson) => [lesson.id, lesson])),
    [packs],
  );

  const exerciseFavorites = useMemo(
    () =>
      progress.exerciseFavorites.map((entry) => ({
        entry,
        exercise: getExercise(entry.skillId, entry.exerciseId),
        skill: getSkillMeta(entry.skillId),
      })),
    [progress.exerciseFavorites],
  );

  const favorites = useMemo(
    () =>
      progress.favorites.map((entry) => ({
        entry,
        lesson: packById.get(entry.lessonId),
      })),
    [packById, progress.favorites],
  );

  const started = useMemo(
    () =>
      progress.started.map((entry) => ({
        entry,
        lesson: packById.get(entry.lessonId),
      })),
    [packById, progress.started],
  );

  const completed = useMemo(
    () =>
      progress.completed.map((entry) => ({
        entry,
        lesson: packById.get(entry.lessonId),
      })),
    [packById, progress.completed],
  );

  const favoriteIds = useMemo(
    () => new Set(progress.favorites.map((entry) => entry.lessonId)),
    [progress.favorites],
  );

  const trackedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of progress.started) ids.add(entry.lessonId);
    for (const entry of progress.completed) ids.add(entry.lessonId);
    return ids;
  }, [progress.completed, progress.started]);

  const available = useMemo(
    () => packs.filter((lesson) => !trackedIds.has(lesson.id)),
    [packs, trackedIds],
  );

  const onToggleAdd = useCallback(() => {
    setAddOpen((open) => !open);
  }, []);

  const onStartLesson = useCallback(
    (lessonId: string) => {
      startLesson(lessonId);
      setAddOpen(false);
    },
    [startLesson],
  );

  const onClearFavorites = useCallback(() => {
    clear("favorites");
  }, [clear]);

  const onClearExerciseFavorites = useCallback(() => {
    clear("exerciseFavorites");
  }, [clear]);

  const onClearStarted = useCallback(() => {
    clear("started");
  }, [clear]);

  const onClearCompleted = useCallback(() => {
    clear("completed");
  }, [clear]);

  return (
    <LessonProgressPageView
      exerciseFavorites={exerciseFavorites}
      favorites={favorites}
      started={started}
      completed={completed}
      available={available}
      loading={loading}
      hydrated={hydrated}
      addOpen={addOpen}
      favoriteIds={favoriteIds}
      onToggleAdd={onToggleAdd}
      onStartLesson={onStartLesson}
      onCompleteLesson={completeLesson}
      onReopenLesson={reopen}
      onRemoveLesson={remove}
      onRemoveFavorite={removeFavorite}
      onToggleFavorite={toggleFavorite}
      onRemoveExerciseFavorite={removeExerciseFavorite}
      onClearFavorites={onClearFavorites}
      onClearExerciseFavorites={onClearExerciseFavorites}
      onClearStarted={onClearStarted}
      onClearCompleted={onClearCompleted}
    />
  );
}
