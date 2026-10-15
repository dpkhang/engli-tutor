"use client";

import { CheckCircle2, Share, Smartphone } from "lucide-react";
import { CardTitle } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "@/features/settings";
import { useWorkspaceI18n } from "@/features/i18n";
import { InstallButton } from "../install-button";
import { useInstallPrompt } from "../../lib/install-prompt";

export function InstallAppCard() {
  const t = useWorkspaceI18n();
  const { state } = useInstallPrompt();
  if (state === "unavailable") return null;

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="size-5 text-primary" /> {t("workspace.pwaInstallTitle")}
        </CardTitle>
      </SettingsCardHeader>
      <SettingsCardContent className="space-y-3">
        {state === "installed" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" /> {t("workspace.pwaInstalled")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("workspace.pwaInstallDescription")}</p>
        )}
        <InstallButton />
        {state === "ios" ? (
          <p className="flex items-center gap-2 text-sm">
            <Share className="size-4 shrink-0 text-primary" /> {t("workspace.pwaIosHint")}
          </p>
        ) : null}
      </SettingsCardContent>
    </SettingsCard>
  );
}
