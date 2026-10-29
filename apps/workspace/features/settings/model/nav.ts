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

export type SettingsGroupId = "account" | "learning" | "app" | "plan";

export type SettingsSection = {
  href: string;
  group: SettingsGroupId;
  label: string;
  descriptionKey: string;
  icon: LucideIcon;
  match: "exact" | "prefix";
};

export const SETTINGS_NAV: SettingsSection[] = [
  {
    href: "/settings/account",
    group: "account",
    label: "Account",
    descriptionKey: "workspace.accountDescription",
    icon: UserRound,
    match: "prefix",
  },
  {
    href: "/settings/appearance",
    group: "app",
    label: "Appearance",
    descriptionKey: "workspace.appearanceDescription",
    icon: Monitor,
    match: "prefix",
  },
  {
    href: "/settings/learning",
    group: "learning",
    label: "Learning",
    descriptionKey: "workspace.learningDescription",
    icon: Target,
    match: "prefix",
  },
  {
    href: "/settings/notifications",
    group: "learning",
    label: "Notifications",
    descriptionKey: "workspace.notificationsDescription",
    icon: Bell,
    match: "prefix",
  },
  {
    href: "/settings/security",
    group: "account",
    label: "Security",
    descriptionKey: "workspace.securityDescription",
    icon: KeyRound,
    match: "prefix",
  },
  {
    href: "/settings/referrals",
    group: "plan",
    label: "Referrals",
    descriptionKey: "workspace.referralsDescription",
    icon: Gift,
    match: "prefix",
  },
  {
    href: "/settings/billing",
    group: "plan",
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

export const SETTINGS_GROUPS: { id: SettingsGroupId; labelKey: string }[] = [
  { id: "account", labelKey: "settings.groups.account" },
  { id: "learning", labelKey: "settings.groups.learning" },
  { id: "app", labelKey: "settings.groups.app" },
  { id: "plan", labelKey: "settings.groups.plan" },
];

const GROUP_ORDER: Record<SettingsGroupId, string[]> = {
  account: ["/settings/account", "/settings/security"],
  learning: ["/settings/learning", "/settings/notifications"],
  app: ["/settings/appearance"],
  plan: ["/settings/billing", "/settings/referrals"],
};

export function getSettingsNavGroups() {
  return SETTINGS_GROUPS.map((group) => ({
    ...group,
    items: GROUP_ORDER[group.id]
      .map((href) => SETTINGS_NAV.find((item) => item.href === href))
      .filter((item): item is SettingsSection => Boolean(item)),
  }));
}

/** True for the `/settings` overview page (locale already stripped). */
export function isSettingsOverview(pathname: string) {
  return pathname === "/settings" || pathname === "/settings/";
}

export function getSettingsSection(pathname: string): SettingsSection | undefined {
  return SETTINGS_NAV.find((item) => isSettingsNavActive(pathname, item));
}
