export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-[1.25rem] border border-border/70 bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-end sm:gap-4 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary sm:hidden" aria-hidden />
      <div className="space-y-1.5 sm:space-y-2">
        {eyebrow ? (
          <p className="hidden text-[11px] font-medium tracking-[0.18em] text-accent uppercase sm:block">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
