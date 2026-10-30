"use client";

import type { ReactNode } from "react";
import { Check, LoaderCircle, RotateCcw } from "lucide-react";
import { Button, CardFooter, CardTitle } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
} from "./settings-card";
import {
  SettingsHeaderActions,
  useSettingsHeaderActionsSlot,
} from "./settings-header-actions";

/**
 * Card with Save/Discard actions. Pair with `useSettingsDraft`.
 * Below `lg`, when the mobile section header is mounted, the actions render there as icon
 * buttons and the footer is hidden; otherwise they stay in the card footer.
 */
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
  const headerSlot = useSettingsHeaderActionsSlot();
  const disabled = !isDirty || saving;
  const saveLabel = saving ? t("settings.form.saving") : t("settings.form.save");
  return (
    <SettingsCard>
      <SettingsHeaderActions>
        <span className="sr-only" role="status">
          {isDirty ? t("settings.form.unsaved") : ""}
        </span>
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full"
            disabled={disabled}
            aria-label={t("workspace.discard")}
            title={t("workspace.discard")}
            onClick={onReset}
          >
            <RotateCcw aria-hidden className="size-5" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon"
          className="relative size-11 rounded-full"
          disabled={disabled}
          aria-busy={saving}
          aria-label={saveLabel}
          title={saveLabel}
          onClick={onSave}
        >
          {saving ? (
            <LoaderCircle aria-hidden className="size-5 animate-spin" />
          ) : (
            <Check aria-hidden className="size-5" />
          )}
          {isDirty && !saving ? (
            <span
              aria-hidden
              className="absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-background bg-amber-500"
            />
          ) : null}
        </Button>
      </SettingsHeaderActions>
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
      <CardFooter
        className={`${headerSlot ? "hidden lg:flex" : "flex"} flex-col gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between`}
      >
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
            {saving ? (
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
            ) : null}
            {saving ? t("settings.form.saving") : t("settings.form.save")}
          </Button>
        </div>
      </CardFooter>
    </SettingsCard>
  );
}
