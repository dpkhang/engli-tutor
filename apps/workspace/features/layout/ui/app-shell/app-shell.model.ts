import type { ReactNode, RefObject } from "react";
import { BookOpen, Gamepad2, House, Route, TrendingUp } from "lucide-react";

/**
 * Shared, layout-agnostic bits for the app shell.
 * Mobile (<1024px) and desktop (>=1024px) chrome live in separate views:
 * - app-shell.mobile.view.tsx  (compact header + bottom tab bar)
 * - app-shell.desktop.view.tsx (header with pill navigation)
 * Both are always rendered and gated with CSS (`lg:hidden` / `hidden lg:block`)
 * so there is no hydration mismatch or first-paint flash.
 */
export const PRIMARY_NAV = [
  { href: "/", key: "workspace.today", icon: House },
  { href: "/skills", key: "workspace.skills", icon: BookOpen },
  { href: "/games", key: "workspace.games", icon: Gamepad2 },
  { href: "/lessons", key: "workspace.myPath", icon: Route },
  { href: "/progress", key: "workspace.myProgress", icon: TrendingUp, private: true },
] as const;

export type PrimaryNavItem = (typeof PRIMARY_NAV)[number];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/lessons") {
    return pathname === "/lessons" || (pathname.startsWith("/lessons/") && !pathname.startsWith("/lessons/progress"));
  }
  if (href === "/progress") {
    return pathname === "/progress" || pathname.startsWith("/progress/");
  }
  if (href === "/skills") {
    return pathname === "/skills" || pathname.startsWith("/skills/");
  }
  if (href === "/games") {
    return pathname === "/games" || pathname.startsWith("/games/");
  }
  return pathname.startsWith(href);
}

export type AppShellViewProps = {
  children: ReactNode;
  routeReset: ReactNode;
  pathname: string;
  search: ReactNode;
  accountOpen: boolean;
  aiToolsOpen: boolean;
  aiLauncherExpanded: boolean;
  clipAiTools: boolean;
  aiToolsHeight: number;
  user: { name?: string | null; email?: string | null } | undefined;
  hasPaidPlan: boolean;
  displayName: string;
  initials: string;
  isPracticeExercise: boolean;
  showTranslate: boolean;
  showAiDock: boolean;
  translateOpen: boolean;
  /** Ref for the account menu rendered in the desktop header. */
  accountMenuRef: RefObject<HTMLDivElement | null>;
  /** Ref for the account menu rendered in the mobile header. */
  mobileAccountMenuRef: RefObject<HTMLDivElement | null>;
  aiToolsInnerRef: RefObject<HTMLDivElement | null>;
  onToggleAccount: () => void;
  onSignOut: () => void;
  onToggleAiDock: () => void;
  onAiToolsAnimationComplete: () => void;
};

/** Props shared by the mobile and desktop chrome views. */
export type AppShellChromeProps = {
  routePath: string;
  navItems: readonly PrimaryNavItem[];
  localize: (href: string) => string;
  search: ReactNode;
  user: AppShellViewProps["user"];
  hasPaidPlan: boolean;
  displayName: string;
  initials: string;
  accountOpen: boolean;
  accountMenuRef: RefObject<HTMLDivElement | null>;
  onToggleAccount: () => void;
  onSignOut: () => void;
};
