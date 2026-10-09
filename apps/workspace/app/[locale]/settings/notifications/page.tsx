import { NotificationSettings } from "@/features/settings";
import { InstallAppCard } from "@/features/pwa";

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-4">
      <InstallAppCard />
      <NotificationSettings />
    </div>
  );
}
