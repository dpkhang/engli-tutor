"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useActionDialog } from "@engli-tutor/ui";
import { ApiError } from "@engli-tutor/api-client";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { useWorkspaceI18n } from "@/features/i18n";
import { SecuritySettingsView } from "./security-settings.view";

export function SecuritySettings() {
  const t = useWorkspaceI18n();
  const dialog = useActionDialog();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setPasswordError(null);
      if (newPassword.length < 8) {
        setPasswordError(t("settings.security.tooShort"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError(t("settings.security.mismatch"));
        return;
      }
      setPasswordPending(true);
      try {
        const result = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: revokeOthers,
        });
        if (result.error) {
          setPasswordError(authErrorMessage(result.error));
          return;
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevokeOthers(false);
        await dialog.inform({
          title: t("settings.security.updatedTitle"),
          description: revokeOthers
            ? t("settings.security.updatedOthers")
            : t("settings.security.updated"),
          confirmLabel: t("settings.security.ok"),
          tone: "success",
        });
      } catch (error) {
        setPasswordError(
          error instanceof ApiError ? error.message : t("settings.security.updateFailed"),
        );
      } finally {
        setPasswordPending(false);
      }
    },
    [confirmPassword, currentPassword, dialog, newPassword, revokeOthers, t],
  );

  return (
    <SecuritySettingsView
      currentPassword={currentPassword}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      revokeOthers={revokeOthers}
      passwordPending={passwordPending}
      passwordError={passwordError}
      onCurrentPasswordChange={setCurrentPassword}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onRevokeOthersChange={setRevokeOthers}
      onSubmit={onSubmit}
    />
  );
}
