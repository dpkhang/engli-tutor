"use client";

import { memo, Suspense } from "react";
import { PageHeader } from "@/features/layout";
import { SettingsContentLoading } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";
import { SettingsDesktopNav } from "./settings-shell.desktop.view";
import { SettingsMobileNav } from "./settings-shell.mobile.view";
import type { SettingsShellViewProps } from "./settings-shell.model";

export type { SettingsShellViewProps } from "./settings-shell.model";

/** Composes separate mobile / desktop navigation (CSS-gated at `lg`); header and content render once. */
export const SettingsShellView = memo(function SettingsShellView({
  pathname,
  isOverview,
  section,
  children,
}: SettingsShellViewProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-4 pb-[calc(var(--tabbar-h,0px)+1rem)] sm:space-y-5 lg:pb-0">
      {section ? <SettingsMobileNav section={section} /> : null}
      <div className={section ? "hidden lg:block" : undefined}>
        <PageHeader
          eyebrow={t("workspace.personal")}
          title={t("workspace.settings")}
          description={section ? t(section.descriptionKey) : t("workspace.manageWorkspace")}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <SettingsDesktopNav pathname={pathname} isOverview={isOverview} />

        <div className="min-w-0 flex-1 space-y-4">
          <Suspense fallback={<SettingsContentLoading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
});
