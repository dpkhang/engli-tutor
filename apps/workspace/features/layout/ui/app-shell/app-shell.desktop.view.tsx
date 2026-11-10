"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { BrandLogo, cn, ThemeToggle } from "@engli-tutor/ui";
import { HeaderInstallButton } from "@/features/pwa";
import { useWorkspaceI18n } from "@/features/i18n";
import { AccountMenu } from "./account-menu";
import { isActivePath, type AppShellChromeProps } from "./app-shell.model";

/** Desktop (>=850px) header with pill navigation. Hidden below `nav` via CSS. */
export const AppShellDesktopHeader = memo(function AppShellDesktopHeader({
  routePath,
  navItems,
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
}: AppShellChromeProps) {
  const t = useWorkspaceI18n();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border/80 bg-background/90 backdrop-blur-md nav:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={localize("/")}
            className="group flex shrink-0 items-center text-foreground"
          >
            <BrandLogo size={30} />
          </Link>

          <nav
            className="ml-4 flex items-center gap-1"
            aria-label={t("workspace.primaryNavigation")}
          >
            {navItems.map((item) => {
              const active = isActivePath(routePath, item.href);
              return (
                <Link
                  key={item.href}
                  href={localize(item.href)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {search}
          <HeaderInstallButton />
          {user ? null : <ThemeToggle />}
          {user ? (
            <AccountMenu
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
