"use client";

import { useCallback, useEffect, useState } from "react";
import type { SkillId } from "../model/skill-exercises";
import {
  clearLessonProgress,
  markLessonCompleted,
  markLessonStarted,
  removeExerciseFavorite,
  removeLessonFavorite,
  removeLessonProgress,
  reopenLesson,
  toggleExerciseFavorite,
  toggleLessonFavorite,
  useLessonProgressStore,
  type LessonListKind,
} from "../model/lesson-progress";

export function useLessonProgress() {
  // Zustand renders the (empty) initial state during hydration, then the stored progress.
  const progress = useLessonProgressStore((state) => state.progress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const startLesson = useCallback((lessonId: string) => {
    markLessonStarted(lessonId);
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    markLessonCompleted(lessonId);
  }, []);

  const reopen = useCallback((lessonId: string) => {
    reopenLesson(lessonId);
  }, []);

  const remove = useCallback((lessonId: string) => {
    removeLessonProgress(lessonId);
  }, []);

  const toggleFavorite = useCallback((lessonId: string) => {
    toggleLessonFavorite(lessonId);
  }, []);

  const removeFavorite = useCallback((lessonId: string) => {
    removeLessonFavorite(lessonId);
  }, []);

  const toggleExercise = useCallback((skillId: SkillId, exerciseId: string) => {
    toggleExerciseFavorite(skillId, exerciseId);
  }, []);

  const removeExercise = useCallback((skillId: SkillId, exerciseId: string) => {
    removeExerciseFavorite(skillId, exerciseId);
  }, []);

  const clear = useCallback((kind?: LessonListKind) => {
    clearLessonProgress(kind);
  }, []);

  return {
    progress,
    hydrated,
    startLesson,
    completeLesson,
    reopen,
    remove,
    toggleFavorite,
    removeFavorite,
    toggleExerciseFavorite: toggleExercise,
    removeExerciseFavorite: removeExercise,
    clear,
  };
}
