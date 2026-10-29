"use client";

import { memo, type ReactNode } from "react";
import { Bell, BellRing, CreditCard } from "lucide-react";
import { Button, CardTitle, Switch, cn } from "@engli-tutor/ui";
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
  SettingsErrorState,
  SettingsFormCard,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
} from "../shared";
import { useWorkspaceI18n } from "@/features/i18n";
import type { DevicePushState } from "@/features/notifications";

const STATE_LABEL: Record<DevicePushState, string | null> = {
  unknown: null,
  granted: "settings.notifications.statusGranted",
  default: "settings.notifications.statusDefault",
  denied: "settings.notifications.statusDenied",
  unsupported: "settings.notifications.statusUnsupported",
  "ios-install": "settings.notifications.statusIosInstall",
};

const STATE_HINT: Record<DevicePushState, string | null> = {
  unknown: null,
  granted: "settings.notifications.hintGranted",
  default: "settings.notifications.hintDefault",
  denied: "settings.notifications.blocked",
  unsupported: "settings.notifications.unsupported",
  "ios-install": "settings.notifications.iosHomeScreen",
};

const STATE_TONE: Record<DevicePushState, string> = {
  unknown: "bg-muted text-muted-foreground",
  granted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  default: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  denied: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  unsupported: "bg-muted text-muted-foreground",
  "ios-install": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

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
  loadFailed: boolean;
  onRetryLoad: () => void;
  values: NotificationValues;
  scheduleEnabled: boolean;
  isDirty: boolean;
  saving: boolean;
  disabled: boolean;
  testPending: boolean;
  pushState: DevicePushState;
  installCard?: ReactNode;
  notice: string | null;
  noticeTone: "error" | "success";
  onChange: (patch: Partial<NotificationValues>) => void;
  onSave: () => void;
  onReset: () => void;
  onSendTest: () => void;
};

export const NotificationSettingsView = memo(function NotificationSettingsView({
  ready,
  loadFailed,
  onRetryLoad,
  values,
  scheduleEnabled,
  isDirty,
  saving,
  disabled,
  testPending,
  pushState,
  installCard,
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
        {loadFailed ? (
          <SettingsErrorState
            message={t("settings.notifications.loadFailed")}
            retryLabel={t("settings.notifications.retry")}
            onRetry={onRetryLoad}
          />
        ) : null}
        <SettingsFormCard
          isDirty={isDirty}
          saving={saving}
          onSave={onSave}
          onReset={onReset}
        >
          <SettingsSection
            icon={<Bell className="size-5 text-primary" />}
            title={t("settings.notifications.learningTitle")}
            description={t("settings.notifications.learningDescription")}
          >
            {toggles.map((item) => (
              <SettingsRow
                key={item.key}
                label={item.label}
                description={item.description}
              >
                {({ controlId, labelId, descriptionId }) => (
                  <Switch
                    id={controlId}
                    checked={values[item.key]}
                    disabled={disabled || saving}
                    onCheckedChange={(checked) =>
                      onChange({ [item.key]: checked })
                    }
                    aria-labelledby={labelId}
                    aria-describedby={descriptionId}
                  />
                )}
              </SettingsRow>
            ))}
            <SettingsRow
              label={t("workspace.time")}
              description={t("settings.notifications.reminderTimeDescription")}
            >
              {({ controlId, labelId, descriptionId }) => (
                <select
                  id={controlId}
                  value={values.reminderMinutes}
                  disabled={!scheduleEnabled || disabled || saving}
                  onChange={(event) =>
                    onChange({ reminderMinutes: Number(event.target.value) })
                  }
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm disabled:opacity-60 lg:w-40"
                >
                  {REMINDER_SLOTS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {formatReminder(minutes)}
                    </option>
                  ))}
                </select>
              )}
            </SettingsRow>
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
                  onCheckedChange={(checked) =>
                    onChange({ notifyBilling: checked })
                  }
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                />
              )}
            </SettingsRow>
          </SettingsSection>
        </SettingsFormCard>

        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="size-5 text-primary" />{" "}
              {t("settings.notifications.deviceTitle")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("workspace.notificationDeviceDescription")}
            </p>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-4">
            <div className="space-y-1.5" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {t("settings.notifications.permissionLabel")}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATE_TONE[pushState],
                  )}
                >
                  {STATE_LABEL[pushState] ? t(STATE_LABEL[pushState]) : "—"}
                </span>
              </div>
              {STATE_HINT[pushState] ? (
                <p className="text-sm text-muted-foreground">
                  {t(STATE_HINT[pushState])}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t("settings.notifications.testHint")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full sm:w-auto"
                disabled={testPending || saving || pushState === "unsupported"}
                onClick={onSendTest}
              >
                <Bell className="size-4" />{" "}
                {t("settings.notifications.testButton")}
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
                role={noticeTone === "error" ? "alert" : "status"}
              >
                {notice}
              </p>
            ) : null}
          </SettingsCardContent>
        </SettingsCard>

        {installCard}
      </div>
    </SettingsPanel>
  );
});
