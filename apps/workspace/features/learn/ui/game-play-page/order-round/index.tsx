"use client";

import { useWorkspaceI18n } from "@/features/i18n";
import { cn } from "@engli-tutor/ui";

export function OrderRound({
  items,
  value,
  locked,
  onChange,
}: {
  items: Array<{ originalIndex: number; text: string }>;
  value: number[];
  locked: boolean;
  onChange: (value: number[]) => void;
}) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("learn.game.orderHint")}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const position = value.indexOf(item.originalIndex);
          const picked = position >= 0;
          return (
            <button
              key={item.originalIndex}
              type="button"
              disabled={locked}
              onClick={() => {
                if (locked) return;
                if (picked) onChange(value.filter((entry) => entry !== item.originalIndex));
                else onChange([...value, item.originalIndex]);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                picked && !locked && "border-primary bg-primary/8",
                locked && picked && "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
                !picked && !locked && "border-border hover:border-primary/50 hover:bg-primary/5",
                locked && "cursor-default",
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
                {picked ? position + 1 : "·"}
              </span>
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
