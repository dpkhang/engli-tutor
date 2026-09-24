import { DataLoadingState } from "@/features/layout";

export function SettingsContentLoading() {
  return (
    <DataLoadingState
      compact
      cards={2}
      title="Loading settings"
      description="Updating this section…"
    />
  );
}
