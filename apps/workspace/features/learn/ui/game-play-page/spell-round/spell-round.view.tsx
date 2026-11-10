"use client";

import { memo } from "react";
import { useWorkspaceI18n } from "@/features/i18n";
import { cn } from "@engli-tutor/ui";

export const SpellRoundView = memo(function SpellRoundView({
  letters,
  answer,
  locked,
  shuffled,
  picked,
  onRemove,
  onPick,
}: {
  letters: string[];
  answer: string;
  locked: boolean;
  shuffled: Array<{ originalIndex: number; letter: string }>;
  picked: number[];
  onRemove: (slot: number, letter: number | undefined) => void;
  onPick: (originalIndex: number, taken: boolean) => void;
}) {
  const t = useWorkspaceI18n();
  const used = new Set(picked);

  return (
    <div className="space-y-4">
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3">
        {answer.split("").map((_, slot) => {
          const letter = picked[slot];
          return (
            <button
              key={`slot-${slot}`}
              type="button"
              disabled={locked || letter === undefined}
              onClick={() => onRemove(slot, letter)}
              className={cn(
                "grid size-10 place-items-center rounded-xl border text-lg font-semibold uppercase",
                letter === undefined
                  ? "border-dashed border-border bg-background text-muted-foreground"
                  : "border-primary bg-card text-foreground",
                locked && "cursor-default",
              )}
            >
              {letter !== undefined ? (letters[letter] ?? "") : ""}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">{t("learn.game.spellHint")}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {shuffled.map((item) => {
          const taken = used.has(item.originalIndex);
          return (
            <button
              key={item.originalIndex}
              type="button"
              disabled={locked || taken || picked.length >= answer.length}
              onClick={() => onPick(item.originalIndex, taken)}
              className={cn(
                "grid size-12 place-items-center rounded-xl border text-lg font-semibold uppercase transition",
                taken
                  ? "border-transparent bg-muted text-muted-foreground/30"
                  : "border-border bg-card hover:border-primary hover:bg-primary/5",
                locked && "cursor-default",
              )}
            >
              {item.letter}
            </button>
          );
        })}
      </div>
    </div>
  );
});
