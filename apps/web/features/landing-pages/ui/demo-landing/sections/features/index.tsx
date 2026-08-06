import { Check } from "lucide-react";
import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

export function FeaturesGrid3(props: SectionRenderProps) {
  const { section, primaryColor, tokens } = props;
  return (
    <SectionShell id="features" tokens={tokens}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: primaryColor }}>
        Features
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      {section.body ? <p className="mt-3 max-w-2xl text-sm leading-7">{section.body}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <div
            key={item}
            className="rounded-[var(--lp-radius)] border bg-background px-4 py-5 text-sm leading-6 shadow-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function FeaturesListCheck(props: SectionRenderProps) {
  const { section, primaryColor, tokens } = props;
  return (
    <SectionShell id="features" tokens={tokens}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: primaryColor }}>
            Features
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
          {section.subheading ? <p className="mt-3 text-muted-foreground">{section.subheading}</p> : null}
          {section.body ? <p className="mt-3 text-sm leading-7">{section.body}</p> : null}
        </div>
        <ul className="space-y-3">
          {section.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-[var(--lp-radius)] border bg-muted/30 px-4 py-3 text-sm leading-6"
            >
              <Check className="mt-0.5 size-4 shrink-0" style={{ color: primaryColor }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

export function FeaturesBento(props: SectionRenderProps) {
  const { section, primaryColor, tokens } = props;
  return (
    <SectionShell id="features" tokens={tokens}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: primaryColor }}>
        Features
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">{section.heading}</h2>
      {section.subheading ? <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p> : null}
      <div className="mt-8 grid auto-rows-[minmax(7rem,auto)] gap-3 sm:grid-cols-4">
        {section.items.map((item, index) => (
          <div
            key={item}
            className={`rounded-[var(--lp-radius)] border px-4 py-5 text-sm leading-6 shadow-sm ${
              index === 0 ? "bg-primary/8 sm:col-span-2 sm:row-span-2 sm:text-base" : "bg-background"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
