"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import { planBadgeLabel } from "@/features/payments/model/plans";
import { useLessonPacks } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import type { LessonPack } from "../../model/curriculum";
import { MINI_GAMES } from "../../model/curriculum";
import {
  getExercise,
  getExercisesBySkill,
  getSkillMeta,
  skillExerciseHref,
  type SkillId,
} from "../../model/skill-exercises";
import {
  LearnHomeView,
  type HomeContinueItem,
  type HomeDailyChallenge,
  type HomeDrillItem,
  type HomeFinishedItem,
  type HomeSavedItem,
  type HomeSnapshot,
} from "./learn-home.view";

const DRILL_SKILLS: SkillId[] = ["listening", "speaking", "reading", "writing"];

function byUpdatedAtDesc(a: { updatedAt: string }, b: { updatedAt: string }) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function LearnHome() {
  const { data: session } = useSession();
  const { packs } = useLessonPacks();
  const { progress, hydrated } = useLessonProgress();
  const billing = useBillingMe(Boolean(session?.user));

  const firstName = useMemo(
    () =>
      session?.user?.name?.trim()?.split(/\s+/)[0] || session?.user?.email?.split("@")[0] || "there",
    [session?.user?.name, session?.user?.email],
  );

  const packById = useMemo(() => new Map(packs.map((lesson) => [lesson.id, lesson])), [packs]);

  const trackedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of progress.started) ids.add(entry.lessonId);
    for (const entry of progress.completed) ids.add(entry.lessonId);
    return ids;
  }, [progress.completed, progress.started]);

  const continueItems = useMemo((): HomeContinueItem[] => {
    return [...progress.started]
      .sort(byUpdatedAtDesc)
      .slice(0, 4)
      .flatMap((entry) => {
        const lesson = packById.get(entry.lessonId);
        if (!lesson) return [];
        return [
          {
            id: lesson.id,
            title: lesson.title,
            level: lesson.level,
            duration: lesson.duration,
            focus: lesson.focus,
            href: `/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`,
            updatedAt: entry.updatedAt,
          },
        ];
      });
  }, [packById, progress.started]);

  const savedItems = useMemo((): HomeSavedItem[] => {
    const lessons: HomeSavedItem[] = [...progress.favorites]
      .sort(byUpdatedAtDesc)
      .flatMap((entry) => {
        const lesson = packById.get(entry.lessonId);
        if (!lesson) return [];
        return [
          {
            id: `lesson-${lesson.id}`,
            kind: "lesson" as const,
            title: lesson.title,
            meta: `${lesson.level} · ${lesson.duration}`,
            href: `/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`,
            updatedAt: entry.updatedAt,
          },
        ];
      });

    const exercises: HomeSavedItem[] = [...progress.exerciseFavorites]
      .sort(byUpdatedAtDesc)
      .flatMap((entry) => {
        const exercise = getExercise(entry.skillId, entry.exerciseId);
        const skill = getSkillMeta(entry.skillId);
        if (!exercise || !skill) return [];
        return [
          {
            id: `exercise-${entry.skillId}-${entry.exerciseId}`,
            kind: "exercise" as const,
            title: exercise.title,
            meta: `${skill.labelEn} · ${exercise.level}`,
            href: skillExerciseHref(entry.skillId, entry.exerciseId, exercise.level),
            updatedAt: entry.updatedAt,
          },
        ];
      });

    return [...lessons, ...exercises].sort(byUpdatedAtDesc).slice(0, 6);
  }, [packById, progress.exerciseFavorites, progress.favorites]);

  const finishedItems = useMemo((): HomeFinishedItem[] => {
    return [...progress.completed]
      .sort(byUpdatedAtDesc)
      .slice(0, 3)
      .flatMap((entry) => {
        const lesson = packById.get(entry.lessonId);
        if (!lesson) return [];
        return [
          {
            id: lesson.id,
            title: lesson.title,
            level: lesson.level,
            href: `/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`,
            updatedAt: entry.updatedAt,
          },
        ];
      });
  }, [packById, progress.completed]);

  const discoverLessons = useMemo((): LessonPack[] => {
    const fresh = packs.filter((lesson) => !trackedIds.has(lesson.id));
    return (fresh.length >= 4 ? fresh : packs).slice(0, 4);
  }, [packs, trackedIds]);

  const drillItems = useMemo((): HomeDrillItem[] => {
    return DRILL_SKILLS.flatMap((skillId) => {
      const exercise = getExercisesBySkill(skillId)[0];
      const skill = getSkillMeta(skillId);
      if (!exercise || !skill) return [];
      return [
        {
          id: `${skillId}-${exercise.id}`,
          skillLabel: skill.labelEn,
          title: exercise.title,
          level: exercise.level,
          duration: exercise.duration,
          href: skillExerciseHref(skillId, exercise.id, exercise.level),
        },
      ];
    });
  }, []);

  const snapshot = useMemo((): HomeSnapshot => {
    return {
      plan: planBadgeLabel(billing.data),
      planLoading: billing.isLoading,
      started: progress.started.length,
      completed: progress.completed.length,
      saved: progress.favorites.length + progress.exerciseFavorites.length,
    };
  }, [
    billing.data,
    billing.isLoading,
    progress.completed.length,
    progress.exerciseFavorites.length,
    progress.favorites.length,
    progress.started.length,
  ]);

  const dailyChallenge = useMemo((): HomeDailyChallenge => {
    const game = MINI_GAMES[dayOfYear() % MINI_GAMES.length] ?? MINI_GAMES[0];
    return {
      title: game.title,
      body: game.body,
      href: game.href,
    };
  }, []);

  return (
    <LearnHomeView
      firstName={firstName}
      continueItems={hydrated ? continueItems : []}
      savedItems={hydrated ? savedItems : []}
      finishedItems={hydrated ? finishedItems : []}
      discoverLessons={discoverLessons}
      drillItems={drillItems}
      snapshot={hydrated ? snapshot : { ...snapshot, started: 0, completed: 0, saved: 0 }}
      dailyChallenge={dailyChallenge}
    />
  );
}
