"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { SkillId } from "../model/skill-exercises";
import {
  clearLessonProgress,
  getLessonProgress,
  invalidateLessonProgressCache,
  LESSON_PROGRESS_EVENT,
  LESSON_PROGRESS_KEY,
  markLessonCompleted,
  markLessonStarted,
  removeExerciseFavorite,
  removeLessonFavorite,
  removeLessonProgress,
  reopenLesson,
  toggleExerciseFavorite,
  toggleLessonFavorite,
  type LessonListKind,
  type LessonProgressState,
} from "../model/lesson-progress";

function subscribe(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== LESSON_PROGRESS_KEY) return;
    invalidateLessonProgressCache();
    onStoreChange();
  };
  window.addEventListener(LESSON_PROGRESS_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(LESSON_PROGRESS_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): LessonProgressState {
  return getLessonProgress();
}

function getServerSnapshot(): LessonProgressState {
  return { started: [], completed: [], favorites: [], exerciseFavorites: [] };
}

export function useLessonProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
