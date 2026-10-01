"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import { useSkillExercises } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import { getSkillMeta, isSkillLevel, type SkillId, type SkillLevel } from "../../model/skill-exercises";
import { SkillListPageView } from "./skill-list-page.view";

export function SkillListPage({ skill }: { skill: SkillId }) {
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
    staleTime: CACHE_TIMES.session,
  });
  const preferredLevel = profileQuery.data?.targetLevel ?? null;
  const { progress, hydrated, toggleExerciseFavorite } = useLessonProgress();

  const activeLevel: SkillLevel | "all" = useMemo(() => {
    if (levelParam === "all") return "all";
    if (levelParam && isSkillLevel(levelParam)) return levelParam;
    return preferredLevel ?? "all";
  }, [levelParam, preferredLevel]);

  const meta = getSkillMeta(skill);
  const { loading, groups, total, countsByLevel, source } = useSkillExercises(skill, activeLevel);

  const favoriteExerciseIds = useMemo(() => {
    if (!hydrated) return new Set<string>();
    return new Set(
      progress.exerciseFavorites
        .filter((entry) => entry.skillId === skill)
        .map((entry) => entry.exerciseId),
    );
  }, [hydrated, progress.exerciseFavorites, skill]);

  const onToggleFavorite = useCallback(
    (exerciseId: string) => {
      toggleExerciseFavorite(skill, exerciseId);
    },
    [skill, toggleExerciseFavorite],
  );

  if (!meta) return null;

  return (
    <SkillListPageView
      skill={skill}
      meta={meta}
      activeLevel={activeLevel}
      loading={loading}
      groups={groups}
      total={total}
      countsByLevel={countsByLevel}
      source={source}
      favoriteExerciseIds={favoriteExerciseIds}
      onToggleFavorite={onToggleFavorite}
    />
  );
}
