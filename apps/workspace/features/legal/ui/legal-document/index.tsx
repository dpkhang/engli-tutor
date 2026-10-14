"use client";

import type { ReactNode } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { ArrowRight } from "lucide-react";
import { CardTitle } from "@engli-tutor/ui";
import type { LegalCtaCard, PolicyCta, PolicySection } from "@engli-tutor/legal";
import { PageHeader } from "@/features/layout";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "@/features/settings";
import { useWorkspaceI18n } from "@/features/i18n";

function SectionCta({ href, label, external }: PolicyCta) {
  const className =
    "mt-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary";
  const body = (
    <>
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
    </>
  );

  if (external) {
    return (
      <a href={href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

function HubCta({ item }: { item: LegalCtaCard }) {
  const t = useWorkspaceI18n();
  const className =
    "group flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/30 px-3.5 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/50";
  const body = (
    <>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{t(`legal.link.${item.id}`)}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {t(`legal.link.${item.id}Description`)}
        </span>
      </span>
      <ArrowRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  );
}

type WorkspaceLegalDocumentProps = {
  title: string;
  description: string;
  hubLabel: string;
  hubCtas: LegalCtaCard[];
  sections: PolicySection[];
  extra?: ReactNode;
};

export function WorkspaceLegalDocument({
  title,
  description,
  hubLabel,
  hubCtas,
  sections,
  extra,
}: WorkspaceLegalDocumentProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader eyebrow={t("legal.eyebrow")} title={title} description={description} />

      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle>{hubLabel}</CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent className="grid gap-2 sm:grid-cols-2">
          {hubCtas.map((item) => (
            <HubCta key={item.id} item={item} />
          ))}
        </SettingsCardContent>
      </SettingsCard>

      {extra}

      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle>{t("legal.onThisPage")}</CardTitle>
        </SettingsCardHeader>
        <SettingsCardContent>
          <ol className="grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </SettingsCardContent>
      </SettingsCard>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <SettingsCard>
            <SettingsCardHeader>
              <CardTitle>{section.title}</CardTitle>
            </SettingsCardHeader>
            <SettingsCardContent className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.cta ? <SectionCta {...section.cta} /> : null}
            </SettingsCardContent>
          </SettingsCard>
        </section>
      ))}
    </div>
  );
}
