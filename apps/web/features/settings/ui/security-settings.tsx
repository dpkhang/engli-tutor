"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  CardTitle,
  Input,
  Label,
  useActionDialog,
} from "@landing-page-generator/ui";
import { ApiError } from "@landing-page-generator/api-client";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { SettingsCard, SettingsCardContent, SettingsCardHeader } from "./settings-card";

export function SecuritySettings() {
  const dialog = useActionDialog();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const changePassword = async (event: FormEvent) => {
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
  };

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" /> Password
        </CardTitle>
      </SettingsCardHeader>
      <SettingsCardContent>
        <form className="space-y-3" onSubmit={(event) => void changePassword(event)}>
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
              onChange={(event) => setRevokeOthers(event.target.checked)}
            />
            Sign out other devices after changing password
          </label>
          {passwordError ? (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={passwordPending} className="h-11 w-full sm:w-auto">
            {passwordPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </SettingsCardContent>
    </SettingsCard>
  );
}
