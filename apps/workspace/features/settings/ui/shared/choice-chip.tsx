"use client";

import type { ReactNode } from "react";
import { cn } from "@engli-tutor/ui";

export function ChoiceChip({
  active,
  children,
  onClick,
  pressed,
  disabled,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  /** Optional aria-pressed (set for toggle-style groups). */
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "disabled:pointer-events-none disabled:opacity-60",
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
