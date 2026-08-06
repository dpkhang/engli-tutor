import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

export function SocialProofStatRow(props: SectionRenderProps) {
  const { section, tokens } = props;
  return (
    <SectionShell tokens={tokens} className="bg-muted/40">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {section.items.map((item) => (
          <div key={item} className="rounded-[var(--lp-radius)] border bg-background px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-semibold leading-6">{item}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SocialProofLogoStrip(props: SectionRenderProps) {
  const { section, tokens } = props;
  return (
    <SectionShell tokens={tokens} className="border-y bg-background">
      <p className="text-center text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {section.heading}
      </p>
      {section.subheading ? (
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">{section.subheading}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {section.items.map((item) => (
          <span
            key={item}
            className="rounded-full border bg-muted/40 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </SectionShell>
  );
}

export function SocialProofQuoteBanner(props: SectionRenderProps) {
  const { section, primaryColor, tokens } = props;
  const quote = section.items[0] ?? section.body ?? section.heading;
  return (
    <SectionShell tokens={tokens} className="text-white" style={{ backgroundColor: primaryColor }}>
      <blockquote className="mx-auto max-w-3xl text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl leading-snug tracking-tight sm:text-3xl">
          “{quote}”
        </p>
        {section.subheading ? <p className="mt-4 text-sm text-white/75">{section.subheading}</p> : null}
      </blockquote>
    </SectionShell>
  );
}
