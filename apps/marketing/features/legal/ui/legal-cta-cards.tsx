import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import type { LegalCtaCard } from "../model/legal-ctas";

function CtaLink({
  item,
  className,
}: {
  item: LegalCtaCard;
  className?: string;
}) {
  const classes = cn(
    "group flex items-start justify-between gap-3 rounded-sm border border-border bg-background p-4 text-left transition-colors",
    "hover:border-primary/40 hover:bg-muted/40",
    className,
  );
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{item.label}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {item.description}
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
        <CtaLink key={item.label} item={item} />
      ))}
    </div>
  );
}
