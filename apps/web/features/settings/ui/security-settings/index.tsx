"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useActionDialog } from "@engli-tutor/ui";
import { ApiError } from "@engli-tutor/api-client";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { SecuritySettingsView } from "./security-settings.view";

export function SecuritySettings() {
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
        setPasswordError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("New password and confirmation do not match.");
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
          title: "Password updated",
          description: revokeOthers
            ? "Your password was changed. Other devices have been signed out."
            : "Your password was changed successfully.",
          confirmLabel: "OK",
          tone: "success",
        });
      } catch (error) {
        setPasswordError(
          error instanceof ApiError ? error.message : "Couldn't update the password. Try again.",
        );
      } finally {
        setPasswordPending(false);
      }
    },
    [confirmPassword, currentPassword, dialog, newPassword, revokeOthers],
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
