"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useActionDialog } from "@engli-tutor/ui";
import { ApiError } from "@engli-tutor/api-client";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { useWorkspaceI18n, useWorkspaceLocale } from "@/features/i18n";
import { describeUserAgent, sortSessions } from "../../model/sessions";
import { SecuritySettingsView, type SessionItem } from "./security-settings.view";

type RawSession = {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export function SecuritySettings() {
  const t = useWorkspaceI18n();
  const locale = useWorkspaceLocale();
  const dialog = useActionDialog();
  const { data: sessionData } = authClient.useSession();
  const currentId = sessionData?.session?.id ?? null;
  const currentToken = sessionData?.session?.token ?? null;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [rawSessions, setRawSessions] = useState<RawSession[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsError(null);
    try {
      const result = await authClient.listSessions();
      if (result.error) {
        setSessionsError(authErrorMessage(result.error));
        return;
      }
      setRawSessions((result.data ?? []) as RawSession[]);
    } catch {
      setSessionsError(t("settings.security.sessionsLoadFailed"));
    }
  }, [t]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const retryLoad = useCallback(() => {
    setRawSessions(null);
    void loadSessions();
  }, [loadSessions]);

  const sessions = useMemo<SessionItem[] | null>(() => {
    if (!rawSessions) return null;
    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return sortSessions(rawSessions, currentId).map((s) => {
      const { browser, os } = describeUserAgent(s.userAgent);
      const label = [browser, os].filter(Boolean).join(" · ");
      const when = s.updatedAt ?? s.createdAt;
      const time = when ? new Date(when) : null;
      return {
        id: s.id,
        token: s.token,
        label: label || t("settings.security.unknownDevice"),
        ip: s.ipAddress || null,
        lastActive: time && !Number.isNaN(time.getTime()) ? formatter.format(time) : null,
        isCurrent: s.id === currentId || (currentToken !== null && s.token === currentToken),
      };
    });
  }, [currentId, currentToken, locale, rawSessions, t]);

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
      const confirmed = await dialog.confirm({
        title: t("settings.security.confirmChangeTitle"),
        description: revokeOthers
          ? t("settings.security.confirmChangeOthers")
          : t("settings.security.confirmChange"),
        confirmLabel: t("workspace.updatePassword"),
        cancelLabel: t("settings.security.cancel"),
        tone: "default",
      });
      if (!confirmed) return;
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
        const revoked = revokeOthers;
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevokeOthers(false);
        if (revoked) void loadSessions();
        await dialog.inform({
          title: t("settings.security.updatedTitle"),
          description: revoked
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
    [confirmPassword, currentPassword, dialog, loadSessions, newPassword, revokeOthers, t],
  );

  const onRevokeSession = useCallback(
    async (session: SessionItem) => {
      setActionError(null);
      const confirmed = await dialog.confirm({
        title: t("settings.security.revokeTitle"),
        description: t("settings.security.revokeDescription").replace("{device}", session.label),
        confirmLabel: t("settings.security.signOut"),
        cancelLabel: t("settings.security.cancel"),
        tone: "danger",
      });
      if (!confirmed) return;
      setPendingToken(session.token);
      try {
        const result = await authClient.revokeSession({ token: session.token });
        if (result.error) {
          setActionError(authErrorMessage(result.error));
          return;
        }
        await loadSessions();
      } catch (error) {
        setActionError(
          error instanceof ApiError ? error.message : t("settings.security.revokeFailed"),
        );
      } finally {
        setPendingToken(null);
      }
    },
    [dialog, loadSessions, t],
  );

  const onRevokeAll = useCallback(async () => {
    setActionError(null);
    const confirmed = await dialog.confirm({
      title: t("settings.security.revokeAllTitle"),
      description: t("settings.security.revokeAllDescription"),
      confirmLabel: t("settings.security.signOutAll"),
      cancelLabel: t("settings.security.cancel"),
      tone: "danger",
    });
    if (!confirmed) return;
    setRevokingAll(true);
    try {
      const result = await authClient.revokeOtherSessions();
      if (result.error) {
        setActionError(authErrorMessage(result.error));
        return;
      }
      await loadSessions();
      await dialog.inform({
        title: t("settings.security.revokedAllTitle"),
        description: t("settings.security.revokedAll"),
        confirmLabel: t("settings.security.ok"),
        tone: "success",
      });
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t("settings.security.revokeFailed"),
      );
    } finally {
      setRevokingAll(false);
    }
  }, [dialog, loadSessions, t]);

  return (
    <SecuritySettingsView
      currentPassword={currentPassword}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      revokeOthers={revokeOthers}
      passwordPending={passwordPending}
      passwordError={passwordError}
      sessions={sessions}
      sessionsError={sessionsError}
      actionError={actionError}
      pendingToken={pendingToken}
      revokingAll={revokingAll}
      onCurrentPasswordChange={setCurrentPassword}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onRevokeOthersChange={setRevokeOthers}
      onSubmit={onSubmit}
      onRetryLoad={retryLoad}
      onRevokeSession={onRevokeSession}
      onRevokeAll={onRevokeAll}
    />
  );
}
