import type { ReactNode } from "react";
import { SettingsContentLoading } from "./settings-content-loading";

export function SettingsPanel({ ready, children }: { ready: boolean; children: ReactNode }) {
  if (!ready) return <SettingsContentLoading />;
  return children;
}
