"use client";

import { memo } from "react";
import { cn } from "@engli-tutor/ui";
import { getPathLocale, withLocalePath } from "@/lib/locale-path";
import { AiDock } from "./ai-dock";
import { AppShellDesktopHeader } from "./app-shell.desktop.view";
import {
  AppShellMobileHeader,
  AppShellMobileTabBar,
} from "./app-shell.mobile.view";
import { PRIMARY_NAV, type AppShellViewProps } from "./app-shell.model";

export type { AppShellViewProps } from "./app-shell.model";

/**
 * Composes the shell: separate mobile / desktop chrome (CSS-gated at `lg`),
 * a single AI dock and a single content area (children rendered once).
 */
export const AppShellView = memo(function AppShellView({
  children,
  routeReset,
  pathname,
  search,
  accountOpen,
  chromeHidden,
  aiToolsOpen,
  aiLauncherExpanded,
  clipAiTools,
  aiToolsHeight,
  user,
  hasPaidPlan,
  displayName,
  initials,
  isPracticeExercise,
  showTranslate,
  showAiDock,
  translateOpen,
  accountMenuRef,
  mobileAccountMenuRef,
  aiToolsInnerRef,
  onToggleAccount,
  onSignOut,
  onToggleAiDock,
  onAiToolsAnimationComplete,
}: AppShellViewProps) {
  const locale = getPathLocale(pathname);
  const localize = (href: string) => withLocalePath(href, locale);
  const routePath = locale
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;
  const navItems = PRIMARY_NAV.filter(
    (item) => !("private" in item && item.private) || Boolean(user),
  );
  const hideHeader = routePath.startsWith("/policy");
  // Exercise pages have their own fixed action bar at the bottom.
  const showBottomTabs = !hideHeader && !isPracticeExercise;

  const chrome = {
    localize,
    search,
    user,
    hasPaidPlan,
    displayName,
    initials,
    accountOpen,
    onToggleAccount,
    onSignOut,
  };

  return (
    <div
      data-chrome-hidden={chromeHidden && !hideHeader ? "" : undefined}
      className={cn(
        "workspace-background group/shell relative min-h-svh",
        showBottomTabs && "[--tabbar-h:4rem] nav:[--tabbar-h:0px]",
      )}
    >
      {routeReset}
      {hideHeader ? null : (
        <>
          <AppShellMobileHeader
            {...chrome}
            accountMenuRef={mobileAccountMenuRef}
          />
          <AppShellDesktopHeader
            {...chrome}
            routePath={routePath}
            navItems={navItems}
            accountMenuRef={accountMenuRef}
          />
        </>
      )}

      {showBottomTabs ? (
        <AppShellMobileTabBar
          routePath={routePath}
          navItems={navItems}
          localize={localize}
        />
      ) : null}

      <AiDock
        localize={localize}
        raiseFabForExerciseBar={isPracticeExercise}
        showAiDock={showAiDock}
        showTranslate={showTranslate}
        aiToolsOpen={aiToolsOpen}
        aiLauncherExpanded={aiLauncherExpanded}
        clipAiTools={clipAiTools}
        aiToolsHeight={aiToolsHeight}
        aiToolsInnerRef={aiToolsInnerRef}
        onToggleAiDock={onToggleAiDock}
        onAiToolsAnimationComplete={onAiToolsAnimationComplete}
      />

      <div
        className={cn(
          "transition-[padding] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          translateOpen && "pb-[58dvh] lg:pr-120 lg:pb-0",
        )}
      >
        <main
          className={cn(
            "mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-4 pt-8 sm:px-6 sm:pt-10",
            showAiDock
              ? "pb-[calc(var(--tabbar-h,0px)+6rem+env(safe-area-inset-bottom))] sm:pb-[calc(var(--tabbar-h,0px)+6rem)]"
              : "pb-[calc(var(--tabbar-h,0px)+2.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(var(--tabbar-h,0px)+4rem)]",
            "group-has-data-not-found/shell:pb-10 group-has-data-not-found/shell:sm:pb-16",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
});
