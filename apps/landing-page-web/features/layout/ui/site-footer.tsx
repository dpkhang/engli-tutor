"use client";

import Link from "next/link";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

const FOOTER_LINKS = [
  {
    title: "Sản phẩm",
    items: [
      { href: "/#features", label: "Tính năng" },
      { href: "/#workflow", label: "Quy trình" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
      { href: "/auth", label: "Bắt đầu", entry: true as const },
    ],
  },
  {
    title: "Công ty",
    items: [
      { href: "#", label: "Giới thiệu" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Liên hệ" },
    ],
  },
];

export function SiteFooter() {
  const { isLoggedIn, entryHref } = useAuthSession();

  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground dark:bg-card dark:text-card-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr] md:gap-6 md:py-9">
        <div className="space-y-2">
          <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            Pagecraft
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65 dark:text-muted-foreground">
            Landing page AI — nhanh, rõ ràng, sẵn sàng xuất bản.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title} className="space-y-2.5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
              {group.title}
            </p>
            <ul className="space-y-1.5">
              {group.items.map((item) => {
                const isEntry = "entry" in item && item.entry;
                const href = isEntry ? entryHref : item.href;
                const label = isEntry ? (isLoggedIn ? "Workspace" : item.label) : item.label;
                const external = isEntry && isLoggedIn;

                return (
                  <li key={item.label}>
                    {external ? (
                      <a
                        href={href}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground dark:text-muted-foreground dark:hover:text-foreground"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground dark:text-muted-foreground dark:hover:text-foreground"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/10 dark:border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 text-xs text-primary-foreground/50 dark:text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Pagecraft</span>
          <span>Built for marketers who ship fast.</span>
        </div>
      </div>
    </footer>
  );
}
