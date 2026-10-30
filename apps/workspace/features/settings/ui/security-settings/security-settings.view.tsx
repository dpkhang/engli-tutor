"use client";

import { memo, type FormEvent } from "react";
import { KeyRound, MonitorSmartphone } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Label,
  Switch,
} from "@engli-tutor/ui";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsRow,
  SettingsSection,
} from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

export type SessionItem = {
  id: string;
  token: string;
  label: string;
  ip: string | null;
  lastActive: string | null;
  isCurrent: boolean;
};

export type SecuritySettingsViewProps = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOthers: boolean;
  passwordPending: boolean;
  passwordError: string | null;
  sessions: SessionItem[] | null;
  sessionsError: string | null;
  actionError: string | null;
  pendingToken: string | null;
  revokingAll: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRevokeOthersChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  onRetryLoad: () => void;
  onRevokeSession: (session: SessionItem) => void;
  onRevokeAll: () => void;
};

export const SecuritySettingsView = memo(function SecuritySettingsView({
  currentPassword,
  newPassword,
  confirmPassword,
  revokeOthers,
  passwordPending,
  passwordError,
  sessions,
  sessionsError,
  actionError,
  pendingToken,
  revokingAll,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onRevokeOthersChange,
  onSubmit,
  onRetryLoad,
  onRevokeSession,
  onRevokeAll,
}: SecuritySettingsViewProps) {
  const t = useWorkspaceI18n();
  const hasOthers = sessions?.some((s) => !s.isCurrent) ?? false;
  const busy = revokingAll || pendingToken !== null;

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsCardContent className="pt-4">
          <SettingsSection
            icon={<KeyRound className="size-5 text-primary" />}
            title={t("workspace.password")}
            description={t("settings.security.passwordDescription")}
          >
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="current-password">
                  {t("workspace.currentPassword")}
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) =>
                    onCurrentPasswordChange(event.target.value)
                  }
                  required
                  className="h-11 text-base sm:h-9 sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">
                  {t("workspace.newPassword")}
                </Label>
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
                <Label htmlFor="confirm-password">
                  {t("workspace.confirmNewPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    onConfirmPasswordChange(event.target.value)
                  }
                  minLength={8}
                  required
                  className="h-11 text-base sm:h-9 sm:text-sm"
                />
              </div>
              <SettingsRow
                label={t("workspace.signOutOtherDevices")}
                description={t("settings.security.revokeOthersDescription")}
              >
                {({ controlId, labelId, descriptionId }) => (
                  <Switch
                    id={controlId}
                    checked={revokeOthers}
                    onCheckedChange={onRevokeOthersChange}
                    aria-labelledby={labelId}
                    aria-describedby={descriptionId}
                  />
                )}
              </SettingsRow>
              {passwordError ? (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="submit"
                disabled={passwordPending}
                className="h-11 w-full sm:w-auto"
              >
                {passwordPending
                  ? t("workspace.updating")
                  : t("workspace.updatePassword")}
              </Button>
            </form>
          </SettingsSection>
        </SettingsCardContent>
      </SettingsCard>

      <SettingsCard>
        <SettingsCardContent className="pt-4">
          <SettingsSection
            icon={<MonitorSmartphone className="size-5 text-primary" />}
            title={t("settings.security.sessionsTitle")}
            description={t("settings.security.sessionsDescription")}
          >
            {sessionsError ? (
              <Alert variant="destructive" role="alert">
                <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{sessionsError}</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRetryLoad}
                    className="h-11 w-full sm:w-auto"
                  >
                    {t("settings.security.retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : sessions === null ? (
              <p className="text-sm text-muted-foreground" role="status">
                {t("settings.security.sessionsLoading")}
              </p>
            ) : (
              <>
                <ul className="divide-y rounded-2xl border">
                  {sessions.map((session) => {
                    const meta = [
                      session.ip
                        ? t("settings.security.ipAddress").replace(
                            "{ip}",
                            session.ip,
                          )
                        : null,
                      session.lastActive
                        ? t("settings.security.lastActive").replace(
                            "{date}",
                            session.lastActive,
                          )
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li
                        key={session.id}
                        className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="min-w-0 break-words text-sm font-medium">
                              {session.label}
                            </span>
                            {session.isCurrent ? (
                              <Badge variant="secondary">
                                {t("settings.security.thisDevice")}
                              </Badge>
                            ) : null}
                          </div>
                          {meta ? (
                            <p className="break-all text-xs text-muted-foreground">
                              {meta}
                            </p>
                          ) : null}
                        </div>
                        {session.isCurrent ? null : (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => onRevokeSession(session)}
                            className="h-11 w-full shrink-0 sm:w-auto"
                          >
                            {t("settings.security.signOut")}
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {hasOthers ? null : (
                  <p className="text-sm text-muted-foreground">
                    {t("settings.security.noOtherSessions")}
                  </p>
                )}
                {actionError ? (
                  <Alert variant="destructive" role="alert">
                    <AlertDescription>{actionError}</AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasOthers || busy}
                  onClick={onRevokeAll}
                  className="h-11 w-full text-destructive sm:w-auto"
                >
                  {t("settings.security.signOutAll")}
                </Button>
              </>
            )}
          </SettingsSection>
        </SettingsCardContent>
      </SettingsCard>
    </div>
  );
});
