"use client";

import { memo } from "react";
import { ChevronLeft } from "lucide-react";
import { LocalizedLink as Link } from "@/features/i18n";
import { useWorkspaceI18n } from "@/features/i18n";
import type { SettingsSection } from "../../model/nav";
import { settingsNavLabelKey } from "./settings-shell.model";

/** Mobile (<1024px): back link + section title on section pages. Hidden from `lg` via CSS. */
export const SettingsMobileNav = memo(function SettingsMobileNav({
  section,
}: {
  section: SettingsSection;
}) {
  const t = useWorkspaceI18n();
  return (
    <header className="sticky top-16 z-30 -mx-4 flex items-center gap-1 border-b border-border/70 bg-background/95 px-2 py-1.5 backdrop-blur-md sm:-mx-6 sm:px-4 lg:hidden">
      <Link
        href="/settings"
        className="inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-5" aria-hidden />
        {t("settings.nav.back")}
      </Link>
      <h2 className="min-w-0 flex-1 truncate pr-12 text-center text-base font-semibold">
        {t(settingsNavLabelKey(section))}
      </h2>
    </header>
  );
});
