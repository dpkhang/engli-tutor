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
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
