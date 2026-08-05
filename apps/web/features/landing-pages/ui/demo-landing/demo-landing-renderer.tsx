"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@landing-page-generator/ui";
import type { GeneratedLandingContent, GeneratedSection } from "../../model/generated-content";
import { DemoLeadForm } from "./demo-lead-form";

type Props = {
  content: GeneratedLandingContent;
  landingPageId: string;
  slug: string;
};

function SectionShell({
  id,
  children,
  className = "",
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} className={`px-5 py-16 sm:px-8 sm:py-20 ${className}`} style={style}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

function renderItemsAsList(items: string[]) {
  if (!items.length) return null;
  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xl border border-black/5 bg-white/70 px-4 py-3 text-sm leading-6 shadow-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function HeroSection({
  section,
  primaryColor,
  secondaryColor,
  landingPageId,
  slug,
}: {
  section: GeneratedSection;
  primaryColor: string;
  secondaryColor: string;
  landingPageId: string;
  slug: string;
}) {
  return (
    <SectionShell
      id="hero"
      className="text-white"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Landing demo</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight sm:text-5xl">
            {section.heading}
          </h1>
          {section.subheading ? (
            <p className="max-w-xl text-lg text-white/85">{section.subheading}</p>
          ) : null}
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

function FeaturesSection({
  section,
  primaryColor,
}: {
  section: GeneratedSection;
  primaryColor: string;
}) {
  return (
    <SectionShell id="features">
      <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: primaryColor }}>
        Features
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {section.heading}
      </h2>
      {section.subheading ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p>
      ) : null}
      {section.body ? <p className="mt-3 max-w-2xl text-sm leading-7">{section.body}</p> : null}
      {renderItemsAsList(section.items)}
    </SectionShell>
  );
}

function SocialProofSection({ section }: { section: GeneratedSection }) {
  return (
    <SectionShell className="bg-muted/40">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {section.heading}
      </h2>
      {section.subheading ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {section.items.map((item) => (
          <div key={item} className="rounded-2xl border bg-background px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-semibold leading-6">{item}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function TestimonialsSection({ section }: { section: GeneratedSection }) {
  return (
    <SectionShell>
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {section.heading}
      </h2>
      {section.subheading ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {section.items.map((item) => (
          <blockquote
            key={item}
            className="rounded-2xl border bg-muted/30 px-5 py-6 text-sm leading-7 text-muted-foreground"
          >
            {item}
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}

function FaqSection({ section }: { section: GeneratedSection }) {
  const pairs = section.items.map((item, index) => {
    const [q, ...rest] = item.split("?");
    if (rest.length) {
      return { q: `${q}?`, a: rest.join("?").trim() || section.body || "—" };
    }
    return {
      q: item,
      a: section.body || "Liên hệ để biết thêm chi tiết.",
    };
  });

  return (
    <SectionShell id="faq" className="bg-muted/30">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        {section.heading}
      </h2>
      {section.subheading ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{section.subheading}</p>
      ) : null}
      <Accordion className="mt-8 space-y-2">
        {pairs.map((pair, index) => (
          <AccordionItem key={`${pair.q}-${index}`} value={`faq-${index}`} className="rounded-xl border bg-background px-4">
            <AccordionTrigger className="text-left text-sm font-semibold">{pair.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-muted-foreground">
              {pair.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}

function CtaSection({
  section,
  primaryColor,
  secondaryColor,
  landingPageId,
  slug,
}: {
  section: GeneratedSection;
  primaryColor: string;
  secondaryColor: string;
  landingPageId: string;
  slug: string;
}) {
  return (
    <SectionShell
      id="cta"
      className="text-white"
      style={{
        background: `linear-gradient(120deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
      }}
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
        />
      </div>
    </SectionShell>
  );
}

function FooterSection({ section }: { section: GeneratedSection }) {
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

export function DemoLandingRenderer({ content, landingPageId, slug }: Props) {
  const { primaryColor, secondaryColor } = content.theme;

  return (
    <div className="bg-background text-foreground">
      {content.sections.map((section, index) => {
        const key = `${section.type}-${index}`;
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={key}
                section={section}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                landingPageId={landingPageId}
                slug={slug}
              />
            );
          case "features":
            return <FeaturesSection key={key} section={section} primaryColor={primaryColor} />;
          case "social-proof":
            return <SocialProofSection key={key} section={section} />;
          case "testimonials":
            return <TestimonialsSection key={key} section={section} />;
          case "faq":
            return <FaqSection key={key} section={section} />;
          case "cta":
            return (
              <CtaSection
                key={key}
                section={section}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                landingPageId={landingPageId}
                slug={slug}
              />
            );
          case "footer":
            return <FooterSection key={key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
