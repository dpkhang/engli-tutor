import { cn } from "@engli-tutor/ui";

type DataLoadingStateProps = {
  title?: string;
  description?: string;
  cards?: number;
  compact?: boolean;
  className?: string;
};

export function DataLoadingState({
  title = "Loading your data",
  description = "Just a moment while we prepare everything for you.",
  cards = 3,
  compact = false,
  className,
}: DataLoadingStateProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-card",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label={title}
      role="status"
    >
      <div className="pointer-events-none absolute -top-24 right-0 -z-10 size-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="flex items-center gap-4">
        <div className="relative grid size-11 shrink-0 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-primary/15 bg-primary/5" />
          <span className="absolute inset-1 animate-[spin_1.4s_linear_infinite] rounded-full border-2 border-transparent border-t-primary border-r-primary/25" />
          <span className="size-2 rounded-full bg-accent shadow-[0_0_0_5px_hsl(var(--accent)/0.12)]" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold tracking-tight text-foreground">{title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className={cn("grid gap-3", compact ? "mt-5" : "mt-7 sm:grid-cols-2")} aria-hidden="true">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className={cn(
              "loading-sheen overflow-hidden rounded-xl border border-border/70 bg-background/65 p-4",
              !compact && index === 0 && cards % 2 === 1 && "sm:col-span-2",
            )}
          >
            <div className="h-2.5 w-20 rounded-full bg-muted" />
            <div className="mt-3 h-4 rounded-full bg-muted" style={{ width: `${72 + (index % 2) * 14}%` }} />
            <div className="mt-2 h-3 w-3/5 rounded-full bg-muted/75" />
          </div>
        ))}
      </div>
    </section>
  );
}
