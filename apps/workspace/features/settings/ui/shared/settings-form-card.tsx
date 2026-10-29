"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button, CardFooter, CardTitle } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "./settings-card";

/** Card with a footer "Save" action. Pair with `useSettingsDraft`. */
export function SettingsFormCard({
  title,
  icon,
  isDirty,
  saving,
  onSave,
  onReset,
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  children: ReactNode;
}) {
  const t = useWorkspaceI18n();
  return (
    <SettingsCard>
      {title ? (
        <SettingsCardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon} {title}
          </CardTitle>
        </SettingsCardHeader>
      ) : null}
      <SettingsCardContent className={title ? "space-y-6" : "space-y-6 pt-4"}>
        {children}
      </SettingsCardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" role="status">
          {isDirty ? t("settings.form.unsaved") : ""}
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          {onReset ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full sm:flex-none"
              disabled={!isDirty || saving}
              onClick={onReset}
            >
              {t("workspace.discard")}
            </Button>
          ) : null}
          <Button
            type="button"
            className="flex-1 rounded-full sm:flex-none"
            disabled={!isDirty || saving}
            aria-busy={saving}
            onClick={onSave}
          >
            {saving ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
            {saving ? t("settings.form.saving") : t("settings.form.save")}
          </Button>
        </div>
      </CardFooter>
    </SettingsCard>
  );
}
