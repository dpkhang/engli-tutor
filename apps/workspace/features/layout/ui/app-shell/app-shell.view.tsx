"use client";

import { memo, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Crown,
  Gauge,
  LogOut,
  Menu,
  MessageCircle,
  Mic2,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Button, BrandLogo, cn, ThemeToggle } from "@engli-tutor/ui";
import { AnimatePresence, motion } from "motion/react";
import { FloatingTranslate } from "@/features/translate";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { WorkspaceLanguageSwitcher } from "@/features/i18n/workspace-language-switcher";
import { withLocalePath, getPathLocale } from "@/lib/locale-path";

const PRIMARY_NAV = [
  { href: "/", key: "workspace.today" },
  { href: "/skills", key: "workspace.skills" },
  { href: "/games", key: "workspace.games" },
  { href: "/lessons", key: "workspace.myPath" },
  { href: "/progress", key: "workspace.myProgress", private: true },
] as const;

function isActivePath(pathname: string, href: string) {
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
  mobileOpen: boolean;
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
  accountMenuRef: RefObject<HTMLDivElement | null>;
  aiToolsInnerRef: RefObject<HTMLDivElement | null>;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  onToggleAccount: () => void;
  onSignOut: () => void;
  onToggleAiDock: () => void;
  onAiToolsAnimationComplete: () => void;
};

export const AppShellView = memo(function AppShellView({
  children,
  routeReset,
  pathname,
  search,
  mobileOpen,
  accountOpen,
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
  aiToolsInnerRef,
  onToggleMobile,
  onCloseMobile,
  onToggleAccount,
  onSignOut,
  onToggleAiDock,
  onAiToolsAnimationComplete,
}: AppShellViewProps) {
  const t = useWorkspaceI18n();
  const locale = getPathLocale(pathname);
  const localize = (href: string) => withLocalePath(href, locale);
  const raiseFabForExerciseBar = isPracticeExercise;
  const navItems = PRIMARY_NAV.filter((item) => !("private" in item && item.private) || Boolean(user));
  const hideHeader = pathname.startsWith("/policy");

  return (
    <div className="workspace-background group/shell relative min-h-svh">
      {routeReset}
      {hideHeader ? null : (
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={mobileOpen ? t("workspace.closeMenu") : t("workspace.openMenu")}
              onClick={onToggleMobile}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>

            <Link
              href={localize("/")}
              className="group flex shrink-0 items-center text-foreground"
            >
              <BrandLogo size={30} />
            </Link>

            <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label={t("workspace.primaryNavigation")}>
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
            {user ? null : <ThemeToggle />}
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left hover:bg-muted"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={onToggleAccount}
                >
                  <span
                    className={cn(
                      "relative grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
                      hasPaidPlan &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_18px_-5px_hsl(var(--primary))]",
                    )}
                  >
                    {initials}
                    {hasPaidPlan ? (
                      <span className="absolute -top-1.5 -left-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-sm">
                        <Crown className="size-2.5 fill-current" strokeWidth={2} />
                      </span>
                    ) : null}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "hidden size-3.5 text-muted-foreground transition-transform sm:block",
                      accountOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {accountOpen ? (
                    <motion.div
                      role="menu"
                      className="absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16 }}
                    >
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-semibold">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href={localize("/settings/account")}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <UserRound className="size-4 text-muted-foreground" />
                          {t("workspace.account")}
                        </Link>
                        <Link
                          href={localize("/payments")}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <Gauge className="size-4 text-muted-foreground" />
                          {t("workspace.plans")}
                        </Link>
                        <Link
                          href={localize("/settings")}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <Settings className="size-4 text-muted-foreground" />
                          {t("workspace.settings")}
                        </Link>
                      </div>
                      <div className="border-t border-border pt-1">
                        <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                          <span className="text-sm text-muted-foreground">{t("workspace.language")}</span>
                          <WorkspaceLanguageSwitcher />
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={onSignOut}
                        >
                          <LogOut className="size-4" />
                          {t("workspace.signOut")}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              className="border-t border-border bg-background px-4 py-3 lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label={t("workspace.mobileMenu")}
            >
              <div className="mx-auto flex max-w-6xl flex-col gap-1 pb-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium",
                      isActivePath(pathname, item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={onCloseMobile}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>
      )}

      {showAiDock || showTranslate ? (
      <div
        className="pointer-events-none fixed z-60 flex w-max max-w-[calc(100vw-2rem)] flex-col items-end group-has-data-not-found/shell:hidden"
        style={{
          right: "max(1rem, env(safe-area-inset-right, 0px))",
          bottom: raiseFabForExerciseBar
            ? "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))"
            : "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {showTranslate ? (
          <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-0">
            <FloatingTranslate />
          </div>
        ) : null}

        {showAiDock ? (
          <>
        <motion.button
          type="button"
          onClick={onToggleAiDock}
          className={cn(
            "pointer-events-auto relative flex h-12 max-w-[calc(100vw-2rem)] items-center overflow-hidden rounded-full shadow-[0_10px_28px_-8px_hsl(var(--primary)/0.65)] transition-[background-color,color,border-color] duration-300 ease-out",
            aiLauncherExpanded
              ? "justify-between border border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
              : "justify-center border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
          initial={false}
          animate={{ width: aiLauncherExpanded ? 160 : 48 }}
          transition={{ width: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          aria-expanded={aiToolsOpen}
          aria-label={aiToolsOpen ? t("workspace.hideAiTools") : t("workspace.showAiTools")}
          title={aiToolsOpen ? t("workspace.hideAiTools") : t("workspace.showAiTools")}
        >
          <motion.span
            className="absolute inset-0 grid place-items-center"
            animate={{
              opacity: aiLauncherExpanded ? 0 : 1,
              rotate: aiLauncherExpanded ? 45 : 0,
              scale: aiLauncherExpanded ? 0.7 : 1,
            }}
            transition={{ duration: aiLauncherExpanded ? 0.08 : 0.18 }}
          >
            <X className="size-4" />
          </motion.span>

          <span className="absolute inset-0 flex items-center justify-between gap-3 px-4 whitespace-nowrap">
            <motion.span
              className="speak-infinity-text text-sm font-semibold"
              animate={{ opacity: aiLauncherExpanded ? 1 : 0 }}
              transition={{
                delay: aiLauncherExpanded ? 0.22 : 0,
                duration: aiLauncherExpanded ? 0.16 : 0.1,
              }}
            >
              Speak with AI
            </motion.span>
            <motion.span
              animate={{
                opacity: aiLauncherExpanded ? 1 : 0,
                scale: aiLauncherExpanded ? 1 : 0.8,
              }}
              transition={{
                delay: aiLauncherExpanded ? 0.22 : 0,
                duration: 0.16,
              }}
            >
              <Sparkles className="size-5 shrink-0" />
            </motion.span>
          </span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            height: aiToolsOpen ? aiToolsHeight : 0,
            opacity: aiToolsOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={onAiToolsAnimationComplete}
          className={cn(
            "w-max min-w-13",
            clipAiTools || !aiToolsOpen ? "overflow-hidden" : "overflow-visible",
          )}
          aria-hidden={!aiToolsOpen}
        >
          <div
            ref={aiToolsInnerRef}
            className="pointer-events-none flex flex-col items-end gap-2 pt-2"
          >
            <Link
              href={localize("/speaking")}
              tabIndex={aiToolsOpen ? 0 : -1}
              className="pointer-events-auto group flex h-13 max-w-[calc(100vw-2rem)] items-center justify-end rounded-full bg-primary px-2.5 text-primary-foreground shadow-[0_12px_32px_-10px_hsl(var(--primary)/0.7)] transition-colors hover:bg-primary/90"
              aria-label="Start speaking with AI"
            >
              <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
                <span className="min-w-0 overflow-hidden">
                  <span className="block whitespace-nowrap pr-2.5 text-sm font-semibold opacity-0 transition-opacity duration-200 delay-0 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100 group-focus-visible:delay-200">
                    Speak with AI
                  </span>
                </span>
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
                <Mic2 className="size-4" />
              </span>
            </Link>

            <Link
              href={localize("/practice")}
              tabIndex={aiToolsOpen ? 0 : -1}
              className="pointer-events-auto group relative flex h-13 max-w-[calc(100vw-2rem)] items-center justify-end rounded-full border border-border bg-card px-2.5 text-foreground shadow-lg transition-colors hover:border-primary/30"
              aria-label="Open AI tutor chat"
            >
              <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
                <span className="min-w-0 overflow-hidden">
                  <span className="block whitespace-nowrap pr-2.5 text-sm font-semibold opacity-0 transition-opacity duration-200 delay-0 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100 group-focus-visible:delay-200">
                    Chat with AI
                  </span>
                </span>
              </span>
              <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="size-4" />
                <Sparkles className="absolute -right-0.5 -top-0.5 size-2.5 text-amber-400" />
              </span>
              <span
                className="absolute right-1 top-1 size-2 rounded-full border-2 border-card bg-emerald-400"
                aria-hidden
              />
            </Link>
          </div>
        </motion.div>
          </>
        ) : null}
      </div>
      ) : null}

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
              ? "pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-24"
              : "pb-10 sm:pb-16",
            "group-has-data-not-found/shell:pb-10 group-has-data-not-found/shell:sm:pb-16",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
});
