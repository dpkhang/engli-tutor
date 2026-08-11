import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

export function TestimonialsCards2(props: SectionRenderProps) {
  const { section, tokens } = props;
  return (
    <SectionShell tokens={tokens}>
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {section.items.map((item) => (
          <blockquote
            key={item}
            className="rounded-[var(--lp-radius)] border bg-muted/30 px-5 py-6 text-sm leading-7 text-muted-foreground"
          >
            {item}
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}

export function TestimonialsCarouselStack(props: SectionRenderProps) {
  const { section, primaryColor, tokens } = props;
  return (
    <SectionShell tokens={tokens} className="bg-muted/20">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      <div className="mt-8 space-y-4">
        {section.items.map((item, index) => (
          <blockquote
            key={item}
            className="rounded-[var(--lp-radius)] border bg-background px-5 py-5 text-sm leading-7 shadow-sm"
            style={{ marginLeft: `${Math.min(index, 3) * 0.75}rem` }}
          >
            <span className="mb-2 block text-xs font-bold tracking-wide uppercase" style={{ color: primaryColor }}>
              Voice {index + 1}
            </span>
            {item}
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}
