import { workspaceApiClient } from "@/lib/workspace-api-client";

export type NotificationPreferences = {
  notifyReminders: boolean;
  notifyTutor: boolean;
  notifyLessons: boolean;
  notifyCredits: boolean;
  notifyBilling: boolean;
  reminderMinutes: number | null;
  reminderTimeZone: string | null;
  configured: boolean;
};

export type PushKeys = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export const notificationsApi = {
  publicKey: () =>
    workspaceApiClient.get<{ publicKey: string | null; configured: boolean }>("/api/notifications/public-key"),
  preferences: () => workspaceApiClient.get<NotificationPreferences>("/api/notifications/preferences"),
  savePreferences: (input: Omit<NotificationPreferences, "configured">) =>
    workspaceApiClient.put<NotificationPreferences>("/api/notifications/preferences", input),
  subscribe: (input: PushKeys) =>
    workspaceApiClient.post<{ ok: true }>("/api/notifications/subscriptions", input),
  sendTest: () => workspaceApiClient.post<{ sent: number }>("/api/notifications/test"),
  unsubscribe: (endpoint: string) =>
    workspaceApiClient.delete<{ ok: true }>("/api/notifications/subscriptions", {
      body: JSON.stringify({ endpoint }),
    }),
};
