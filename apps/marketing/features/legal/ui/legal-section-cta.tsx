import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PolicyCta } from "../model/policy";

const CTA_CLASS =
  "mt-2 inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary";

export function LegalSectionCta({ href, label, external }: PolicyCta) {
  const body = (
    <>
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
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
