"use client";

import { memo, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  CardTitle,
  Input,
  Label,
} from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

export type SecuritySettingsViewProps = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOthers: boolean;
  passwordPending: boolean;
  passwordError: string | null;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRevokeOthersChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
};

export const SecuritySettingsView = memo(function SecuritySettingsView({
  currentPassword,
  newPassword,
  confirmPassword,
  revokeOthers,
  passwordPending,
  passwordError,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onRevokeOthersChange,
  onSubmit,
}: SecuritySettingsViewProps) {
  const t = useWorkspaceI18n();
  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" /> {t("workspace.password")}
        </CardTitle>
      </SettingsCardHeader>
      <SettingsCardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="current-password">{t("workspace.currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
              required
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">{t("workspace.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
              minLength={8}
              required
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">{t("workspace.confirmNewPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              minLength={8}
              required
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={revokeOthers}
              onChange={(event) => onRevokeOthersChange(event.target.checked)}
            />
            {t("workspace.signOutOtherDevices")}
          </label>
          {passwordError ? (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={passwordPending} className="h-11 w-full sm:w-auto">
            {passwordPending ? t("workspace.updating") : t("workspace.updatePassword")}
          </Button>
        </form>
      </SettingsCardContent>
    </SettingsCard>
  );
});
