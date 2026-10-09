"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n/localized-link";
import { ArrowLeft, BookOpen, Check, Heart, House, Lightbulb, RotateCcw, Volume2 } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { DataLoadingState, NotFoundPage } from "@/features/layout";
import { ClickableTranslateText } from "@/features/translate";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LocalizedLink } from "@/features/i18n/localized-link";
import type {
  ChoiceQuestion,
  OpenQuestion,
  SkillExercise,
  SkillId,
  SkillMeta,
  SkillQuestion,
} from "../../model/skill-exercises";

export type AnswerDraft = {
  value: string;
  correct?: boolean;
};

function QuestionCard({
  index,
  question,
  value,
  correct,
  locked,
  onChange,
  t,
}: {
  index: number;
  question: SkillQuestion;
  value: string;
  correct?: boolean;
  locked: boolean;
  onChange: (value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <article className="min-w-0 space-y-4 rounded-[1.35rem] border border-border/70 bg-card p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("workspace.question")} {index + 1}
        </p>
        {locked ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              correct ? "bg-accent/15 text-accent" : "bg-destructive/10 text-destructive",
            )}
          >
            {correct ? t("workspace.correct") : t("workspace.review")}
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
          placeholder={t("workspace.typeAnswerEnglish")}
          className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-70"
        />
      )}

      {locked ? (
        <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Check className="size-4 text-accent" />
            {correct ? t("workspace.onTrackCorrect") : t("workspace.reviewHint")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{question.explainVi}</p>
          {question.kind === "open" ? (
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">{t("workspace.sample")}</span>
              {(question as OpenQuestion).sampleAnswer}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export type SkillExercisePageViewProps = {
  skill: SkillId;
  skillMeta: SkillMeta | undefined;
  backHref: string;
  exercise: SkillExercise | null;
  loading: boolean;
  answers: Record<string, AnswerDraft>;
  submitted: boolean;
  showScript: boolean;
  answeredCount: number;
  allAnswered: boolean;
  correctCount: number;
  favorited: boolean;
  onToggleFavorite: () => void;
  onAnswerChange: (id: string, value: string) => void;
  onSubmitAll: () => void;
  onTryAgain: () => void;
  onSpeak: () => void;
  onToggleScript: () => void;
};

export const SkillExercisePageView = memo(function SkillExercisePageView({
  skill,
  skillMeta,
  backHref,
  exercise,
  loading,
  answers,
  submitted,
  showScript,
  answeredCount,
  allAnswered,
  correctCount,
  favorited,
  onToggleFavorite,
  onAnswerChange,
  onSubmitAll,
  onTryAgain,
  onSpeak,
  onToggleScript,
}: SkillExercisePageViewProps) {
  const t = useWorkspaceI18n();
  if (loading) {
    return (
      <DataLoadingState
        title={t("workspace.preparingExercise")}
        description={t("workspace.loadingQuestions")}
        cards={3}
      />
    );
  }

  if (!exercise) {
    return (
      <NotFoundPage
        title={t("workspace.exerciseUnavailable")}
        description={t("workspace.exerciseUnavailableDescription")}
        actions={[
          { href: backHref, label: t("workspace.backToSkill"), icon: <BookOpen />, primary: true },
          { href: "/skills", label: t("workspace.backToSkills") },
          { href: "/", label: t("workspace.backToToday"), icon: <House /> },
        ]}
      />
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-8 overflow-x-clip">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href={backHref}>
            <ArrowLeft /> {skillMeta?.labelVi ?? skill}
          </Link>
        </Button>
        <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 px-5 py-6 text-primary-foreground sm:rounded-[1.75rem] sm:px-9 sm:py-10">
          <div
            aria-hidden
            className="absolute -right-10 -top-16 hidden size-52 rounded-full border-28 border-white/7 sm:block"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase sm:block">
                {exercise.level} · {exercise.duration}
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">
                {exercise.title}
              </h1>
              <p className="mt-4 hidden max-w-2xl gap-2 text-sm text-white/70 sm:flex">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>{exercise.tip}</span>
              </p>
            </div>
            <button
              type="button"
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full border transition-colors",
                favorited
                  ? "border-white/50 bg-white text-rose-600 shadow-sm"
                  : "border-white/25 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label={favorited ? t("workspace.removeFavorite") : t("workspace.saveExercise")}
              aria-pressed={favorited}
              onClick={onToggleFavorite}
            >
              <Heart className={cn("size-4", favorited && "fill-current")} />
            </button>
          </div>
        </header>
      </div>

      <section className="min-w-0 space-y-4 rounded-3xl border border-border/70 bg-linear-to-br from-sky-500/8 via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{exercise.material.title}</h2>
          <div className="flex flex-wrap gap-2">
            {exercise.material.speakable ? (
              <Button type="button" variant="outline" className="rounded-full" onClick={onSpeak}>
                <Volume2 className="size-4" />
                {t("workspace.listen")}
              </Button>
            ) : null}
            {skill === "listening" ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={onToggleScript}
              >
                {showScript ? t("workspace.hideScript") : t("workspace.showScript")}
              </Button>
            ) : null}
          </div>
        </div>

        {showScript ? (
          <pre className="whitespace-pre-wrap rounded-xl border border-border/50 bg-background/70 px-4 py-4 font-sans text-sm leading-relaxed text-foreground">
            <ClickableTranslateText text={exercise.material.body} />
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("workspace.listenFirst")}
          </p>
        )}
      </section>

      <section className="min-w-0 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">{t("workspace.yourTurn")}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {t("workspace.oneQuestionAtTime")}
            </h2>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {submitted
              ? t("workspace.correctScore").replace("{correct}", String(correctCount)).replace("{total}", String(exercise.questions.length))
              : t("workspace.answeredScore").replace("{answered}", String(answeredCount)).replace("{total}", String(exercise.questions.length))}
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
          {t("workspace.answerEveryQuestion")}
        </p>

        {exercise.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            value={answers[question.id]?.value ?? ""}
            correct={answers[question.id]?.correct}
            locked={submitted}
            onChange={(value) => onAnswerChange(question.id, value)}
            t={t}
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
                    ? t("workspace.allAnswered")
                    : t("workspace.answerMore")
                        .replace("{count}", String(exercise.questions.length - answeredCount))
                        .replace("{plural}", exercise.questions.length - answeredCount === 1 ? "" : "s")}
                </p>
                <Button
                  type="button"
                  className="h-11 w-full shrink-0 rounded-full px-6 sm:w-auto"
                  disabled={!allAnswered}
                  onClick={onSubmitAll}
                >
                  {t("workspace.submitAnswers")}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {submitted ? (
        <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
            {t("workspace.niceWorkExclamation")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {t("workspace.youGotScore").replace("{correct}", String(correctCount)).replace("{total}", String(exercise.questions.length))}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            Review the explanations above, then try again or practice another skill.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
              onClick={onTryAgain}
            >
              <RotateCcw className="size-4" />
              {t("workspace.tryAgain")}
            </Button>
            <Button
              asChild
              className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            >
              <LocalizedLink href={backHref}>More in this skill</LocalizedLink>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <LocalizedLink href="/practice">AI Chat</LocalizedLink>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
});
