"use client";

import { memo } from "react";
import { useWorkspaceI18n } from "@/features/i18n";
import { Bookmark, Check, ChevronLeft, Lightbulb, Volume2, X } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { type LearningQuestion } from "../../../api/types";
import { type VocabGrade } from "../../../api/vocab-api";

const FLASH_GRADES: Array<{
  grade: VocabGrade;
  labelKey: string;
  shortcut: string;
  Icon: typeof X;
  tone: string;
}> = [
  {
    grade: "again",
    labelKey: "learn.game.gradeAgain",
    shortcut: "1",
    Icon: X,
    tone: "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10",
  },
  {
    grade: "hard",
    labelKey: "learn.game.gradeHard",
    shortcut: "2",
    Icon: Lightbulb,
    tone: "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10",
  },
  {
    grade: "good",
    labelKey: "learn.game.gradeGood",
    shortcut: "3",
    Icon: Check,
    tone: "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400/30 dark:text-emerald-300 dark:hover:bg-emerald-400/10",
  },
];

export const FlashRoundView = memo(function FlashRoundView({
  question,
  imageUrl,
  saved,
  locked,
  canGoBack,
  enter,
  flipped,
  imageFailed,
  onFlip,
  onImageError,
  onSpeak,
  onSave,
  onBack,
  onRate,
}: {
  question: Extract<LearningQuestion, { kind: "flash" }>;
  imageUrl?: string;
  saved: boolean;
  locked: boolean;
  canGoBack: boolean;
  enter: "next" | "back";
  flipped: boolean;
  imageFailed: boolean;
  onFlip: () => void;
  onImageError: () => void;
  onSpeak: () => void;
  onSave: () => void;
  onBack: () => void;
  onRate: (value: VocabGrade) => void;
}) {
  const t = useWorkspaceI18n();
  const outline = "h-14 rounded-2xl border bg-transparent shadow-none";
  const mark = "h-14 w-full rounded-full border bg-card shadow-none";

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="perspective-[1400px]">
        <button
          type="button"
          aria-label={flipped ? question.word : t("learn.game.flipWord", { word: question.word })}
          className={cn(
            "relative grid min-h-112 w-full transform-3d transition-transform duration-500",
            !locked && !flipped && "hover:-translate-y-1",
            flipped && "transform-[rotateY(180deg)]",
            locked && "cursor-default",
          )}
          disabled={locked}
          onClick={onFlip}
        >
          <span className="col-start-1 row-start-1 flex flex-col overflow-hidden rounded-4xl border border-black/8 bg-card dark:border-white/10 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.65)] dark:ring-white/10 backface-hidden">
            <span className="relative block aspect-square max-h-[50svh] w-full overflow-hidden border-b border-black/5 bg-muted/40 dark:border-white/10">
              {imageUrl && !imageFailed ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- blurred fill behind the contained art */}
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element -- flashcard art from R2 */}
                  <img
                    src={imageUrl}
                    alt=""
                    decoding="sync"
                    className="relative size-full object-contain"
                    onError={onImageError}
                  />
                </>
              ) : (
                <span className="grid size-full place-items-center text-6xl" aria-hidden>
                  Aa
                </span>
              )}
            </span>
            <span
              className={cn(
                "flex flex-1 flex-col items-center justify-center px-6 py-5 text-center",
                enter === "back" ? "flashcard-enter-back" : "flashcard-enter-next",
              )}
            >
              <span className="text-4xl font-semibold tracking-[-0.04em] capitalize sm:text-5xl">
                {question.word}
              </span>
              <span className="mt-2 text-xs text-muted-foreground">
                {t("learn.game.tapToReveal")}
              </span>
            </span>
          </span>

          <span className="col-start-1 row-start-1 flex flex-col justify-between overflow-hidden rounded-4xl border border-black/8 bg-card dark:border-white/10 p-7 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.65)] dark:ring-white/10 backface-hidden transform-[rotateY(180deg)]">
            <span>
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {question.word}
              </span>
              <span className="mt-4 block text-base text-primary">{question.ipa}</span>
              {question.partOfSpeech ? (
                <span className="mt-2 inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
                  {question.partOfSpeech}
                </span>
              ) : null}
              <span className="mt-2 block text-4xl font-semibold tracking-tight">
                {question.meaningVi}
              </span>
              <span className="mt-4 block text-sm leading-6 text-muted-foreground">
                {question.gloss}
              </span>
            </span>
            <span className="space-y-2 rounded-2xl bg-muted/70 px-4 py-3 text-sm leading-6 text-foreground">
              <span className="block">{question.example}</span>
              {question.exampleVi ? (
                <span className="block border-t border-border/60 pt-2 text-muted-foreground">
                  {question.exampleVi}
                </span>
              ) : null}
            </span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label={t("learn.game.previousWord")}
          disabled={!canGoBack}
          className={cn(
            outline,
            "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800",
          )}
          onClick={onBack}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label={t("learn.game.saveWord")}
          aria-pressed={saved}
          className={cn(
            outline,
            saved
              ? "border-amber-600 bg-amber-500/15 text-amber-800 dark:text-amber-200"
              : "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10",
          )}
          onClick={onSave}
        >
          <Bookmark className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label={t("learn.game.hear")}
          className={cn(outline, "border-primary/40 text-primary hover:bg-primary/10")}
          onClick={onSpeak}
        >
          <Volume2 className="size-5" />
        </Button>
      </div>
      <div role="group" aria-label={t("learn.game.gradeGroup")} className="grid grid-cols-3 gap-2">
        {FLASH_GRADES.map(({ grade, labelKey, shortcut, Icon, tone }) => (
          <Button
            key={grade}
            type="button"
            variant="outline"
            aria-keyshortcuts={shortcut}
            disabled={locked}
            className={cn("h-14 flex-col gap-0.5 rounded-2xl border bg-card shadow-none", tone)}
            onClick={() => onRate(grade)}
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-semibold">{t(labelKey)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
});
