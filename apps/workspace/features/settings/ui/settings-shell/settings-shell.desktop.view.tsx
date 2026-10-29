"use client";

import { memo } from "react";
import { LayoutGrid } from "lucide-react";
import { LocalizedLink as Link } from "@/features/i18n";
import { cn } from "@engli-tutor/ui";
import { getSettingsNavGroups, isSettingsNavActive } from "../../model/nav";
import { useWorkspaceI18n } from "@/features/i18n";
import {
  SIDEBAR_PRIVACY,
  settingsNavLabelKey,
  type SettingsNavProps,
} from "./settings-shell.model";

const ITEM_CLASS =
  "inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";
const IDLE_CLASS = "text-muted-foreground hover:bg-muted hover:text-foreground";
const ACTIVE_CLASS = "bg-primary text-primary-foreground";

const GROUPS = getSettingsNavGroups();

/** Desktop (>=1024px): sticky left grouped sidebar. Hidden below `lg` via CSS. */
export const SettingsDesktopNav = memo(function SettingsDesktopNav({
  pathname,
  isOverview,
}: SettingsNavProps) {
  const t = useWorkspaceI18n();
  return (
    <aside className="sticky top-24 z-30 hidden w-56 shrink-0 lg:block">
      <nav aria-label={t("workspace.settings")} className="flex flex-col gap-1">
        <Link
          href="/settings"
          aria-current={isOverview ? "page" : undefined}
          className={cn(ITEM_CLASS, isOverview ? ACTIVE_CLASS : IDLE_CLASS)}
        >
          <LayoutGrid className="size-4" aria-hidden />
          {t("settings.nav.overview")}
        </Link>
        {GROUPS.map((group) => (
          <div key={group.id} className="mt-3 flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
              {t(group.labelKey)}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isSettingsNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(ITEM_CLASS, active ? ACTIVE_CLASS : IDLE_CLASS)}
                >
                  <Icon className="size-4" aria-hidden />
                  {t(settingsNavLabelKey(item))}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="mx-3 my-2 h-px bg-border" role="presentation" />
        {SIDEBAR_PRIVACY.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ITEM_CLASS, IDLE_CLASS)}
            >
              <Icon className="size-4" aria-hidden />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
});
