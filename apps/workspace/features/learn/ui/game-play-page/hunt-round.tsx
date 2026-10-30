"use client";

import { Check, Volume2, X } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { ClickableTranslateText } from "@/features/translate";
import {
  getHuntTargets,
  huntChipStatus,
  type HuntQuestion,
} from "./hunt-reveal";

export function HuntRound({
  question,
  options,
  selected,
  locked,
  speakable,
  fallbackText,
  hearsLeft,
  canHear,
  onHear,
  onChange,
}: {
  question: HuntQuestion;
  options: string[];
  selected: string[];
  locked: boolean;
  /** True when the material is played through TTS (step 1: listen). */
  speakable: boolean;
  /** Text shown in the listen card when there is no audio. */
  fallbackText?: string;
  hearsLeft: number;
  canHear: boolean;
  onHear: () => void;
  onChange: (value: string[]) => void;
}) {
  const t = useWorkspaceI18n();
  const targetCount = getHuntTargets(question).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-4">
        {speakable ? (
          <>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Volume2 className="size-5" />
            </span>
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              {t("learn.game.hunt.listenFirst")}
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!canHear}
              onClick={onHear}
            >
              {t("learn.game.hunt.hearAgain", { count: hearsLeft })}
            </Button>
          </>
        ) : fallbackText ? (
          <p className="text-sm leading-relaxed">
            <ClickableTranslateText text={fallbackText} />
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{t("learn.game.hunt.pick", { count: targetCount })}</span>
          <span
            aria-live="polite"
            aria-label={t("learn.game.hunt.counterLabel", {
              selected: selected.length,
              total: targetCount,
            })}
            className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground"
          >
            {selected.length}/{targetCount}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {options.map((word) => {
            const on = selected.includes(word);
            const status = locked
              ? huntChipStatus(question, selected, word)
              : "neutral";
            return (
              <button
                key={word}
                type="button"
                aria-pressed={on}
                disabled={locked || (!on && selected.length >= targetCount)}
                onClick={() => {
                  if (locked) return;
                  onChange(
                    on
                      ? selected.filter((item) => item !== word)
                      : [...selected, word],
                  );
                }}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed",
                  !locked &&
                    on &&
                    "border-primary bg-primary text-primary-foreground",
                  !locked &&
                    !on &&
                    "border-border hover:border-primary/50 disabled:opacity-50",
                  locked && "cursor-default",
                  status === "hit" &&
                    "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
                  status === "false" &&
                    "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
                  status === "missed" &&
                    "border-dashed border-amber-500 bg-transparent text-amber-800 dark:text-amber-200",
                  locked &&
                    status === "neutral" &&
                    "border-border text-muted-foreground",
                )}
              >
                {status === "hit" ? (
                  <Check className="size-4" aria-hidden />
                ) : null}
                {status === "false" ? (
                  <X className="size-4" aria-hidden />
                ) : null}
                <span>{word}</span>
                {status === "missed" ? (
                  <span className="text-[11px] font-semibold uppercase">
                    {t("learn.game.hunt.missed")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
