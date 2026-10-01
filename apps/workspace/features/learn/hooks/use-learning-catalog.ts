"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import { learningApi } from "../api/learning-api";
import { mapIntegratedLesson, mapLearningExercise, mapLearningGame } from "../api/map-exercise";
import type { LearningGame, LearningGameSummary } from "../api/types";
import { LESSON_PACKS, type LessonPack } from "../model/curriculum";
import { GAMES_CATALOG, getFallbackGame } from "../model/games";
import {
  getExercise as getLocalExercise,
  getExercisesBySkill,
  LEVELS,
  type SkillExercise,
  type SkillId,
  type SkillLevel,
} from "../model/skill-exercises";

type Cached<T> = { source: "api" | "local"; data: T };

function isCacheMiss(query: { data: unknown; isPending: boolean }) {
  return query.data === undefined && query.isPending;
}

const catalogQuery = {
  staleTime: 0,
  gcTime: CACHE_TIMES.gc,
  refetchOnMount: true as const,
};

async function fetchSkillExercises(skill: SkillId): Promise<Cached<SkillExercise[]>> {
  const result = await learningApi.listExercises({ skill });
  if (result?.data?.length) {
    return { source: "api", data: result.data.map(mapLearningExercise) };
  }
  return { source: "local", data: getExercisesBySkill(skill) };
}

async function fetchSkillExercise(
  skill: SkillId,
  exerciseId: string,
): Promise<Cached<SkillExercise | null>> {
  const remote = await learningApi.getExercise(exerciseId);
  if (remote && remote.skill === skill) {
    return { source: "api", data: mapLearningExercise(remote) };
  }
  return { source: "local", data: getLocalExercise(skill, exerciseId) ?? null };
}

async function fetchSkillsCoverage(): Promise<
  Cached<Record<SkillId, { total: number; byLevel: Record<SkillLevel, number> }>>
> {
  const meta = await learningApi.meta();
  if (meta?.coverage?.length) {
    const data = Object.fromEntries(
      meta.coverage.map((row) => [
        row.skill,
        {
          total: row.levels.reduce((sum, item) => sum + item.exerciseCount, 0),
          byLevel: Object.fromEntries(
            row.levels.map((item) => [item.level, item.exerciseCount]),
          ) as Record<SkillLevel, number>,
        },
      ]),
    ) as Record<SkillId, { total: number; byLevel: Record<SkillLevel, number> }>;
    return { source: "api", data };
  }

  const data = Object.fromEntries(
    (["reading", "listening", "speaking", "writing"] as SkillId[]).map((skill) => {
      const exercises = getExercisesBySkill(skill);
      return [
        skill,
        {
          total: exercises.length,
          byLevel: Object.fromEntries(
            LEVELS.map((level) => [
              level.id,
              exercises.filter((exercise) => exercise.level === level.id).length,
            ]),
          ) as Record<SkillLevel, number>,
        },
      ];
    }),
  ) as Record<SkillId, { total: number; byLevel: Record<SkillLevel, number> }>;
  return { source: "local", data };
}

async function fetchLessonPacks(): Promise<Cached<LessonPack[]>> {
  const [packsResult, integrated] = await Promise.all([
    learningApi.listLessons(),
    learningApi.listIntegratedLessons(),
  ]);
  const fromApi = [
    ...(packsResult?.data ?? []),
    ...(integrated?.data ?? []).map(mapIntegratedLesson),
  ];
  if (fromApi.length) return { source: "api", data: fromApi };
  return { source: "local", data: LESSON_PACKS };
}

function localGameSummaries(): LearningGameSummary[] {
  return GAMES_CATALOG.map((game) => ({
    ...game,
    roundCount: getFallbackGame(game.id)?.rounds.length ?? 0,
  }));
}

async function fetchGames(): Promise<Cached<LearningGameSummary[]>> {
  const local = localGameSummaries();
  const result = await learningApi.listGames();
  if (result?.data?.length) {
    const ids = new Set(result.data.map((game) => game.id));
    return { source: "api", data: [...result.data, ...local.filter((game) => !ids.has(game.id))] };
  }
  return { source: "local", data: local };
}

async function fetchGame(
  slug: string,
  lesson?: string | null,
): Promise<Cached<LearningGame | null>> {
  const remote = await learningApi.getGame(slug, lesson ?? undefined);
  if (remote?.rounds?.length) {
    return { source: "api", data: mapLearningGame(remote) };
  }
  return { source: "local", data: getFallbackGame(slug, lesson) ?? null };
}

export function useSkillExercises(skill: SkillId, level?: SkillLevel | "all") {
  const query = useQuery({
    queryKey: queryKeys.learning.exercises(skill),
    queryFn: () => fetchSkillExercises(skill),
    ...catalogQuery,
  });

  const list = query.data?.data ?? [];

  const exercises = useMemo(() => {
    if (!level || level === "all") return list;
    return list.filter((exercise) => exercise.level === level);
  }, [list, level]);

  const groups = useMemo(
    () =>
      LEVELS.map((levelMeta) => ({
        level: levelMeta,
        exercises: list.filter((exercise) => exercise.level === levelMeta.id),
      })).filter((group) => group.exercises.length > 0),
    [list],
  );

  const filteredGroups = useMemo(() => {
    if (!level || level === "all") return groups;
    return groups.filter((group) => group.level.id === level);
  }, [groups, level]);

  const countsByLevel = useMemo(
    () =>
      Object.fromEntries(
        LEVELS.map((levelMeta) => [
          levelMeta.id,
          list.filter((exercise) => exercise.level === levelMeta.id).length,
        ]),
      ) as Record<SkillLevel, number>,
    [list],
  );

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    exercises,
    groups: filteredGroups,
    total: list.length,
    countsByLevel,
  };
}

export function useSkillExercise(skill: SkillId, exerciseId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.learning.exercise(skill, exerciseId),
    queryFn: () => fetchSkillExercise(skill, exerciseId),
    ...catalogQuery,
    placeholderData: () => {
      const cached = queryClient.getQueryData<Cached<SkillExercise[]>>(
        queryKeys.learning.exercises(skill),
      );
      if (!cached) return undefined;
      const found = cached.data.find((item) => item.id === exerciseId);
      return found ? { source: cached.source, data: found } : undefined;
    },
  });

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    exercise: query.data?.data ?? null,
  };
}

export function useSkillsCoverage() {
  const query = useQuery({
    queryKey: queryKeys.learning.meta,
    queryFn: fetchSkillsCoverage,
    ...catalogQuery,
  });

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    coverage: query.data?.data ?? null,
  };
}

export function useLessonPacks() {
  const query = useQuery({
    queryKey: queryKeys.learning.lessons,
    queryFn: fetchLessonPacks,
    ...catalogQuery,
  });

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    packs: query.data?.data ?? LESSON_PACKS,
  };
}

export function useGames() {
  const query = useQuery({
    queryKey: queryKeys.learning.games,
    queryFn: fetchGames,
    ...catalogQuery,
  });

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    games: query.data?.data ?? [],
  };
}

export function useGame(slug: string, lesson?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.learning.game(slug, lesson),
    queryFn: () => fetchGame(slug, lesson),
    ...catalogQuery,
  });

  return {
    loading: isCacheMiss(query),
    fetching: query.isFetching,
    source: query.data?.source ?? "local",
    game: query.data?.data ?? null,
  };
}
