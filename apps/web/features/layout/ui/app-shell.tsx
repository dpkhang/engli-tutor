"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  ChevronDown,
  Coins,
  CreditCard,
  ExternalLink,
  FileText,
  Globe2,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  Settings,
  UsersRound,
  UserRound,
  X,
} from "lucide-react";
import { authClient, getMarketingUrl, useSession } from "@/lib/auth-client";
import { Button, cn, ThemeToggle, useActionDialog } from "@landing-page-generator/ui";
import { AnimatePresence, motion } from "motion/react";
import { useBillingMe } from "@/features/payments/hooks/use-billing";

const navigation = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Tổng quan", icon: LayoutDashboard },
      { href: "/landing-pages", label: "Landing pages", icon: FileText },
      { href: "/templates", label: "Templates", icon: BookOpenText },
      { href: "/media", label: "Thư viện media", icon: Images },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/leads", label: "Leads", icon: UsersRound },
      { href: "/statistics", label: "Thống kê", icon: BarChart3 },
      { href: "/domains", label: "Tên miền", icon: Globe2 },
    ],
  },
  {
    label: "Quản trị",
    items: [{ href: "/payments", label: "Thanh toán", icon: CreditCard }],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/landing-pages" && pathname.startsWith("/pages/")) return true;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const dialog = useActionDialog();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { data } = useSession();
  const user = data?.user;
  const credits = useBillingMe(Boolean(user));
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Tài khoản";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountOpen(false);
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

  if (
    pathname === "/login" ||
    pathname.startsWith("/demo/") ||
    pathname === "/payments/result"
  ) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  const signOut = async () => {
    const accepted = await dialog.confirm({
      title: "Đăng xuất?",
      description: "Bạn sẽ cần đăng nhập lại để tiếp tục quản lý workspace.",
      confirmLabel: "Đăng xuất",
      tone: "danger",
    });
    if (!accepted) return;
    setAccountOpen(false);
    void authClient.signOut().then(() => window.location.assign("/login"));
  };

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed ? (
          <Link href="/" className="flex min-w-0 items-center" onClick={() => setMobileOpen(false)}>
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">
              Pagecraft
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        >
          <X />
        </Button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Điều hướng chính">
        {navigation.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.16em] text-muted-foreground/75 uppercase">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-[background,color,transform,box-shadow] duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <a
          href={getMarketingUrl()}
          className={cn(
            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ExternalLink className="size-4.5" />
          {!collapsed ? <span>Trang marketing</span> : null}
        </a>
        <button
          type="button"
          className={cn(
            "mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0",
          )}
          onClick={() => void signOut()}
        >
          <LogOut className="size-4.5" />
          {!collapsed ? <span>Đăng xuất</span> : null}
        </button>
      </div>
    </>
  );

  return (
    <div className="workspace-background relative min-h-svh overflow-hidden">
      <div aria-hidden className="workspace-ambient pointer-events-none fixed inset-0" />

      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Đóng menu"
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-[12px_0_40px_-32px_hsl(var(--foreground)/0.35)] transition-[width,transform] duration-200 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-20",
        )}
      >
        {sidebar}
      </aside>

      <div className={cn("relative transition-[padding] duration-200 ease-out lg:pl-64", collapsed && "lg:pl-20")}>
        <header
          className={cn(
            "fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 shadow-[0_10px_30px_-28px_hsl(var(--foreground)/0.45)] backdrop-blur-xl sm:px-6",
            "left-0 right-[var(--scrollbar-compensation,0px)]",
            collapsed ? "lg:left-20" : "lg:left-64",
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeftClose className={cn("transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            {user ? (
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
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
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-muted"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                    {initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-40 truncate text-sm font-semibold">
                      {displayName}
                    </span>
                    <span className="block max-w-40 truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "hidden size-4 text-muted-foreground transition-transform sm:block",
                      accountOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                {accountOpen ? (
                  <motion.div
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="border-b px-3 py-2.5">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        href="/accounts"
                        role="menuitem"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                          pathname.startsWith("/accounts") && "bg-muted font-medium",
                        )}
                      >
                        <UserRound className="size-4 text-muted-foreground" />
                        Tài khoản
                      </Link>
                      <Link
                        href="/settings"
                        role="menuitem"
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                          pathname.startsWith("/settings") && "bg-muted font-medium",
                        )}
                      >
                        <Settings className="size-4 text-muted-foreground" />
                        Cài đặt
                      </Link>
                    </div>
                    <div className="border-t pt-1.5">
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => void signOut()}
                      >
                        <LogOut className="size-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                ) : null}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </header>

        <div className="h-16 shrink-0" aria-hidden />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
