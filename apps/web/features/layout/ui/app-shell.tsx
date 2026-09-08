"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Coins,
  Crown,
  LogOut,
  Menu,
  MessageCircle,
  Mic2,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button, cn, ThemeToggle, useActionDialog } from "@landing-page-generator/ui";
import { AnimatePresence, motion } from "motion/react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";

const PRIMARY_NAV = [
  { href: "/", label: "Today" },
  { href: "/skills", label: "Practice" },
  { href: "/games", label: "Games" },
  { href: "/lessons", label: "My path" },
  { href: "/payments", label: "Plans" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/lessons") {
    return pathname === "/lessons" || pathname.startsWith("/lessons/");
  }
  if (href === "/skills") {
    return pathname === "/skills" || pathname.startsWith("/skills/");
  }
  if (href === "/games") {
    return pathname === "/games" || pathname.startsWith("/games/");
  }
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const dialog = useActionDialog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(true);
  const [aiLauncherExpanded, setAiLauncherExpanded] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const user = data?.user;
  const credits = useBillingMe(Boolean(user));
  const paidPlan = credits.data?.hasPaidPlan
    ? credits.data.subscriptionPlans.find((plan) => plan.id === credits.data?.subscription.planId)
    : undefined;
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!accountMenuRef.current?.contains(target)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (aiToolsOpen) return;

    const timer = window.setTimeout(() => setAiLauncherExpanded(true), 300);
    return () => window.clearTimeout(timer);
  }, [aiToolsOpen]);

  if (
    pathname === "/login" ||
    pathname === "/speaking" ||
    pathname.startsWith("/demo/") ||
    pathname === "/domain-unavailable" ||
    pathname === "/payments/result"
  ) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  const signOut = async () => {
    const accepted = await dialog.confirm({
      title: "Sign out?",
      description: "You’ll need to sign in again to keep learning with EngliTutor.",
      confirmLabel: "Sign out",
      tone: "danger",
    });
    if (!accepted) return;
    setAccountOpen(false);
    void authClient.signOut().then(() => window.location.assign("/login"));
  };

  return (
    <div className="workspace-background relative min-h-svh">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>

            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
                <span className="text-sm">E</span>
              </span>
              <span className="hidden sm:inline">EngliTutor</span>
            </Link>

            <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
              {PRIMARY_NAV.map((item) => {
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
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden h-9 rounded-full sm:inline-flex"
              >
                <Link href="/payments" className="gap-1.5">
                  <Coins className="size-3.5" />
                  {credits.isLoading ? "…" : (credits.data?.balance ?? 0)}
                </Link>
              </Button>
            ) : null}
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left hover:bg-muted"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span
                    className={cn(
                      "relative grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
                      paidPlan &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_18px_-5px_hsl(var(--primary))]",
                    )}
                  >
                    {initials}
                    {paidPlan ? (
                      <span className="absolute -top-1.5 -left-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-sm">
                        <Crown className="size-2.5 fill-current" strokeWidth={2} />
                      </span>
                    ) : null}
                  </span>
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
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
                          href="/settings/account"
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <UserRound className="size-4 text-muted-foreground" />
                          Account
                        </Link>
                        <Link
                          href="/settings"
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <Settings className="size-4 text-muted-foreground" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-border pt-1">
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => void signOut()}
                        >
                          <LogOut className="size-4" />
                          Sign out
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
              aria-label="Mobile menu"
            >
              <div className="mx-auto flex max-w-6xl flex-col gap-1 pb-2">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-medium",
                      isActivePath(pathname, item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <motion.div
        className={cn(
          "pointer-events-none fixed z-30 flex w-40 flex-col items-end",
          pathname.startsWith("/skills/") ? "bottom-24" : "bottom-5 sm:bottom-6",
        )}
        style={{ right: "max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))" }}
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <motion.button
          type="button"
          onClick={() => {
            if (aiToolsOpen) {
              setAiToolsOpen(false);
              return;
            }
            setAiLauncherExpanded(false);
            setAiToolsOpen(true);
          }}
          className={cn(
            "pointer-events-auto relative flex h-12 items-center overflow-hidden rounded-full shadow-[0_10px_28px_-8px_hsl(var(--primary)/0.65)] transition-[width,background-color,color,border-color] duration-300 ease-in-out",
            aiLauncherExpanded
              ? "w-40 justify-between bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              : "w-12 justify-center border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          aria-expanded={aiToolsOpen}
          aria-label={aiToolsOpen ? "Hide AI tools" : "Show AI tools"}
          title={aiToolsOpen ? "Hide AI tools" : "Show AI tools"}
        >
          <motion.span
            className="absolute inset-0 grid place-items-center"
            animate={{
              opacity: aiLauncherExpanded ? 0 : 1,
              rotate: aiLauncherExpanded ? 45 : 0,
              scale: aiLauncherExpanded ? 0.7 : 1,
            }}
            transition={{ duration: aiLauncherExpanded ? 0.06 : 0.15 }}
          >
            <X className="size-4" />
          </motion.span>

          <span className="absolute inset-0 flex items-center justify-between gap-3 px-4 whitespace-nowrap">
            <motion.span
              className="text-sm font-semibold"
              animate={{ opacity: aiLauncherExpanded ? 1 : 0 }}
              transition={{
                delay: aiLauncherExpanded ? 0.22 : 0,
                duration: aiLauncherExpanded ? 0.08 : 0.04,
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
                delay: aiLauncherExpanded ? 0.08 : 0,
                duration: 0.12,
              }}
            >
              <Sparkles className="size-5 shrink-0" />
            </motion.span>
          </span>
        </motion.button>

        <AnimatePresence initial={false}>
          {aiToolsOpen ? (
            <motion.div
              key="ai-tools"
              className="w-full overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.18 },
              }}
            >
              <div className="pointer-events-auto flex flex-col items-end gap-2 pt-2">
                <Link
                  href="/speaking"
                  className="group flex h-13 w-13 items-center justify-end gap-2.5 overflow-hidden rounded-full bg-primary px-2.5 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-[0_12px_32px_-10px_hsl(var(--primary)/0.7)] transition-[width,transform,background-color] duration-300 hover:w-[10rem] hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:w-[10rem]"
                  aria-label="Start speaking with AI"
                >
                  <span className="max-w-0 translate-x-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-28 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:max-w-28 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                    Speak with AI
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
                    <Mic2 className="size-4" />
                  </span>
                </Link>

                {pathname !== "/practice" ? (
                  <Link
                    href="/practice"
                    className="group relative flex h-13 w-13 items-center justify-end gap-2.5 overflow-hidden rounded-full border border-border bg-card px-2.5 text-sm font-semibold whitespace-nowrap text-foreground shadow-lg transition-[width,transform,border-color] duration-300 hover:w-[9.75rem] hover:-translate-y-0.5 hover:border-primary/30 focus-visible:w-[9.75rem]"
                    aria-label="Open AI tutor chat"
                  >
                    <span className="max-w-0 translate-x-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-24 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                      Chat with AI
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
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
