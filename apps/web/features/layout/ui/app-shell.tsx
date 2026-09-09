"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { useSignOutLoading } from "./sign-out-loading";
import { AnimatePresence, motion } from "motion/react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";
import { FloatingTranslate } from "@/features/translate";

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
  const queryClient = useQueryClient();
  const { beginSignOut, endSignOut } = useSignOutLoading();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(true);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [aiLauncherExpanded, setAiLauncherExpanded] = useState(false);
  const [clipAiTools, setClipAiTools] = useState(false);
  const aiDockActionRef = useRef<"idle" | "open-tools" | "show-pill">("idle");
  const aiToolsInnerRef = useRef<HTMLDivElement>(null);
  const [aiToolsHeight, setAiToolsHeight] = useState(0);
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
    setTranslateOpen(false);
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

  useLayoutEffect(() => {
    const node = aiToolsInnerRef.current;
    if (!node) return;
    setAiToolsHeight(node.scrollHeight);
  }, [aiToolsOpen, pathname]);

  useEffect(() => {
    if (aiDockActionRef.current !== "open-tools") return;
    if (aiLauncherExpanded || aiToolsOpen) return;

    const timer = window.setTimeout(() => {
      aiDockActionRef.current = "idle";
      setAiToolsOpen(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [aiLauncherExpanded, aiToolsOpen]);

  useEffect(() => {
    if (aiDockActionRef.current !== "show-pill") return;
    if (aiToolsOpen || aiLauncherExpanded) return;

    const timer = window.setTimeout(() => {
      aiDockActionRef.current = "idle";
      setAiLauncherExpanded(true);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [aiToolsOpen, aiLauncherExpanded]);

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
    beginSignOut();
    try {
      queryClient.clear();
      await authClient.signOut();
      window.location.assign("/login");
    } catch {
      endSignOut();
    }
  };

  const raiseFabForExerciseBar = /^\/skills\/[^/]+\/[^/]+/.test(pathname);

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

      <div
        className="pointer-events-none fixed z-[60] flex w-max max-w-[calc(100vw-2rem)] flex-col items-end"
        style={{
          right: "max(1rem, env(safe-area-inset-right, 0px))",
          bottom: raiseFabForExerciseBar
            ? "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))"
            : "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-0">
          <FloatingTranslate open={translateOpen} onOpenChange={setTranslateOpen} />
        </div>

        <motion.button
          type="button"
          onClick={() => {
            if (aiToolsOpen) {
              aiDockActionRef.current = "show-pill";
              setClipAiTools(true);
              setAiToolsOpen(false);
              return;
            }
            aiDockActionRef.current = "open-tools";
            setAiLauncherExpanded(false);
          }}
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
          onAnimationComplete={() => {
            if (aiToolsOpen) {
              setClipAiTools(false);
              return;
            }
            if (aiDockActionRef.current !== "show-pill") return;
            aiDockActionRef.current = "idle";
            setAiLauncherExpanded(true);
          }}
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
              href="/speaking"
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
              href="/practice"
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
      </div>

      <div
        className={cn(
          "transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          translateOpen && "lg:pr-[30rem]",
        )}
      >
        <main
          className={cn(
            "mx-auto w-full min-w-0 max-w-6xl px-4 py-8 transition-opacity duration-200 sm:px-6 sm:py-10",
            translateOpen && "max-lg:pointer-events-none max-lg:invisible",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
