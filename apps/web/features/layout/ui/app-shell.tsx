"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { authClient, getMarketingUrl, useSession } from "@landing-page-generator/auth";
import { Button } from "@landing-page-generator/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const marketingUrl = getMarketingUrl();
  const { data } = useSession();
  const user = data?.user;
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "";

  const signOut = () => {
    void authClient.signOut().then(() => {
      window.location.assign(`${marketingUrl}/auth`);
    });
  };

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
          <nav className="flex items-center gap-3 text-sm sm:gap-4">
            <span className="hidden text-muted-foreground sm:inline">Workspace</span>
            {user ? (
              <span className="hidden max-w-[10rem] truncate text-muted-foreground md:inline">
                {displayName}
              </span>
            ) : null}
            <a
              href={marketingUrl}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Marketing
              <ExternalLink className="size-3.5" strokeWidth={2} />
            </a>
            {user ? (
              <Button type="button" variant="outline" size="sm" onClick={signOut}>
                Đăng xuất
              </Button>
            ) : null}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">{children}</div>
    </div>
  );
}
