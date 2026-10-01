"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLessonPacks } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import type { LessonProgressStatus } from "../../model/lesson-progress";
import {
  LessonsPageView,
  SKILL_FILTERS,
  type LessonSkillFilter,
} from "./lessons-page.view";

export function LessonsPage() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get("skill");
  const query = searchParams.get("q")?.trim() ?? "";
  const activeSkill: LessonSkillFilter = SKILL_FILTERS.includes(skillParam as LessonSkillFilter)
    ? (skillParam as LessonSkillFilter)
    : "All";
  const { packs, loading, fetching, source } = useLessonPacks();
  const { progress, hydrated, toggleFavorite } = useLessonProgress();

  const lessons = useMemo(() => {
    const term = query.toLowerCase();
    return packs.filter((lesson) => {
      const matchesSkill =
        activeSkill === "All" ||
        lesson.skills.includes(activeSkill as "Listening" | "Speaking" | "Reading" | "Writing");
      const matchesQuery =
        !term ||
        [lesson.title, lesson.focus, lesson.tip, lesson.level, ...lesson.skills]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesSkill && matchesQuery;
    });
  }, [activeSkill, packs, query]);

  const statusById = useMemo(() => {
    if (!hydrated) return {} as Record<string, LessonProgressStatus>;
    const map: Record<string, LessonProgressStatus> = {};
    for (const entry of progress.started) map[entry.lessonId] = "started";
    for (const entry of progress.completed) map[entry.lessonId] = "completed";
    return map;
  }, [hydrated, progress.completed, progress.started]);

  const favoriteIds = useMemo(() => {
    if (!hydrated) return new Set<string>();
    return new Set(progress.favorites.map((entry) => entry.lessonId));
  }, [hydrated, progress.favorites]);

  return (
    <LessonsPageView
      query={query}
      activeSkill={activeSkill}
      lessons={lessons}
      loading={loading || (Boolean(query) && fetching)}
      source={source}
      statusById={statusById}
      favoriteIds={favoriteIds}
      onToggleFavorite={toggleFavorite}
    />
  );
}
