"use client";

import { DataLoadingState } from "@/features/layout";
import { useWorkspaceI18n } from "@/features/i18n";

export function SettingsContentLoading() {
  const t = useWorkspaceI18n();
  return (
    <DataLoadingState
      compact
      cards={2}
      title={t("settings.loadingTitle")}
      description={t("settings.loadingDescription")}
    />
  );
}
