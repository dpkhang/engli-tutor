"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { BrandLogo, cn, ThemeToggle } from "@engli-tutor/ui";
import { HeaderInstallButton } from "@/features/pwa";
import { useWorkspaceI18n } from "@/features/i18n";
import { AccountMenu } from "./account-menu";
import { isActivePath, type AppShellChromeProps } from "./app-shell.model";

/** Mobile (<850px) compact header, no inline navigation. Hidden from `nav` via CSS. */
export const AppShellMobileHeader = memo(function AppShellMobileHeader({
  localize,
  search,
  user,
  hasPaidPlan,
  displayName,
  initials,
  accountOpen,
  accountMenuRef,
  onToggleAccount,
  onSignOut,
}: Omit<AppShellChromeProps, "routePath" | "navItems">) {
  return (
    <header
      data-shell-chrome
      className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none nav:hidden group-data-chrome-hidden/shell:-translate-y-full"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={localize("/")}
            className="group flex shrink-0 items-center text-foreground"
          >
            <BrandLogo size={30} />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {search}
          <HeaderInstallButton />
          {user ? null : <ThemeToggle />}
          {user ? (
            <AccountMenu
              compact
              user={user}
              localize={localize}
              hasPaidPlan={hasPaidPlan}
              displayName={displayName}
              initials={initials}
              accountOpen={accountOpen}
              accountMenuRef={accountMenuRef}
              onToggleAccount={onToggleAccount}
              onSignOut={onSignOut}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
});

/** Mobile fixed bottom tab bar. Hidden from `nav` (850px) via CSS. */
export const AppShellMobileTabBar = memo(function AppShellMobileTabBar({
  routePath,
  navItems,
  localize,
}: Pick<AppShellChromeProps, "routePath" | "navItems" | "localize">) {
  const t = useWorkspaceI18n();
  return (
    <nav
      data-shell-chrome
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none nav:hidden group-has-data-not-found/shell:hidden group-data-chrome-hidden/shell:translate-y-full"
      aria-label={t("workspace.primaryNavigation")}
    >
      <div className="mx-auto flex h-(--tabbar-h) max-w-xl items-stretch">
        {navItems.map((item) => {
          const active = isActivePath(routePath, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={localize(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-12 place-items-center rounded-full transition-colors",
                  active && "bg-primary/12",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span className="max-w-full truncate">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
