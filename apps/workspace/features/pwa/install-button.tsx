"use client";

import { useState } from "react";
import { Download, EllipsisVertical } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { useInstallPrompt } from "./install-prompt";

type InstallButtonProps = {
  size?: "sm" | "default";
  /** Called when the native prompt is dismissed. */
  onDismissed?: () => void;
};

/** Native install prompt when available; on Android without one, reveals the browser-menu steps. */
export function InstallButton({ size = "default", onDismissed }: InstallButtonProps) {
  const t = useWorkspaceI18n();
  const { state, promptInstall } = useInstallPrompt();
  const [showHint, setShowHint] = useState(false);

  if (state !== "prompt" && state !== "android") return null;

  const label = state === "android" ? t("workspace.pwaAndroidAction") : t("workspace.pwaInstallAction");

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size={size}
        className="rounded-full"
        onClick={async () => {
          if (state === "android") {
            setShowHint((value) => !value);
            return;
          }
          if (!(await promptInstall())) onDismissed?.();
        }}
      >
        <Download className="size-4" /> {label}
      </Button>
      {state === "android" && showHint ? (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <EllipsisVertical className="mt-0.5 size-3.5 shrink-0 text-primary" /> {t("workspace.pwaAndroidHint")}
        </p>
      ) : null}
    </div>
  );
}
