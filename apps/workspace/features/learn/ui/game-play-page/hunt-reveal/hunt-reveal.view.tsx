"use client";

import { Fragment } from "react";
import { Check, Volume2, X } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import type { HuntQuestion, HuntSummaryRow, HuntTarget, Segment } from "../game-play-page.model";
import type { evaluateHunt } from "../../../model/games";

export function HuntRevealView({
  question,
  targets,
  evaluation,
  segments,
  active,
  correct,
  onToggleActive,
  onSpeak,
}: {
  question: HuntQuestion;
  targets: HuntTarget[];
  evaluation: ReturnType<typeof evaluateHunt>;
  segments: Segment[];
  active: HuntTarget | null;
  correct: boolean | null;
  onToggleActive: (target: HuntTarget) => void;
  onSpeak: (word: string) => void;
}) {
  const t = useWorkspaceI18n();
  const explanation = question.explanation;
  return (
    <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Check className="size-4 text-accent" />
        {correct ? t("learn.game.onTrack") : t("learn.game.checkHint")}
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {t("learn.game.hunt.keywordsFound", {
            hits: evaluation.hits.length,
            total: targets.length,
          })}
        </span>
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1">
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-300" />
          {t("learn.game.hunt.hit")}
        </li>
        <li className="flex items-center gap-1">
          <X className="size-3.5 text-rose-600 dark:text-rose-300" />
          {t("learn.game.hunt.falsePick")}
        </li>
        <li className="flex items-center gap-1">
          <span className="size-3 rounded-sm border border-dashed border-amber-500" />
          {t("learn.game.hunt.missed")}
        </li>
      </ul>

      {segments.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("learn.game.hunt.transcript")}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {segments.map((segment, i) => {
              const target = segment.target;
              if (!target) return <Fragment key={i}>{segment.text}</Fragment>;
              const hit = evaluation.hits.includes(target.word);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={active?.word === target.word}
                  onClick={() => onToggleActive(target)}
                  className={cn(
                    "rounded px-1 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    hit
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
                  )}
                >
                  {segment.text}
                </button>
              );
            })}
          </p>
          <p className="text-xs text-muted-foreground">{t("learn.game.hunt.tapKeyword")}</p>
        </div>
      ) : null}

      {active ? (
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm"
          role="status"
        >
          <span className="font-semibold">{active.word}</span>
          {active.ipa ? <span className="text-muted-foreground">{active.ipa}</span> : null}
          {active.meaningVi ? (
            <span>
              <span className="text-xs text-muted-foreground">
                {t("learn.game.hunt.meaning")}:{" "}
              </span>
              {active.meaningVi}
            </span>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-auto rounded-full"
            aria-label={t("learn.game.hunt.speakWord", { word: active.word })}
            onClick={() => onSpeak(active.word)}
          >
            <Volume2 className="size-4" />
          </Button>
        </div>
      ) : null}

      {explanation ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{explanation}</p>
      ) : null}
    </div>
  );
}

export function HuntResultsSummaryView({
  rows,
  frequent,
}: {
  rows: HuntSummaryRow[];
  frequent: Array<[string, number]>;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
          {t("learn.game.hunt.roundSummary")}
        </p>
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-white/10 px-4 py-2.5 text-sm"
            >
              <span>
                {i + 1}. {row.prompt}
              </span>
              <span className="shrink-0 text-xs font-semibold">
                {t("learn.game.hunt.keywordsFound", {
                  hits: row.hits,
                  total: row.total,
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {frequent.length ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
            {t("learn.game.hunt.missedWords")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {frequent.map(([word, count]) => (
              <li key={word} className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                {word}
                {count > 1 ? ` ×${count}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
