import type { ReactNode } from "react";
import { Cookie, ShieldCheck } from "lucide-react";
import type { SettingsSection } from "../../model/nav";

export const SIDEBAR_PRIVACY = [
  { href: "/policy", key: "workspace.privacyPolicy", icon: ShieldCheck },
  { href: "/policy/cookies", key: "workspace.cookiePolicy", icon: Cookie },
];

export function settingsNavLabelKey(item: Pick<SettingsSection, "href">) {
  return `workspace.${item.href.split("/").at(-1)}`;
}

export type SettingsShellViewProps = {
  pathname: string;
  isOverview: boolean;
  section: SettingsSection | undefined;
  children: ReactNode;
};

export type SettingsNavProps = {
  pathname: string;
  isOverview: boolean;
};
