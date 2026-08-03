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
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
