"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLessonPacks } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import { SearchPageView } from "./search-page.view";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { packs, loading } = useLessonPacks();
  const { progress, hydrated, toggleFavorite } = useLessonProgress();

  const lessons = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];
    return packs.filter((lesson) =>
      normalize(
        [lesson.title, lesson.focus, lesson.tip, lesson.game, lesson.level, ...lesson.skills].join(
          " ",
        ),
      ).includes(term),
    );
  }, [packs, query]);

  const favoriteIds = useMemo(() => {
    if (!hydrated) return new Set<string>();
    return new Set(progress.favorites.map((entry) => entry.lessonId));
  }, [hydrated, progress.favorites]);

  return (
    <SearchPageView
      query={query}
      lessons={lessons}
      loading={loading}
      favoriteIds={favoriteIds}
      onToggleFavorite={toggleFavorite}
    />
  );
}
