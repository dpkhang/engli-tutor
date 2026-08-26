"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  ChevronDown,
  Coins,
  LogOut,
  Menu,
  MoreHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button, cn, ThemeToggle, useActionDialog } from "@landing-page-generator/ui";
import { AnimatePresence, motion } from "motion/react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";

const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "AI Chat" },
  { href: "/skills", label: "4 skills" },
  { href: "/lessons", label: "Path" },
  { href: "/payments", label: "Plans" },
];

const MORE_LINKS = [
  { href: "/accounts", label: "Account" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/lessons") {
    return pathname === "/lessons" || pathname.startsWith("/lessons/");
  }
  if (href === "/skills") {
    return pathname === "/skills" || pathname.startsWith("/skills/");
  }
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const dialog = useActionDialog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const user = data?.user;
  const credits = useBillingMe(Boolean(user));
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    setAccountOpen(false);
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen && !moreOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (accountOpen && !accountMenuRef.current?.contains(target)) setAccountOpen(false);
      if (moreOpen && !moreRef.current?.contains(target)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen, moreOpen]);

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

            <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
              EngliTutor
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
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    moreOpen || MORE_LINKS.some((item) => isActivePath(pathname, item.href))
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  onClick={() => setMoreOpen((open) => !open)}
                >
                  More
                  <MoreHorizontal className="size-3.5" />
                </button>
                <AnimatePresence>
                  {moreOpen ? (
                    <motion.div
                      role="menu"
                      className="absolute top-full left-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16 }}
                    >
                      {MORE_LINKS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className={cn(
                            "block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted",
                            isActivePath(pathname, item.href) && "bg-muted font-medium",
                          )}
                          onClick={() => setMoreOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
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
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
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
                          href="/accounts"
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <UserRound className="size-4 text-muted-foreground" />
                          Account
                        </Link>
                        <Link
                          href="/lessons"
                          role="menuitem"
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                        >
                          <BookOpenCheck className="size-4 text-muted-foreground" />
                          Lesson path
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
                {[...PRIMARY_NAV, ...MORE_LINKS].map((item) => (
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

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
