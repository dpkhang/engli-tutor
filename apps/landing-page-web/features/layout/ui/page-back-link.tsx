import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@landing-page-generator/ui";

type PageBackLinkProps = {
  href: string;
  /** Text after “Back to ”, e.g. “home” → “Back to home” */
  label: string;
  className?: string;
};

export function PageBackLink({ href, label, className }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden strokeWidth={2} />
      <span>Back to {label}</span>
    </Link>
  );
}
