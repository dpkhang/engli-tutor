"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lightbulb, Volume2 } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { useSkillExercise } from "../hooks/use-learning-catalog";
import {
  getSkillMeta,
  type ChoiceQuestion,
  type OpenQuestion,
  type SkillId,
  type SkillQuestion,
} from "../model/skill-exercises";

type AnswerState = {
  value: string;
  submitted: boolean;
  correct?: boolean;
};

function scoreOpen(answer: string, question: OpenQuestion): boolean {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return false;
  const keys = question.expectKeywords ?? [];
  if (keys.length === 0) return normalized.length >= 12;
  return keys.every((key) => normalized.includes(key.toLowerCase()));
}

function speakText(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function QuestionCard({
  index,
  question,
  state,
  onChange,
  onSubmit,
}: {
  index: number;
  question: SkillQuestion;
  state: AnswerState;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const showResult = state.submitted;

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Question {index + 1}
      </p>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{question.prompt}</h3>

      {question.kind === "choice" ? (
        <div className="space-y-2">
          {(question as ChoiceQuestion).options.map((option, optionIndex) => {
            const selected = state.value === String(optionIndex);
            const isCorrect = optionIndex === (question as ChoiceQuestion).correctIndex;
            return (
              <button
                key={option}
                type="button"
                disabled={showResult}
                onClick={() => onChange(String(optionIndex))}
                className={cn(
                  "flex w-full rounded-xl border px-3.5 py-3 text-left text-sm transition-colors",
                  selected && !showResult && "border-primary bg-primary/8",
                  showResult && isCorrect && "border-accent bg-accent/10",
                  showResult && selected && !isCorrect && "border-destructive/50 bg-destructive/5",
                  !selected && !showResult && "border-border hover:border-primary/30",
                  showResult && "cursor-default",
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
          value={state.value}
          disabled={showResult}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer in English…"
          className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-70"
        />
      )}

      {!showResult ? (
        <Button
          type="button"
          className="rounded-full"
          disabled={!state.value.trim()}
          onClick={onSubmit}
        >
          Check
        </Button>
      ) : (
        <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Check className="size-4 text-accent" />
            {state.correct ? "On track / correct" : "Review the hint"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.explainVi}</p>
          {question.kind === "open" ? (
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">Sample: </span>
              {(question as OpenQuestion).sampleAnswer}
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function SkillExercisePage({
  skill,
  exerciseId,
}: {
  skill: SkillId;
  exerciseId: string;
}) {
  const { exercise, loading } = useSkillExercise(skill, exerciseId);
  const skillMeta = getSkillMeta(skill);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [showScript, setShowScript] = useState(skill !== "listening");

  const initialAnswers = useMemo(() => {
    if (!exercise) return {};
    return Object.fromEntries(
      exercise.questions.map((q) => [q.id, { value: "", submitted: false } satisfies AnswerState]),
    );
  }, [exercise]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading exercise…</p>;
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

  const stateFor = (id: string): AnswerState =>
    answers[id] ?? initialAnswers[id] ?? { value: "", submitted: false };

  const submittedCount = exercise.questions.filter((q) => stateFor(q.id).submitted).length;
  const correctCount = exercise.questions.filter((q) => stateFor(q.id).correct).length;

  const submitQuestion = (question: SkillQuestion) => {
    const current = stateFor(question.id);
    let correct = false;
    if (question.kind === "choice") {
      correct = Number(current.value) === question.correctIndex;
    } else {
      correct = scoreOpen(current.value, question);
    }
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { ...current, submitted: true, correct },
    }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href={`/skills/${skill}`}>
            <ArrowLeft /> {skillMeta?.labelVi ?? skill}
          </Link>
        </Button>
        <header className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            {exercise.level} · {exercise.duration}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{exercise.title}</h1>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>{exercise.tip}</span>
          </p>
        </header>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{exercise.material.title}</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.material.speakable ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => speakText(exercise.material.body)}
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
          <pre className="whitespace-pre-wrap rounded-xl bg-muted/60 px-4 py-4 font-sans text-sm leading-relaxed text-foreground">
            {exercise.material.body}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap “Listen” first, answer the questions, then open the script to check.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
          <p className="text-sm text-muted-foreground">
            Done {submittedCount}/{exercise.questions.length}
            {submittedCount > 0 ? ` · ${correctCount} correct` : null}
          </p>
        </div>

        {exercise.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            state={stateFor(question.id)}
            onChange={(value) =>
              setAnswers((prev) => ({
                ...prev,
                [question.id]: {
                  ...stateFor(question.id),
                  value,
                  submitted: false,
                  correct: undefined,
                },
              }))
            }
            onSubmit={() => submitQuestion(question)}
          />
        ))}
      </section>

      {submittedCount === exercise.questions.length ? (
        <div className="rounded-2xl border border-primary/20 bg-primary px-6 py-8 text-primary-foreground">
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">Complete</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            You got {correctCount}/{exercise.questions.length} correct
          </h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            Review the explanations, then practice another skill or open AI chat on the same topic.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90">
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
