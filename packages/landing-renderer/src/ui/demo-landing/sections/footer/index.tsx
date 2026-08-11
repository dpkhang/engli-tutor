import type { SectionRenderProps } from "../types";

export function FooterSimple(props: SectionRenderProps) {
  const { section } = props;
  return (
    <footer className="border-t bg-foreground px-5 py-10 text-primary-foreground sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl">{section.heading}</p>
          {section.subheading ? (
            <p className="mt-2 text-sm text-primary-foreground/70">{section.subheading}</p>
          ) : null}
          {section.body ? (
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/60">{section.body}</p>
          ) : null}
        </div>
        {section.items.length ? (
          <ul className="flex flex-wrap gap-3 text-sm text-primary-foreground/70">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}

export function FooterColumns(props: SectionRenderProps) {
  const { section } = props;
  const mid = Math.ceil(section.items.length / 2) || 1;
  const left = section.items.slice(0, mid);
  const right = section.items.slice(mid);
  return (
    <footer className="border-t bg-foreground px-5 py-12 text-primary-foreground sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <p className="font-[family-name:var(--font-display)] text-xl">{section.heading}</p>
          {section.subheading ? (
            <p className="mt-2 text-sm text-primary-foreground/70">{section.subheading}</p>
          ) : null}
          {section.body ? (
            <p className="mt-2 text-sm text-primary-foreground/60">{section.body}</p>
          ) : null}
        </div>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          {left.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className="space-y-2 text-sm text-primary-foreground/70">
          {right.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
