import { Button } from "@landing-page-generator/ui";
import { DemoLeadForm } from "../../demo-lead-form";
import { SectionShell } from "../section-shell";
import type { SectionRenderProps } from "../types";

export function HeroSplitForm(props: SectionRenderProps) {
  const { section, primaryColor, secondaryColor, landingPageId, slug, tokens, heroImageUrl } = props;
  return (
    <SectionShell
      id="hero"
      tokens={tokens}
      className="text-white"
      style={{
        backgroundImage: heroImageUrl
          ? `linear-gradient(135deg, ${primaryColor}e6 0%, ${secondaryColor}b8 100%), url("${heroImageUrl}")`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Landing demo</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight sm:text-5xl">
            {section.heading}
          </h1>
          {section.subheading ? <p className="max-w-xl text-lg text-white/85">{section.subheading}</p> : null}
          {section.body ? <p className="max-w-xl text-sm leading-7 text-white/75">{section.body}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
              <a href="#cta">{section.ctaLabel || "Bắt đầu"}</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
              <a href="#features">Xem thêm</a>
            </Button>
          </div>
        </div>
        <DemoLeadForm
          landingPageId={landingPageId}
          slug={slug}
          ctaLabel={section.ctaLabel}
          primaryColor={primaryColor}
        />
      </div>
    </SectionShell>
  );
}

export function HeroCenteredCta(props: SectionRenderProps) {
  const { section, primaryColor, secondaryColor, tokens, heroImageUrl } = props;
  return (
    <SectionShell
      id="hero"
      tokens={tokens}
      narrow
      className="text-center text-white"
      style={{
        backgroundImage: heroImageUrl
          ? `linear-gradient(160deg, ${secondaryColor}dc 0%, ${primaryColor}c7 100%), url("${heroImageUrl}")`
          : `linear-gradient(160deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <p className="text-xs font-bold tracking-[0.22em] text-white/70 uppercase">Landing demo</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight sm:text-5xl">
        {section.heading}
      </h1>
      {section.subheading ? <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{section.subheading}</p> : null}
      {section.body ? <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/75">{section.body}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
          <a href="#cta">{section.ctaLabel || "Bắt đầu"}</a>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
          <a href="#features">Tìm hiểu thêm</a>
        </Button>
      </div>
    </SectionShell>
  );
}

export function HeroAsymmetric(props: SectionRenderProps) {
  const { section, primaryColor, secondaryColor, landingPageId, slug, tokens, heroImageUrl } = props;
  return (
    <SectionShell id="hero" tokens={tokens} className="bg-background">
      <div className="grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className="flex flex-col justify-end rounded-[var(--lp-radius)] p-8 text-white sm:p-10"
          style={{
            backgroundImage: heroImageUrl
              ? `linear-gradient(145deg, ${primaryColor}d9, ${secondaryColor}a6), url("${heroImageUrl}")`
              : `linear-gradient(145deg, ${primaryColor}, ${secondaryColor})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Landing demo</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight sm:text-4xl">
            {section.heading}
          </h1>
          {section.subheading ? <p className="mt-4 text-white/85">{section.subheading}</p> : null}
        </div>
        <div className="flex flex-col justify-center gap-6 rounded-[var(--lp-radius)] border bg-muted/30 p-6 sm:p-8">
          {section.body ? <p className="text-sm leading-7 text-muted-foreground">{section.body}</p> : null}
          <DemoLeadForm
            landingPageId={landingPageId}
            slug={slug}
            ctaLabel={section.ctaLabel}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </SectionShell>
  );
}
