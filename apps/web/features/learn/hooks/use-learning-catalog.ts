"use client";

import { useEffect, useMemo, useState } from "react";
import { learningApi } from "../api/learning-api";
import { mapIntegratedLesson, mapLearningExercise } from "../api/map-exercise";
import { LESSON_PACKS, type LessonPack } from "../model/curriculum";
import {
  getExercise as getLocalExercise,
  getExercisesBySkill,
  getExercisesGroupedByLevel,
  LEVELS,
  type SkillExercise,
  type SkillId,
  type SkillLevel,
} from "../model/skill-exercises";

type LoadState = "loading" | "api" | "local";

export function useSkillExercises(skill: SkillId, level?: SkillLevel | "all") {
  const [remote, setRemote] = useState<SkillExercise[] | null>(null);
  const [source, setSource] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    setSource("loading");

    void (async () => {
      const result = await learningApi.listExercises({ skill });
      if (cancelled) return;
      if (result?.data?.length) {
        setRemote(result.data.map(mapLearningExercise));
        setSource("api");
        return;
      }
      setRemote(null);
      setSource("local");
    })();

    return () => {
      cancelled = true;
    };
  }, [skill]);

  const exercises = useMemo(() => {
    const list = remote ?? getExercisesBySkill(skill);
    if (!level || level === "all") return list;
    return list.filter((exercise) => exercise.level === level);
  }, [remote, skill, level]);

  const groups = useMemo(() => {
    if (remote) {
      return LEVELS.map((levelMeta) => ({
        level: levelMeta,
        exercises: remote.filter((exercise) => exercise.level === levelMeta.id),
      })).filter((group) => group.exercises.length > 0);
    }
    return getExercisesGroupedByLevel(skill);
  }, [remote, skill]);

  const filteredGroups = useMemo(() => {
    if (!level || level === "all") return groups;
    return groups.filter((group) => group.level.id === level);
  }, [groups, level]);

  const countsByLevel = useMemo(() => {
    const list = remote ?? getExercisesBySkill(skill);
    return Object.fromEntries(
      LEVELS.map((levelMeta) => [
        levelMeta.id,
        list.filter((exercise) => exercise.level === levelMeta.id).length,
      ]),
    ) as Record<SkillLevel, number>;
  }, [remote, skill]);

  return {
    loading: source === "loading",
    source: source === "loading" ? "local" : source,
    exercises,
    groups: filteredGroups,
    total: (remote ?? getExercisesBySkill(skill)).length,
    countsByLevel,
  };
}

export function useSkillExercise(skill: SkillId, exerciseId: string) {
  const [exercise, setExercise] = useState<SkillExercise | null | undefined>(undefined);
  const [source, setSource] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    setSource("loading");
    setExercise(undefined);

    void (async () => {
      const remote = await learningApi.getExercise(exerciseId);
      if (cancelled) return;

      if (remote && remote.skill === skill) {
        setExercise(mapLearningExercise(remote));
        setSource("api");
        return;
      }

      const local = getLocalExercise(skill, exerciseId) ?? null;
      setExercise(local);
      setSource("local");
    })();

    return () => {
      cancelled = true;
    };
  }, [skill, exerciseId]);

  return {
    loading: exercise === undefined,
    source: source === "loading" ? "local" : source,
    exercise: exercise ?? null,
  };
}

export function useSkillsCoverage() {
  const [coverage, setCoverage] = useState<Record<
    SkillId,
    { total: number; byLevel: Record<SkillLevel, number> }
  > | null>(null);
  const [source, setSource] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const meta = await learningApi.meta();
      if (cancelled) return;

      if (meta?.coverage?.length) {
        const next = Object.fromEntries(
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
        setCoverage(next);
        setSource("api");
        return;
      }

      const local = Object.fromEntries(
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
      setCoverage(local);
      setSource("local");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading: source === "loading" || !coverage,
    source: source === "loading" ? "local" : source,
    coverage,
  };
}

export function useLessonPacks() {
  const [packs, setPacks] = useState<LessonPack[]>(LESSON_PACKS);
  const [source, setSource] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await learningApi.listIntegratedLessons();
      if (cancelled) return;

      if (result?.data?.length) {
        setPacks(result.data.map(mapIntegratedLesson));
        setSource("api");
        return;
      }

      setPacks(LESSON_PACKS);
      setSource("local");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading: source === "loading",
    source: source === "loading" ? "local" : source,
    packs,
  };
}
