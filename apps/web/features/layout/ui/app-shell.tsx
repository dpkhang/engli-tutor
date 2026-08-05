"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  ChevronDown,
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
import { Button, cn, ThemeToggle } from "@landing-page-generator/ui";

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
    items: [
      { href: "/payments", label: "Thanh toán", icon: CreditCard },
      { href: "/accounts", label: "Tài khoản", icon: UserRound },
      { href: "/settings", label: "Cài đặt", icon: Settings },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/landing-pages" && pathname.startsWith("/pages/")) return true;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useSession();
  const user = data?.user;
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Tài khoản";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (pathname === "/login" || pathname.startsWith("/demo/")) {
    return <div className="min-h-svh bg-background">{children}</div>;
  }

  const signOut = () => {
    void authClient.signOut().then(() => window.location.assign("/login"));
  };

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-[family-name:var(--font-display)] text-lg text-primary-foreground">
            P
          </span>
          {!collapsed ? (
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">
              Pagecraft
            </span>
          ) : null}
        </Link>
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
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />
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
          onClick={signOut}
        >
          <LogOut className="size-4.5" />
          {!collapsed ? <span>Đăng xuất</span> : null}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-svh bg-[linear-gradient(135deg,hsl(var(--background)),hsl(var(--surface))_140%)]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "lg:w-20",
        )}
      >
        {sidebar}
      </aside>

      <div className={cn("transition-[padding] duration-200 lg:pl-64", collapsed && "lg:pl-20")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
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
            <ThemeToggle />
            {user ? (
              <Link
                href="/accounts"
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted"
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
                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
              </Link>
            ) : null}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
