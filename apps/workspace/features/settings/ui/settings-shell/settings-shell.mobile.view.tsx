"use client";

import { memo, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { LocalizedLink as Link } from "@/features/i18n";
import { useWorkspaceI18n } from "@/features/i18n";
import type { SettingsSection } from "../../model/nav";
import { settingsNavLabelKey } from "./settings-shell.model";
import { useSettingsHeaderActionsSlotRef } from "../shared";

/**
 * Mobile (<1024px): round back button + title/description on section pages, with a right-side
 * slot for section actions (e.g. Save/Discard from `SettingsFormCard`). Hidden from `lg` via CSS.
 */
export const SettingsMobileNav = memo(function SettingsMobileNav({
  section,
}: {
  section: SettingsSection;
}) {
  const t = useWorkspaceI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionsSlotRef = useSettingsHeaderActionsSlotRef();
  const sectionHref = section.href;

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [sectionHref]);

  return (
    <header className="sticky top-16 z-30 -mx-4 flex items-center gap-3 border-b border-border/70 bg-background/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
      <Link
        href="/settings"
        aria-label={t("settings.nav.backToSettings")}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <div className="min-w-0 flex-1">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="truncate text-lg font-semibold leading-tight focus:outline-none"
        >
          {t(settingsNavLabelKey(section))}
        </h2>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {t(section.descriptionKey)}
        </p>
      </div>
      <div
        ref={actionsSlotRef}
        className="flex shrink-0 items-center gap-2 empty:hidden"
      />
    </header>
  );
});
