import { DemoLeadForm } from "../../demo-lead-form";
import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

export function CtaSplitForm(props: SectionRenderProps) {
  const { section, primaryColor, secondaryColor, landingPageId, slug, tokens, publicMode } = props;
  return (
    <SectionShell
      id="cta"
      tokens={tokens}
      className="text-white"
      style={{ background: `linear-gradient(120deg, ${secondaryColor} 0%, ${primaryColor} 100%)` }}
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            {section.heading}
          </h2>
          {section.subheading ? <p className="text-lg text-white/85">{section.subheading}</p> : null}
          {section.body ? <p className="text-sm leading-7 text-white/75">{section.body}</p> : null}
          {section.items.length ? (
            <ul className="space-y-2 text-sm text-white/80">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <DemoLeadForm
          landingPageId={landingPageId}
          slug={slug}
          ctaLabel={section.ctaLabel}
          primaryColor={primaryColor}
          publicMode={publicMode}
        />
      </div>
    </SectionShell>
  );
}

export function CtaCenteredBand(props: SectionRenderProps) {
  const { section, primaryColor, secondaryColor, tokens } = props;
  return (
    <SectionShell
      id="cta"
      tokens={tokens}
      narrow
      className="text-center text-white"
      style={{ background: `linear-gradient(160deg, ${primaryColor}, ${secondaryColor})` }}
    >
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
        {section.heading}
      </h2>
      {section.subheading ? <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{section.subheading}</p> : null}
      {section.body ? <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/75">{section.body}</p> : null}
      <a
        href="#hero"
        className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground"
      >
        {section.ctaLabel || "Liên hệ ngay"}
      </a>
    </SectionShell>
  );
}
