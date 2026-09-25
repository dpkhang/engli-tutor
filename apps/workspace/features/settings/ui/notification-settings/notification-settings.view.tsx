"use client";

import { memo } from "react";
import { Bell, CreditCard } from "lucide-react";
import { CardTitle, Label, cn } from "@engli-tutor/ui";
import { SettingsCard, SettingsCardContent, SettingsCardHeader, SettingsPanel } from "../shared";

const REMINDER_SLOTS = Array.from({ length: 96 }, (_, index) => index * 15);

function formatReminder(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function Toggle({
  id,
  checked,
  disabled,
  onClick,
}: {
  id: string;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}

export type NotificationSettingsViewProps = {
  ready: boolean;
  notifyReminders: boolean;
  notifyTutor: boolean;
  notifyLessons: boolean;
  notifyCredits: boolean;
  notifyBilling: boolean;
  reminderMinutes: number;
  scheduleEnabled: boolean;
  pending: boolean;
  notice: string | null;
  onToggleReminders: () => void;
  onToggleTutor: () => void;
  onToggleLessons: () => void;
  onToggleCredits: () => void;
  onToggleBilling: () => void;
  onReminderTime: (minutes: number) => void;
};

export const NotificationSettingsView = memo(function NotificationSettingsView({
  ready,
  notifyReminders,
  notifyTutor,
  notifyLessons,
  notifyCredits,
  notifyBilling,
  reminderMinutes,
  scheduleEnabled,
  pending,
  notice,
  onToggleReminders,
  onToggleTutor,
  onToggleLessons,
  onToggleCredits,
  onToggleBilling,
  onReminderTime,
}: NotificationSettingsViewProps) {
  return (
    <SettingsPanel ready={ready}>
      <div className="space-y-4">
        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" /> Practice
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              On this laptop or phone. On iPhone, add EngliTutor to your Home Screen before this
              browser tab can receive them.
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="study-reminders">Daily study reminder</Label>
                <p className="text-sm text-muted-foreground">One notification a day, at the time you pick.</p>
              </div>
              <Toggle id="study-reminders" checked={notifyReminders} disabled={pending} onClick={onToggleReminders} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="open-lesson">Unfinished lesson</Label>
                <p className="text-sm text-muted-foreground">A nudge when a lesson is still in progress.</p>
              </div>
              <Toggle id="open-lesson" checked={notifyLessons} disabled={pending} onClick={onToggleLessons} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="tutor-alerts">Tutor replies</Label>
                <p className="text-sm text-muted-foreground">Shown when no EngliTutor window is in front.</p>
              </div>
              <Toggle id="tutor-alerts" checked={notifyTutor} disabled={pending} onClick={onToggleTutor} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Time</Label>
              <select
                id="reminder-time"
                value={reminderMinutes}
                disabled={!scheduleEnabled || pending}
                onChange={(event) => onReminderTime(Number(event.target.value))}
                className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-sm disabled:opacity-60"
              >
                {REMINDER_SLOTS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {formatReminder(minutes)}
                  </option>
                ))}
              </select>
            </div>
          </SettingsCardContent>
        </SettingsCard>

        <SettingsCard>
          <SettingsCardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Account
            </CardTitle>
          </SettingsCardHeader>
          <SettingsCardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="low-credits">Low practice credits</Label>
                <p className="text-sm text-muted-foreground">Once, when you have 10 credits or fewer left.</p>
              </div>
              <Toggle id="low-credits" checked={notifyCredits} disabled={pending} onClick={onToggleCredits} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="billing-alerts">Plan and payment</Label>
                <p className="text-sm text-muted-foreground">When a renewal fails or the plan ends.</p>
              </div>
              <Toggle id="billing-alerts" checked={notifyBilling} disabled={pending} onClick={onToggleBilling} />
            </div>
          </SettingsCardContent>
        </SettingsCard>

        {notice ? (
          <p className="text-sm text-rose-600 dark:text-rose-400" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </SettingsPanel>
  );
});
