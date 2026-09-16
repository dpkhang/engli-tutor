"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAutoPlayListening } from "@/features/settings";
import { useAiSpeech } from "@/features/speaking-lab/hooks/use-ai-speech";
import { useSkillExercise } from "../../hooks/use-learning-catalog";
import { useLessonProgress } from "../../hooks/use-lesson-progress";
import { getSkillMeta, type OpenQuestion, type SkillId } from "../../model/skill-exercises";
import {
  SkillExercisePageView,
  type AnswerDraft,
} from "./skill-exercise-page.view";

function scoreOpen(answer: string, question: OpenQuestion): boolean {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return false;
  const keys = question.expectKeywords ?? [];
  if (keys.length === 0) return normalized.length >= 12;
  return keys.every((key) => normalized.includes(key.toLowerCase()));
}

export function SkillExercisePage({ skill, exerciseId }: { skill: SkillId; exerciseId: string }) {
  const { exercise, loading } = useSkillExercise(skill, exerciseId);
  const skillMeta = getSkillMeta(skill);
  const { progress, hydrated, toggleExerciseFavorite } = useLessonProgress();
  const { speak, stop } = useAiSpeech();
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showScript, setShowScript] = useState(skill !== "listening");

  const favorited =
    hydrated &&
    progress.exerciseFavorites.some(
      (entry) => entry.skillId === skill && entry.exerciseId === exerciseId,
    );

  const onToggleFavorite = useCallback(() => {
    toggleExerciseFavorite(skill, exerciseId);
  }, [exerciseId, skill, toggleExerciseFavorite]);

  useEffect(() => {
    if (loading || !exercise?.material.speakable || !getAutoPlayListening()) return;
    void speak(exercise.material.body);
    return () => stop();
  }, [exercise?.id, exercise?.material.speakable, exercise?.material.body, loading, speak, stop]);

  const emptyAnswers = useMemo(() => {
    if (!exercise) return {};
    return Object.fromEntries(
      exercise.questions.map((q) => [q.id, { value: "" } satisfies AnswerDraft]),
    );
  }, [exercise]);

  const valueFor = useCallback(
    (id: string) => answers[id]?.value ?? emptyAnswers[id]?.value ?? "",
    [answers, emptyAnswers],
  );

  const answeredCount = exercise
    ? exercise.questions.filter((q) => valueFor(q.id).trim()).length
    : 0;
  const allAnswered = Boolean(exercise) && answeredCount === exercise?.questions.length;
  const correctCount = submitted
    ? (exercise?.questions.filter((q) => answers[q.id]?.correct).length ?? 0)
    : 0;

  const onAnswerChange = useCallback(
    (id: string, value: string) => {
      if (submitted) return;
      setAnswers((prev) => ({
        ...prev,
        [id]: { value },
      }));
    },
    [submitted],
  );

  const onSubmitAll = useCallback(() => {
    if (!exercise || !allAnswered || submitted) return;
    const next: Record<string, AnswerDraft> = {};
    for (const question of exercise.questions) {
      const value = valueFor(question.id);
      const correct =
        question.kind === "choice"
          ? Number(value) === question.correctIndex
          : scoreOpen(value, question);
      next[question.id] = { value, correct };
    }
    setAnswers(next);
    setSubmitted(true);
  }, [allAnswered, exercise, submitted, valueFor]);

  const onTryAgain = useCallback(() => {
    setAnswers(emptyAnswers);
    setSubmitted(false);
  }, [emptyAnswers]);

  const onSpeak = useCallback(() => {
    if (!exercise) return;
    void speak(exercise.material.body);
  }, [exercise, speak]);

  const onToggleScript = useCallback(() => {
    setShowScript((value) => !value);
  }, []);

  const mergedAnswers = useMemo(
    () => ({ ...emptyAnswers, ...answers }),
    [answers, emptyAnswers],
  );

  return (
    <SkillExercisePageView
      skill={skill}
      skillMeta={skillMeta}
      exercise={exercise}
      loading={loading}
      answers={mergedAnswers}
      submitted={submitted}
      showScript={showScript}
      answeredCount={answeredCount}
      allAnswered={allAnswered}
      correctCount={correctCount}
      favorited={favorited}
      onToggleFavorite={onToggleFavorite}
      onAnswerChange={onAnswerChange}
      onSubmitAll={onSubmitAll}
      onTryAgain={onTryAgain}
      onSpeak={onSpeak}
      onToggleScript={onToggleScript}
    />
  );
}
