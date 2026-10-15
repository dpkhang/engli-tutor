"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion, type Transition, useReducedMotion } from "motion/react";
import { authClient, useSession } from "@/lib/auth-client";
import { BrandLogo, cn, ThemeToggle } from "@engli-tutor/ui";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { getAppUrl, getAuthHref } from "@/features/auth";
import { LanguageSwitcher } from "../language-switcher";
import { useMarketingI18n } from "@/features/i18n";

const GUEST_NAV = [
  { href: "/#for-you", key: "header.forYou" },
  { href: "/#practice", key: "header.sessions" },
  { href: "/#path", key: "header.fourSkills" },
  { href: "/payment", key: "header.pricing" },
];

const MEMBER_NAV = [
  { href: "/#practice", key: "header.sessions" },
  { href: "/#path", key: "header.fourSkills" },
  { href: "/payment", key: "header.plans" },
  { href: "/#faq", key: "header.faq" },
];

function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : "en";
}

function withLocale(locale: Locale, href: string) {
  return href.startsWith("/") ? `/${locale}${href}` : href;
}

const SCROLL_SOLID_AT = 0;
const MOBILE_NAV_ID = "site-header-mobile-nav";

function WorkspaceMenuCard({ href, className, title, description }: { href: string; className?: string; title: string; description: string }) {
  return (
    <a
      href={href}
      role="menuitem"
      className={cn(
        "group relative block overflow-hidden rounded-sm px-3.5 py-2.5 text-left text-primary-foreground outline-none",
        "bg-primary",
        "shadow-[0_10px_28px_-18px_rgba(15,23,42,0.55)] transition-opacity duration-300 hover:opacity-95 motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span className="relative flex items-center justify-between gap-3">
        <span className="min-w-0 space-y-0.5">
          <span className="font-display text-base leading-none tracking-tight">
            {title}
          </span>
          <span className="block truncate text-xs text-primary-foreground/70">
            {description}
          </span>
        </span>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-white/10 text-primary-foreground transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground motion-reduce:transition-none">
          <ArrowUpRight className="size-3.5" strokeWidth={2.25} />
        </span>
      </span>
    </a>
  );
}

export function SiteHeader() {
  const t = useMarketingI18n();
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const isAuth = pathname.includes("/auth");
  const isPayment = pathname.includes("/payment");
  const isMarketingHome = pathname === `/${locale}` || pathname === "/";
  const isLegal = pathname.includes("/policy");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
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
    setMobileNavOpen(false);
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

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileNavOpen(false);
      mobileNavButtonRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const transparent = isMarketingHome && !scrolled && !mobileNavOpen;
  const isLoggedIn = Boolean(user);
  const navItems = (isLoggedIn ? MEMBER_NAV : GUEST_NAV).map((item) => ({
    ...item,
    href: withLocale(locale, item.href),
    label: t(item.key),
  }));
  const appUrl = getAppUrl();
  const authHref = getAuthHref();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || t("workspace.account");
  const headerTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: "easeOut" };
  const menuTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" };

  const closeMobileNav = () => setMobileNavOpen(false);

  const signOut = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    void authClient.signOut().then(() => {
      window.location.assign("/");
    });
  };

  if (isLegal || isAuth) return null;

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background,box-shadow,border-color] duration-300 motion-reduce:transition-none",
        transparent
          ? "border-transparent bg-transparent text-white shadow-none"
          : "border-border/60 bg-background/92 text-foreground shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl",
      )}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={headerTransition}
    >
      <div className="marketing-container flex h-16 items-center justify-between gap-3">
        <Link
          href={`/${locale}`}
          className="group inline-flex items-center rounded-sm text-foreground outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          aria-label={t("header.homeLabel")}
          onClick={closeMobileNav}
        >
          <BrandLogo size={32} tone={transparent ? "inverse" : "default"} wordmarkClassName={transparent ? "text-white" : undefined} />
        </Link>

        <div className="flex items-center justify-end gap-3 md:gap-8">
          <LanguageSwitcher transparent={transparent} />
          <nav className="hidden items-center gap-1 md:flex" aria-label={t("workspace.primaryNavigation")}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-full px-3.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none", transparent ? "text-white hover:bg-white/15 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isPending ? (
              <span className="h-9 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            ) : isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-background/85 px-2.5 text-sm text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label={t("header.openAccountMenu")}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-30 truncate sm:inline">{displayName}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                      menuOpen && "rotate-180 motion-reduce:rotate-0",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      role="menu"
                      className="absolute right-0 mt-2 w-70 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-[0_20px_44px_-24px_rgba(15,23,42,0.45)]"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                      transition={menuTransition}
                    >
                      <div className="px-2.5 py-2">
                        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      </div>

                      <WorkspaceMenuCard href={appUrl} className="mx-0.5" title={t("header.openWorkspace")} description={t("header.workspaceDescription")} />

                      <div className="mt-1.5 space-y-0.5 border-t border-border/70 pt-1.5">
                        <Link
                          href={`/${locale}/payment`}
                          role="menuitem"
                          className="block rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                          onClick={() => setMenuOpen(false)}
                        >
                          {t("header.managePlan")}
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                          onClick={signOut}
                        >
                          {t("header.signOut")}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <ThemeToggle className={transparent ? "text-white hover:bg-white/15 hover:text-white" : undefined} />
                <Link
                  href={isAuth || isPayment ? `/${locale}` : authHref}
                  className="hidden h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:inline-flex"
                >
                  {isAuth || isPayment ? t("header.backToHome") : t("header.startLesson")}
                </Link>
              </>
            )}

            <button
              type="button"
              ref={mobileNavButtonRef}
              className={cn("inline-flex size-10 cursor-pointer items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none md:hidden", transparent ? "border-white/40 bg-transparent text-white hover:bg-white/15" : "border-border/80 bg-background/85 text-foreground hover:bg-muted")}
              aria-label={mobileNavOpen ? t("header.closeNavigation") : t("header.openNavigation")}
              aria-controls={MOBILE_NAV_ID}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            id={MOBILE_NAV_ID}
            className="border-t border-border/70 bg-background/96 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:hidden"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={menuTransition}
          >
            <nav className="marketing-container py-3" aria-label={t("header.mobileNavigation")}>
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                    onClick={closeMobileNav}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {!isPending && !isLoggedIn ? (
                <Link
                  href={isAuth || isPayment ? `/${locale}` : authHref}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                  onClick={closeMobileNav}
                >
                  {isAuth || isPayment ? t("header.backToHome") : t("header.startLesson")}
                </Link>
              ) : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
