"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import { useMarketingI18n } from "@/features/i18n";
import type { LegalCtaCard } from "../../model/legal-ctas";

function CtaLink({
  item,
  className,
}: {
  item: LegalCtaCard;
  className?: string;
}) {
  const t = useMarketingI18n();
  const classes = cn(
    "group flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border/80 bg-background/90 p-5 text-left shadow-sm transition-all duration-200",
    "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
    className,
  );
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{t(`legal.link.${item.id}`)}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {t(`legal.link.${item.id}Description`)}
        </span>
      </span>
      <ArrowRight
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        aria-hidden
      />
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} className={classes}>
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href} className={classes}>
      {body}
    </Link>
  );
}

export function LegalCtaCards({ items }: { items: LegalCtaCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <CtaLink key={item.id} item={item} />
      ))}
    </div>
  );
}
