"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lightbulb, RotateCcw, Volume2 } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import { getAutoPlayListening } from "@/features/settings/model/preferences";
import { useAiSpeech } from "@/features/speaking-lab/hooks/use-ai-speech";
import { useSkillExercise } from "../hooks/use-learning-catalog";
import {
  getSkillMeta,
  type ChoiceQuestion,
  type OpenQuestion,
  type SkillId,
  type SkillQuestion,
} from "../model/skill-exercises";

type AnswerDraft = {
  value: string;
  correct?: boolean;
};

function scoreOpen(answer: string, question: OpenQuestion): boolean {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return false;
  const keys = question.expectKeywords ?? [];
  if (keys.length === 0) return normalized.length >= 12;
  return keys.every((key) => normalized.includes(key.toLowerCase()));
}

function QuestionCard({
  index,
  question,
  value,
  correct,
  locked,
  onChange,
}: {
  index: number;
  question: SkillQuestion;
  value: string;
  correct?: boolean;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <article className="min-w-0 space-y-4 rounded-[1.35rem] border border-border/70 bg-card p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Question {index + 1}
        </p>
        {locked ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              correct ? "bg-accent/15 text-accent" : "bg-destructive/10 text-destructive",
            )}
          >
            {correct ? "Correct" : "Review"}
          </span>
        ) : null}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{question.prompt}</h3>

      {question.kind === "choice" ? (
        <div className="space-y-2">
          {(question as ChoiceQuestion).options.map((option, optionIndex) => {
            const selected = value === String(optionIndex);
            const isCorrect = optionIndex === (question as ChoiceQuestion).correctIndex;
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => onChange(String(optionIndex))}
                className={cn(
                  "flex w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                  selected && !locked && "border-primary bg-primary/8 ring-2 ring-primary/10",
                  locked && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
                  locked && selected && !isCorrect && "border-destructive/50 bg-destructive/5",
                  !selected &&
                    !locked &&
                    "border-border hover:border-primary/50 hover:bg-primary/5",
                  locked && "cursor-default",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          rows={4}
          value={value}
          disabled={locked}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer in English…"
          className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-70"
        />
      )}

      {locked ? (
        <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Check className="size-4 text-accent" />
            {correct ? "On track / correct" : "Review the hint"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.explainVi}</p>
          {question.kind === "open" ? (
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">Sample: </span>
              {(question as OpenQuestion).sampleAnswer}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function SkillExercisePage({ skill, exerciseId }: { skill: SkillId; exerciseId: string }) {
  const { exercise, loading } = useSkillExercise(skill, exerciseId);
  const skillMeta = getSkillMeta(skill);
  const { speak, stop } = useAiSpeech();
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showScript, setShowScript] = useState(skill !== "listening");

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

  if (loading) {
    return (
      <DataLoadingState
        title="Preparing your exercise"
        description="Loading the questions, tips, and learning materials."
        cards={3}
      />
    );
  }

  if (!exercise) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Exercise not found.</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/skills/${skill}`}>Go back</Link>
        </Button>
      </div>
    );
  }

  const valueFor = (id: string) => answers[id]?.value ?? emptyAnswers[id]?.value ?? "";
  const answeredCount = exercise.questions.filter((q) => valueFor(q.id).trim()).length;
  const allAnswered = answeredCount === exercise.questions.length;
  const correctCount = submitted
    ? exercise.questions.filter((q) => answers[q.id]?.correct).length
    : 0;

  const setAnswerValue = (id: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [id]: { value },
    }));
  };

  const submitAll = () => {
    if (!allAnswered || submitted) return;
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
  };

  const tryAgain = () => {
    setAnswers(emptyAnswers);
    setSubmitted(false);
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-8 overflow-x-clip">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href={`/skills/${skill}`}>
            <ArrowLeft /> {skillMeta?.labelVi ?? skill}
          </Link>
        </Button>
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground sm:px-9 sm:py-10">
          <div
            aria-hidden
            className="absolute -right-10 -top-16 size-52 rounded-full border-[28px] border-white/[0.07]"
          />
          <div className="relative">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
              {exercise.level} · {exercise.duration}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {exercise.title}
            </h1>
            <p className="mt-4 flex max-w-2xl gap-2 text-sm text-white/70">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <span>{exercise.tip}</span>
            </p>
          </div>
        </header>
      </div>

      <section className="min-w-0 space-y-4 rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-sky-500/8 via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{exercise.material.title}</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.material.speakable ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void speak(exercise.material.body)}
              >
                <Volume2 className="size-4" />
                Listen
              </Button>
            ) : null}
            {skill === "listening" ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowScript((value) => !value)}
              >
                {showScript ? "Hide script" : "Show script"}
              </Button>
            ) : null}
          </div>
        </div>

        {showScript ? (
          <pre className="whitespace-pre-wrap rounded-xl border border-border/50 bg-background/70 px-4 py-4 font-sans text-sm leading-relaxed text-foreground">
            {exercise.material.body}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap “Listen” first, answer the questions, then open the script to check.
          </p>
        )}
      </section>

      <section className="min-w-0 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">Your turn</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Take it one question at a time
            </h2>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {submitted
              ? `${correctCount}/${exercise.questions.length} correct`
              : `Answered ${answeredCount}/${exercise.questions.length}`}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{
              width: `${exercise.questions.length ? (answeredCount / exercise.questions.length) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Choose or type every answer. You can review everything before submitting.
        </p>

        {exercise.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            value={valueFor(question.id)}
            correct={answers[question.id]?.correct}
            locked={submitted}
            onChange={(value) => setAnswerValue(question.id, value)}
          />
        ))}
      </section>

      {!submitted ? (
        <>
          <div className="h-24" aria-hidden />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20">
            {/* Full-bleed background (edge to edge) */}
            <div className="w-full border-t border-border bg-background/95 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="pointer-events-auto mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {allAnswered
                    ? "All questions answered — ready to submit."
                    : `Answer ${exercise.questions.length - answeredCount} more question${
                        exercise.questions.length - answeredCount === 1 ? "" : "s"
                      } to submit.`}
                </p>
                <Button
                  type="button"
                  className="h-11 w-full shrink-0 rounded-full px-6 sm:w-auto"
                  disabled={!allAnswered}
                  onClick={submitAll}
                >
                  Submit all answers
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {submitted ? (
        <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
            Nice work!
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            You got {correctCount}/{exercise.questions.length} correct
          </h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            Review the explanations above, then try again or practice another skill.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
              onClick={tryAgain}
            >
              <RotateCcw className="size-4" />
              Try again
            </Button>
            <Button
              asChild
              className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            >
              <Link href={`/skills/${skill}`}>More in this skill</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/practice">AI Chat</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
