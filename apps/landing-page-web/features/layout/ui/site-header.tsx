"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button, cn } from "@landing-page-generator/ui";
import { motion, AnimatePresence } from "motion/react";
import { getAppUrl, getAuthHref } from "@/features/auth/model/session";

const GUEST_NAV = [
  { href: "/#features", label: "Tính năng" },
  { href: "/#workflow", label: "Quy trình" },
  { href: "/payment", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const MEMBER_NAV = [
  { href: "/#features", label: "Tính năng" },
  { href: "/#workflow", label: "Quy trình" },
  { href: "/payment", label: "Gói dịch vụ" },
  { href: "/#faq", label: "FAQ" },
];

const SCROLL_SOLID_AT = 48;

function WorkspaceMenuCard({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      role="menuitem"
      className={cn(
        "group relative block overflow-hidden rounded-2xl px-3.5 py-2.5 text-left text-primary-foreground outline-none",
        "bg-[linear-gradient(145deg,#06352d_0%,#0a4a3c_48%,#1f8a68_100%)]",
        "shadow-[0_14px_36px_-16px_rgba(6,53,45,0.65)] transition-shadow duration-300",
        "hover:shadow-[0_16px_36px_-14px_rgba(6,53,45,0.7)]",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-6 size-20 rounded-full bg-accent/25 blur-2xl"
      />
      <span className="relative flex items-center justify-between gap-3">
        <span className="min-w-0 space-y-0.5">
          <span className="font-[family-name:var(--font-display)] text-base leading-none tracking-tight">
            Mở Workspace
          </span>
          <span className="block truncate text-xs text-primary-foreground/70">
            Quản lý landing page & xuất bản
          </span>
        </span>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/12 text-primary-foreground transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
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
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Tài khoản";

  const linkTone = useSolidHeader
    ? "text-muted-foreground hover:text-foreground"
    : "text-primary-foreground/80 hover:text-primary-foreground";

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
          ? "bg-background/88 shadow-[0_8px_30px_-18px_rgba(6,53,45,0.45)] backdrop-blur-md"
          : "bg-gradient-to-b from-[#041f1a]/75 via-[#041f1a]/35 to-transparent",
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {useSolidHeader ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsla(160,28%,97%,0.92),hsla(158,22%,93%,0.55)_70%,hsla(160,28%,97%,0.2))]"
        />
      ) : null}

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className={cn(
            "font-[family-name:var(--font-display)] text-xl tracking-tight transition-colors",
            useSolidHeader ? "text-foreground" : "text-primary-foreground",
          )}
        >
          Pagecraft
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
            {isPending ? (
              <span
                className={cn(
                  "h-9 w-20 animate-pulse rounded-md",
                  onHero ? "bg-primary-foreground/15" : "bg-muted",
                )}
              />
            ) : isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-sm shadow-sm transition-colors",
                    onHero
                      ? "border border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/16"
                      : "border border-border/80 bg-background/80 text-foreground hover:bg-muted",
                  )}
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[linear-gradient(145deg,#0a4a3c,#1f8a68)] text-[10px] font-semibold text-primary-foreground">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[7.5rem] truncate sm:inline">{displayName}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      onHero ? "text-primary-foreground/70" : "text-muted-foreground",
                      menuOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      role="menu"
                      className="absolute right-0 mt-2 w-[17.5rem] overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-[0_24px_50px_-24px_rgba(6,53,45,0.55)]"
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
                          Quản lý gói
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={signOut}
                        >
                          Đăng xuất
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
                        ? "text-primary-foreground/90 hover:bg-primary-foreground/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    Đăng nhập
                  </Link>
                ) : null}
                <Link href={isAuth || isPayment ? "/" : "/payment"}>
                  <Button
                    size="sm"
                    className={
                      onHero ? "bg-accent text-accent-foreground hover:bg-accent/90" : undefined
                    }
                    type="button"
                  >
                    {isAuth || isPayment ? "Về trang chủ" : "Dùng thử"}
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
