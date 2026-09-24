"use client";

import Link from "next/link";
import { openCookieConsent } from "@engli-tutor/ui";
import { useAuthSession } from "@/features/auth";
import { FOOTER_PRIVACY_LINKS } from "@/features/legal/model/legal-ctas";

const FOOTER_LINKS = [
  {
    title: "Learn with EngliTutor",
    items: [
      { href: "/#for-you", label: "For you" },
      { href: "/#practice", label: "Sample session" },
      { href: "/#path", label: "Four-skill path" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
      { href: "/auth", label: "Start speaking", entry: true as const },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    title: "Privacy",
    items: FOOTER_PRIVACY_LINKS,
  },
];

export function SiteFooter() {
  const { isLoggedIn, entryHref } = useAuthSession();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-6 md:py-12">
        <div className="space-y-3">
          <p className="font-display text-2xl tracking-tight">
            EngliTutor
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65">
            AI English tutor — listen, speak, read, write every day, with feedback in Vietnamese. Built for A2–B1 professionals.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              {group.title}
            </p>
            <ul className="space-y-2">
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
                        className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm text-primary-foreground/70 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
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

      <div className="border-t border-primary-foreground/12">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-3.5 text-xs text-primary-foreground/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} EngliTutor</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/policy" className="underline-offset-4 transition-colors hover:text-primary-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/policy/cookies" className="underline-offset-4 transition-colors hover:text-primary-foreground hover:underline">
              Cookie Policy
            </Link>
            <button
              type="button"
              className="text-left underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
              onClick={openCookieConsent}
            >
              Cookie settings
            </button>
            <span className="tracking-wide">Curriculum for professionals who speak every day.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
