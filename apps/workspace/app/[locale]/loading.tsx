"use client";

import { DataLoadingState } from "@/features/layout";
import { useWorkspaceI18n } from "@/features/i18n";

export default function Loading() {
  const t = useWorkspaceI18n();
  return (
    <div className="mx-auto w-full max-w-5xl py-6">
      <DataLoadingState
        title={t("shell.loadingTitle")}
        description={t("shell.loadingDescription")}
        cards={3}
      />
    </div>
  );
}
