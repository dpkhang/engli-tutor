"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button, cn, ThemeToggle } from "@landing-page-generator/ui";
import { motion, AnimatePresence } from "motion/react";
import { getAppUrl, getAuthHref } from "@/features/auth/model/session";

const GUEST_NAV = [
  { href: "/#for-you", label: "For you" },
  { href: "/#practice", label: "Sessions" },
  { href: "/#path", label: "4 skills" },
  { href: "/payment", label: "Pricing" },
];

const MEMBER_NAV = [
  { href: "/#practice", label: "Sessions" },
  { href: "/#path", label: "4 skills" },
  { href: "/payment", label: "Plans" },
  { href: "/#faq", label: "FAQ" },
];

const SCROLL_SOLID_AT = 48;

function WorkspaceMenuCard({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      role="menuitem"
      className={cn(
        "group relative block overflow-hidden rounded-sm px-3.5 py-2.5 text-left text-primary-foreground outline-none",
        "bg-primary",
        "shadow-[0_10px_28px_-18px_rgba(15,23,42,0.55)] transition-opacity duration-300 hover:opacity-95",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="relative flex items-center justify-between gap-3">
        <span className="min-w-0 space-y-0.5">
          <span className="font-[family-name:var(--font-display)] text-base leading-none tracking-tight">
            Open Workspace
          </span>
          <span className="block truncate text-xs text-primary-foreground/70">
            Learning path & practice sessions
          </span>
        </span>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-primary-foreground transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
          <ArrowUpRight className="size-3.5" strokeWidth={2.25} />
        </span>
      </span>
    </a>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth");
  const isPayment = pathname.startsWith("/payment");
  const isMarketingHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data, isPending } = useSession();
  const user = data?.user ?? null;

  useEffect(() => {
    if (!isMarketingHome) {
      setScrolled(false);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > SCROLL_SOLID_AT;
        setScrolled((prev) => (prev === next ? prev : next));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isMarketingHome]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const useSolidHeader = isAuth || isPayment || scrolled;
  const onHero = isMarketingHome && !scrolled;
  const isLoggedIn = Boolean(user);
  const navItems = isLoggedIn ? MEMBER_NAV : GUEST_NAV;
  const appUrl = getAppUrl();
  const authHref = getAuthHref();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";

  const linkTone = useSolidHeader
    ? "text-muted-foreground hover:text-foreground"
    : "text-white/80 hover:text-white";

  const signOut = () => {
    setMenuOpen(false);
    void authClient.signOut().then(() => {
      window.location.assign("/");
    });
  };

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300",
        useSolidHeader
          ? "bg-background/90 shadow-[0_8px_28px_-20px_rgba(15,23,42,0.35)] backdrop-blur-md"
          : "bg-gradient-to-b from-[#0b1524]/80 via-[#0b1524]/40 to-transparent",
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {useSolidHeader ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsla(210,22%,97%,0.94),hsla(214,18%,93%,0.55)_70%,hsla(210,22%,97%,0.2))] dark:bg-[linear-gradient(180deg,hsla(222,32%,8%,0.94),hsla(221,24%,14%,0.7)_70%,hsla(222,32%,8%,0.25))]"
        />
      ) : null}

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className={cn(
            "font-[family-name:var(--font-display)] text-xl tracking-tight transition-colors",
            useSolidHeader ? "text-foreground" : "text-white",
          )}
        >
          EngliTutor
        </Link>

        <div className="flex items-center justify-end gap-4 md:gap-10">
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={cn("text-sm transition-colors", linkTone)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle
              className={cn(
                onHero && "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            />
            {isPending ? (
              <span
                className={cn(
                  "h-9 w-20 animate-pulse rounded-md",
                  onHero ? "bg-white/15" : "bg-muted",
                )}
              />
            ) : isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm px-2.5 text-sm shadow-sm transition-colors",
                    onHero
                      ? "border border-white/25 bg-white/10 text-white hover:bg-white/16"
                      : "border border-border/80 bg-background/80 text-foreground hover:bg-muted",
                  )}
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="inline-flex size-6 items-center justify-center rounded-sm bg-primary text-[10px] font-semibold text-primary-foreground">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[7.5rem] truncate sm:inline">{displayName}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      onHero ? "text-white/70" : "text-muted-foreground",
                      menuOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      role="menu"
                    className="absolute right-0 mt-2 w-[17.5rem] overflow-hidden rounded-sm border border-border bg-background p-2 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.45)]"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <div className="px-2.5 py-2">
                        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>

                      <WorkspaceMenuCard href={appUrl} className="mx-0.5" />

                      <div className="mt-1.5 space-y-0.5 border-t border-border/70 pt-1.5">
                        <Link
                          href="/payment"
                          role="menuitem"
                          className="block rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          onClick={() => setMenuOpen(false)}
                        >
                          Manage plan
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={signOut}
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {!isAuth && !isPayment ? (
                  <Link
                    href={authHref}
                    className={cn(
                      "hidden h-9 items-center rounded-md px-3 text-sm transition-colors sm:inline-flex",
                      onHero
                        ? "text-white/90 hover:bg-white/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    Sign in
                  </Link>
                ) : null}
                <Link href={isAuth || isPayment ? "/" : "/payment"}>
                  <Button
                    size="sm"
                    className={
                      onHero
                        ? "rounded-full border-0 bg-white/95 px-4 font-medium text-[#0b1524] shadow-sm hover:bg-white"
                        : "rounded-full font-medium"
                    }
                    type="button"
                  >
                    {isAuth || isPayment ? "Back to home" : "Start speaking"}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
