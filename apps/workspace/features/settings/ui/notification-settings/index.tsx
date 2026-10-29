"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationsApi,
  type NotificationPreferences,
} from "@/features/notifications";
import {
  dropSubscription,
  enableDevicePush,
  preferencePayload,
} from "@/features/notifications";
import { queryKeys } from "@/lib/query";
import { useWorkspaceI18n } from "@/features/i18n";
import { useSettingsDraft } from "../shared";
import { NotificationSettingsView } from "./notification-settings.view";
import { useDevicePushState } from "./use-device-push-state";

type Draft = Omit<NotificationPreferences, "configured" | "reminderTimeZone">;

function anyEnabled(prefs: Draft) {
  return (
    prefs.notifyReminders ||
    prefs.notifyTutor ||
    prefs.notifyLessons ||
    prefs.notifyCredits ||
    prefs.notifyBilling
  );
}

type PrefsDraft = {
  notifyReminders: boolean;
  notifyTutor: boolean;
  notifyLessons: boolean;
  notifyBilling: boolean;
  reminderMinutes: number;
};

export function NotificationSettings({
  installCard,
}: {
  installCard?: ReactNode;
}) {
  const t = useWorkspaceI18n();
  const queryClient = useQueryClient();
  const { state: pushState, refresh: refreshPushState } = useDevicePushState();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsApi.preferences,
  });
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"error" | "success">("error");
  const current = notificationsQuery.data;

  const saved = useMemo<PrefsDraft | null>(
    () =>
      current
        ? {
            notifyReminders: current.notifyReminders,
            notifyTutor: current.notifyTutor,
            notifyLessons: current.notifyLessons,
            notifyBilling: current.notifyBilling,
            reminderMinutes: current.reminderMinutes ?? 9 * 60,
          }
        : null,
    [current],
  );

  const persist = useCallback(
    async (next: PrefsDraft) => {
      if (!current) return;
      setNotice(null);
      const payload: Draft = {
        ...next,
        notifyCredits: current.notifyCredits,
      };
      try {
        if (anyEnabled(payload)) {
          const device = await enableDevicePush(t);
          if (!device.ok) throw new Error(device.message);
        }
        const result = await notificationsApi.savePreferences(
          preferencePayload(payload),
        );
        queryClient.setQueryData(queryKeys.notifications, result);
        if (!anyEnabled(result)) await dropSubscription();
        if (anyEnabled(result) && !result.configured) {
          setNoticeTone("error");
          setNotice(t("settings.notifications.notConfigured"));
        }
      } finally {
        refreshPushState();
      }
    },
    [current, queryClient, t, refreshPushState],
  );

  const { draft, patch, reset, isDirty, saving, save } = useSettingsDraft({
    saved,
    persist,
  });
  const scheduleEnabled = Boolean(
    draft?.notifyReminders || draft?.notifyLessons || current?.notifyCredits,
  );

  const sendTest = useCallback(async () => {
    setPending(true);
    setNotice(null);
    setNoticeTone("error");
    try {
      const device = await enableDevicePush(t);
      if (!device.ok) {
        setNotice(device.message);
        return;
      }
      await notificationsApi.sendTest();
      setNoticeTone("success");
      setNotice(t("settings.notifications.testSent"));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : t("settings.notifications.testFailed"),
      );
    } finally {
      setPending(false);
      refreshPushState();
    }
  }, [t, refreshPushState]);

  return (
    <NotificationSettingsView
      ready={notificationsQuery.isSuccess || notificationsQuery.isError}
      values={
        draft ?? {
          notifyReminders: false,
          notifyTutor: false,
          notifyLessons: false,
          notifyBilling: false,
          reminderMinutes: 9 * 60,
        }
      }
      scheduleEnabled={scheduleEnabled}
      isDirty={isDirty}
      saving={saving}
      disabled={!saved}
      testPending={pending}
      pushState={pushState}
      installCard={installCard}
      notice={notice}
      noticeTone={noticeTone}
      onChange={patch}
      onSave={() => void save()}
      onReset={reset}
      onSendTest={() => void sendTest()}
    />
  );
}
