"use client";

import { memo, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import { PageHeader } from "@/features/layout";
import { SETTINGS_NAV, isSettingsNavActive, type SettingsSection } from "../../model/nav";
import { SettingsContentLoading } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

const SIDEBAR_PRIVACY = [
  { href: "/policy", key: "workspace.privacyPolicy", icon: ShieldCheck },
  { href: "/policy/cookies", key: "workspace.cookiePolicy", icon: Cookie },
];

export type SettingsShellViewProps = {
  pathname: string;
  section: SettingsSection | undefined;
  children: ReactNode;
};

export const SettingsShellView = memo(function SettingsShellView({
  pathname,
  section,
  children,
}: SettingsShellViewProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={t("workspace.personal")}
        title={t("workspace.settings")}
        description={section?.description ?? t("workspace.manageWorkspace")}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <aside className="sticky top-16 z-30 -mx-4 border-y border-border/70 bg-background/95 py-2 backdrop-blur-md sm:-mx-6 sm:px-2 lg:top-24 lg:mx-0 lg:w-56 lg:shrink-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <nav
            aria-label={t("workspace.settings")}
            className="scrollbar-none flex snap-x gap-1 overflow-x-auto px-4 lg:flex-col lg:overflow-visible lg:px-0"
          >
            {SETTINGS_NAV.map((item) => {
              const Icon = item.icon;
              const active = isSettingsNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors lg:h-auto lg:gap-2.5 lg:px-3 lg:py-2.5",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {t(`workspace.${item.href === "/settings" ? "appearance" : item.href.split("/").at(-1)}`)}
                </Link>
              );
            })}
            <div className="mx-3 hidden h-px bg-border lg:block" role="presentation" />
            {SIDEBAR_PRIVACY.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:h-auto lg:gap-2.5 lg:px-3 lg:py-2.5"
                >
                  <Icon className="size-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <Suspense fallback={<SettingsContentLoading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
});
