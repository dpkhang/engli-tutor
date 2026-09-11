import {
  CreditCard,
  KeyRound,
  Monitor,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  match: "exact" | "prefix";
};

export const SETTINGS_NAV: SettingsSection[] = [
  {
    href: "/settings/account",
    label: "Account",
    description: "Name, work details, and learning profile",
    icon: UserRound,
    match: "prefix",
  },
  {
    href: "/settings",
    label: "Appearance",
    description: "Theme, color, text size, and motion",
    icon: Monitor,
    match: "exact",
  },
  {
    href: "/settings/learning",
    label: "Learning",
    description: "Level, playback speed, and listening",
    icon: Target,
    match: "prefix",
  },
  {
    href: "/settings/security",
    label: "Security",
    description: "Password and signed-in devices",
    icon: KeyRound,
    match: "prefix",
  },
  {
    href: "/settings/billing",
    label: "Billing",
    description: "Plan, credits, and payments",
    icon: CreditCard,
    match: "prefix",
  },
];

export function isSettingsNavActive(pathname: string, item: SettingsSection) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getSettingsSection(pathname: string) {
  return (
    SETTINGS_NAV.find((item) => isSettingsNavActive(pathname, item)) ??
    SETTINGS_NAV.find((item) => item.href === "/settings")
  );
}
