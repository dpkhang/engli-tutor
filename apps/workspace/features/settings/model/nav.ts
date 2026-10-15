import {
  Bell,
  CreditCard,
  Gift,
  KeyRound,
  Monitor,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection = {
  href: string;
  label: string;
  descriptionKey: string;
  icon: LucideIcon;
  match: "exact" | "prefix";
};

export const SETTINGS_NAV: SettingsSection[] = [
  {
    href: "/settings/account",
    label: "Account",
    descriptionKey: "workspace.accountDescription",
    icon: UserRound,
    match: "prefix",
  },
  {
    href: "/settings",
    label: "Appearance",
    descriptionKey: "workspace.appearanceDescription",
    icon: Monitor,
    match: "exact",
  },
  {
    href: "/settings/learning",
    label: "Learning",
    descriptionKey: "workspace.learningDescription",
    icon: Target,
    match: "prefix",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    descriptionKey: "workspace.notificationsDescription",
    icon: Bell,
    match: "prefix",
  },
  {
    href: "/settings/security",
    label: "Security",
    descriptionKey: "workspace.securityDescription",
    icon: KeyRound,
    match: "prefix",
  },
  {
    href: "/settings/referrals",
    label: "Referrals",
    descriptionKey: "workspace.referralsDescription",
    icon: Gift,
    match: "prefix",
  },
  {
    href: "/settings/billing",
    label: "Billing",
    descriptionKey: "workspace.billingDescription",
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
