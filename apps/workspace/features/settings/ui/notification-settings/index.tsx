"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type NotificationPreferences } from "@/features/notifications/api";
import { dropSubscription, enableDevicePush, preferencePayload } from "@/features/notifications/push-client";
import { queryKeys } from "@/lib/query";
import { NotificationSettingsView } from "./notification-settings.view";

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

export function NotificationSettings() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsApi.preferences,
  });
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [timeDraft, setTimeDraft] = useState<number | null>(null);
  const current = notificationsQuery.data;
  const reminderMinutes = timeDraft ?? current?.reminderMinutes ?? 9 * 60;
  const scheduleEnabled = Boolean(current?.notifyReminders || current?.notifyLessons || current?.notifyCredits);

  const persist = useCallback(
    async (next: Draft) => {
      setPending(true);
      setNotice(null);
      try {
        if (anyEnabled(next)) {
          const device = await enableDevicePush();
          if (!device.ok) {
            setNotice(device.message);
            return;
          }
        }
        const saved = await notificationsApi.savePreferences(preferencePayload(next));
        queryClient.setQueryData(queryKeys.notifications, saved);
        if (!anyEnabled(saved)) await dropSubscription();
        if (anyEnabled(saved) && !saved.configured) {
          setNotice("Notifications are not available on this server yet.");
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not save notifications.");
      } finally {
        setPending(false);
      }
    },
    [queryClient],
  );

  const save = useCallback(
    (patch: Partial<Draft>) => {
      if (!current) return;
      const turningScheduleOn =
        (patch.notifyReminders || patch.notifyLessons || patch.notifyCredits) &&
        !(current.notifyReminders || current.notifyLessons || current.notifyCredits);
      void persist({
        notifyReminders: current.notifyReminders,
        notifyTutor: current.notifyTutor,
        notifyLessons: current.notifyLessons,
        notifyCredits: current.notifyCredits,
        notifyBilling: current.notifyBilling,
        reminderMinutes: turningScheduleOn ? reminderMinutes : current.reminderMinutes,
        ...patch,
      });
    },
    [current, persist, reminderMinutes],
  );

  const onReminderTime = useCallback(
    (minutes: number) => {
      setTimeDraft(minutes);
      if (!current || !(current.notifyReminders || current.notifyLessons || current.notifyCredits)) return;
      void persist({
        notifyReminders: current.notifyReminders,
        notifyTutor: current.notifyTutor,
        notifyLessons: current.notifyLessons,
        notifyCredits: current.notifyCredits,
        notifyBilling: current.notifyBilling,
        reminderMinutes: minutes,
      });
    },
    [current, persist],
  );

  return (
    <NotificationSettingsView
      ready={notificationsQuery.isSuccess || notificationsQuery.isError}
      notifyReminders={current?.notifyReminders ?? false}
      notifyTutor={current?.notifyTutor ?? false}
      notifyLessons={current?.notifyLessons ?? false}
      notifyCredits={current?.notifyCredits ?? false}
      notifyBilling={current?.notifyBilling ?? false}
      reminderMinutes={reminderMinutes}
      scheduleEnabled={scheduleEnabled}
      pending={pending || notificationsQuery.isLoading}
      notice={notice}
      onToggleReminders={() => save({ notifyReminders: !current?.notifyReminders })}
      onToggleTutor={() => save({ notifyTutor: !current?.notifyTutor })}
      onToggleLessons={() => save({ notifyLessons: !current?.notifyLessons })}
      onToggleCredits={() => save({ notifyCredits: !current?.notifyCredits })}
      onToggleBilling={() => save({ notifyBilling: !current?.notifyBilling })}
      onReminderTime={onReminderTime}
    />
  );
}
