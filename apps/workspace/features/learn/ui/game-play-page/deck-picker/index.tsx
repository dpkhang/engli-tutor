"use client";

import { useWorkspaceI18n } from "@/features/i18n";
import { RotateCcw } from "lucide-react";
import { SegmentedSwitch, cn } from "@engli-tutor/ui";
import { type LearningLevel } from "../../../api/types";
import { VOCAB_MODES, type VocabMode } from "../../../model/vocab-trainer";
import { type FlashcardDeckOption } from "../types";

export function DeckPicker({
  levels,
  level,
  decks,
  deckId,
  mode,
  lockedModes,
  canReview,
  onPickLevel,
  onPickDeck,
  onPickMode,
  onReviewDeck,
}: {
  canReview: boolean;
  levels: LearningLevel[];
  level: LearningLevel | null;
  decks: FlashcardDeckOption[];
  deckId: string | null;
  mode: VocabMode;
  lockedModes: VocabMode[];
  onPickLevel: (level: LearningLevel) => void;
  onPickDeck: (deckId: string) => void;
  onPickMode: (mode: VocabMode) => void;
  onReviewDeck: (deckId: string) => void;
}) {
  const t = useWorkspaceI18n();
  const activeDeck = decks.find((deck) => deck.id === deckId);
  return (
    <div className="space-y-4">
      {level ? (
        <SegmentedSwitch
          value={level}
          onChange={onPickLevel}
          ariaLabel={t("learn.game.flashcardLevel")}
          className="max-w-md"
          options={levels.map((item) => ({ id: item, label: item }))}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {decks.map((deck) => {
          const active = deck.id === deckId;
          return (
            <div
              key={deck.id}
              className={cn(
                "flex flex-col rounded-2xl border transition-colors",
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/70 hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPickDeck(deck.id)}
                className="flex-1 px-4 py-3 text-left"
              >
                <span className="block text-sm font-semibold text-foreground">{deck.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {t("learn.game.wordCount", { count: deck.cardCount })}
                  {deck.masteredCount > 0
                    ? ` · ${t("learn.game.mastered", { count: deck.masteredCount })}`
                    : ""}
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.round((deck.masteredCount / Math.max(1, deck.cardCount)) * 100)}%`,
                    }}
                  />
                </span>
              </button>
              {canReview && deck.reviewCount > 0 ? (
                <button
                  type="button"
                  onClick={() => onReviewDeck(deck.id)}
                  className="mx-4 mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  <RotateCcw className="size-3.5" />
                  {t("learn.game.reviewNow", { count: deck.reviewCount })}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("learn.game.mode")}
        </p>
        <SegmentedSwitch
          value={mode}
          onChange={onPickMode}
          ariaLabel={t("learn.game.practiceMode")}
          className="max-w-md"
          options={VOCAB_MODES.map((item) => ({
            id: item.id,
            label: lockedModes.includes(item.id)
              ? t("learn.game.modeStandard", { mode: t(item.labelKey) })
              : t(item.labelKey),
          }))}
        />
        {lockedModes.includes(mode) ? (
          <p className="text-xs text-muted-foreground">{t("learn.game.lockedModesNote")}</p>
        ) : mode === "picture" && activeDeck && activeDeck.pictureCount < activeDeck.cardCount ? (
          <p className="text-xs text-muted-foreground">
            {activeDeck.pictureCount
              ? t("learn.game.picturesPartial", {
                  count: activeDeck.pictureCount,
                  total: activeDeck.cardCount,
                })
              : t("learn.game.noPictures")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
