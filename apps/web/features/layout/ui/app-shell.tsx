"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

const marketingUrl =
  (process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3002").replace(/\/$/, "");

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,hsl(var(--surface)),hsl(var(--background))_55%)]">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-foreground"
          >
            Pagecraft
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Workspace</span>
            <a
              href={marketingUrl}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Marketing site
              <ExternalLink className="size-3.5" strokeWidth={2} />
            </a>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">{children}</div>
    </div>
  );
}
