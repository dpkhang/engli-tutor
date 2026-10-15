import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PolicyCta } from "../../model/policy";

const CTA_CLASS =
  "mt-2 inline-flex min-h-11 max-w-full items-center gap-2 rounded-2xl border border-border/80 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60";

export function LegalSectionCta({ href, label, external }: PolicyCta) {
  const body = (
    <>
      {label}
      <ArrowRight className="size-3.5 shrink-0" aria-hidden />
    </>
  );

  if (external) {
    return (
      <a href={href} className={CTA_CLASS}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={CTA_CLASS}>
      {body}
    </Link>
  );
}
