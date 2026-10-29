"use client";

import { memo } from "react";
import { Bell, CreditCard } from "lucide-react";
import { Button, Label, Switch, cn } from "@engli-tutor/ui";
import { SettingsFormCard, SettingsPanel, SettingsRow, SettingsSection } from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";

const REMINDER_SLOTS = Array.from({ length: 96 }, (_, index) => index * 15);

function formatReminder(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export type NotificationValues = {
  notifyReminders: boolean;
  notifyTutor: boolean;
  notifyLessons: boolean;
  notifyBilling: boolean;
  reminderMinutes: number;
};

export type NotificationSettingsViewProps = {
  ready: boolean;
  values: NotificationValues;
  scheduleEnabled: boolean;
  isDirty: boolean;
  saving: boolean;
  disabled: boolean;
  testPending: boolean;
  notice: string | null;
  noticeTone: "error" | "success";
  onChange: (patch: Partial<NotificationValues>) => void;
  onSave: () => void;
  onReset: () => void;
  onSendTest: () => void;
};

export const NotificationSettingsView = memo(function NotificationSettingsView({
  ready,
  values,
  scheduleEnabled,
  isDirty,
  saving,
  disabled,
  testPending,
  notice,
  noticeTone,
  onChange,
  onSave,
  onReset,
  onSendTest,
}: NotificationSettingsViewProps) {
  const t = useWorkspaceI18n();
  const toggles: Array<{
    key: "notifyReminders" | "notifyLessons" | "notifyTutor";
    label: string;
    description: string;
  }> = [
    {
      key: "notifyReminders",
      label: t("workspace.dailyStudyReminder"),
      description: t("workspace.dailyStudyReminderDescription"),
    },
    {
      key: "notifyLessons",
      label: t("workspace.unfinishedLesson"),
      description: t("workspace.unfinishedLessonDescription"),
    },
    {
      key: "notifyTutor",
      label: t("workspace.tutorReplies"),
      description: t("workspace.tutorRepliesDescription"),
    },
  ];
  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
        <SettingsFormCard isDirty={isDirty} saving={saving} onSave={onSave} onReset={onReset}>
          <SettingsSection
            icon={<Bell className="size-5 text-primary" />}
            title={t("workspace.practice")}
            description={t("workspace.notificationDeviceDescription")}
          >
            {toggles.map((item) => (
              <SettingsRow key={item.key} label={item.label} description={item.description}>
                {({ controlId, labelId, descriptionId }) => (
                  <Switch
                    id={controlId}
                    checked={values[item.key]}
                    disabled={disabled || saving}
                    onCheckedChange={(checked) => onChange({ [item.key]: checked })}
                    aria-labelledby={labelId}
                    aria-describedby={descriptionId}
                  />
                )}
              </SettingsRow>
            ))}
            <div className="space-y-2">
              <Label htmlFor="reminder-time">{t("workspace.time")}</Label>
              <select
                id="reminder-time"
                value={values.reminderMinutes}
                disabled={!scheduleEnabled || disabled || saving}
                onChange={(event) => onChange({ reminderMinutes: Number(event.target.value) })}
                className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-sm disabled:opacity-60"
              >
                {REMINDER_SLOTS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {formatReminder(minutes)}
                  </option>
                ))}
              </select>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<CreditCard className="size-5 text-primary" />}
            title={t("workspace.account")}
          >
            <SettingsRow
              label={t("workspace.planPayment")}
              description={t("workspace.planPaymentDescription")}
            >
              {({ controlId, labelId, descriptionId }) => (
                <Switch
                  id={controlId}
                  checked={values.notifyBilling}
                  disabled={disabled || saving}
                  onCheckedChange={(checked) => onChange({ notifyBilling: checked })}
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                />
              )}
            </SettingsRow>
          </SettingsSection>
        </SettingsFormCard>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("settings.notifications.testHint")}</p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={testPending || saving}
            onClick={onSendTest}
          >
            <Bell className="size-4" /> {t("settings.notifications.testButton")}
          </Button>
        </div>

        {notice ? (
          <p
            className={cn(
              "text-sm",
              noticeTone === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
            role="status"
          >
            {notice}
          </p>
        ) : null}
      </div>
    </SettingsPanel>
  );
});
