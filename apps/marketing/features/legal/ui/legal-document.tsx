import type { LegalCtaCard } from "../model/legal-ctas";
import type { PolicySection } from "../model/policy";
import type { ReactNode } from "react";
import { LegalCtaCards } from "./legal-cta-cards";
import { LegalSectionCta } from "./legal-section-cta";
import { useMarketingI18n } from "@/features/i18n";

type LegalDocumentViewProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  intro: string;
  hubLabel: string;
  hubCtas: LegalCtaCard[];
  sections: PolicySection[];
  extra?: ReactNode;
};

export function LegalDocumentView({
  eyebrow,
  title,
  intro,
  hubLabel,
  hubCtas,
  sections,
  extra,
}: LegalDocumentViewProps) {
  const t = useMarketingI18n();
  return (
    <main className="relative min-h-svh bg-[radial-gradient(ellipse_at_top,hsl(214_22%_92%),hsl(var(--background))_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(222_28%_14%),hsl(var(--background))_55%)]">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-5 pt-10 pb-12 wrap-break-word sm:space-y-8 sm:px-8 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
        <header className="rounded-2xl border border-border/80 bg-background/85 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{intro}</p>
        </header>

        <section aria-label={hubLabel} className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">{hubLabel}</p>
          <LegalCtaCards items={hubCtas} />
        </section>

        {extra}

        <nav aria-label={t("legal.onThisPage")} className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-sm backdrop-blur">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">{t("legal.onThisPage")}</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex min-h-11 items-center rounded-xl text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8 sm:space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3 rounded-2xl border border-border/70 bg-background/75 p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl tracking-tight text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.cta ? <LegalSectionCta {...section.cta} /> : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
