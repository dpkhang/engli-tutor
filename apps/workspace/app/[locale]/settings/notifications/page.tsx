import { NotificationSettings } from "@/features/settings";
import { InstallAppCard } from "@/features/pwa";

export default function SettingsNotificationsPage() {
  return <NotificationSettings installCard={<InstallAppCard />} />;
}
