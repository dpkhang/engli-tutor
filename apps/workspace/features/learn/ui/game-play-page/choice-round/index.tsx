"use client";

import { cn } from "@engli-tutor/ui";
import { type LearningQuestion } from "../../../api/types";

export function ChoiceRound({
  question,
  value,
  locked,
  onChange,
}: {
  question: Extract<LearningQuestion, { kind: "choice" | "fix" }>;
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {question.options.map((option, optionIndex) => {
        const selected = value === String(optionIndex);
        const isCorrect = optionIndex === question.correctIndex;
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
              !selected && !locked && "border-border hover:border-primary/50 hover:bg-primary/5",
              locked && "cursor-default",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
