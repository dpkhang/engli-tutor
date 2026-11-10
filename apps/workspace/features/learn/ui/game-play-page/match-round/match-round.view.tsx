"use client";

import { memo } from "react";
import { cn } from "@engli-tutor/ui";

export const MatchRoundView = memo(function MatchRoundView({
  pairs,
  rights,
  mapping,
  locked,
  selectedLeft,
  onSelectLeft,
  onPickRight,
}: {
  pairs: Array<{ left: string; right: string }>;
  rights: Array<{ originalIndex: number; text: string }>;
  mapping: Array<number | null>;
  locked: boolean;
  selectedLeft: number | null;
  onSelectLeft: (leftIndex: number) => void;
  onPickRight: (rightIndex: number) => void;
}) {
  const usedRights = new Set(mapping.filter((item): item is number => item !== null));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        {pairs.map((pair, leftIndex) => {
          const matched = mapping[leftIndex];
          return (
            <button
              key={pair.left}
              type="button"
              disabled={locked}
              onClick={() => onSelectLeft(leftIndex)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-sm",
                selectedLeft === leftIndex && "border-primary bg-primary/8 ring-2 ring-primary/10",
                matched !== null && matched !== undefined && "border-emerald-400/60",
                !locked && "hover:border-primary/50",
                locked && "cursor-default",
              )}
            >
              <span className="font-semibold">{pair.left}</span>
              {matched !== null && matched !== undefined ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {pairs[matched]?.right}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {rights.map((right) => (
          <button
            key={right.originalIndex}
            type="button"
            disabled={locked || usedRights.has(right.originalIndex)}
            onClick={() => onPickRight(right.originalIndex)}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-left text-sm",
              usedRights.has(right.originalIndex) && "opacity-40",
              !locked && "hover:border-primary/50 hover:bg-primary/5",
              locked && "cursor-default",
            )}
          >
            {right.text}
          </button>
        ))}
      </div>
    </div>
  );
});
