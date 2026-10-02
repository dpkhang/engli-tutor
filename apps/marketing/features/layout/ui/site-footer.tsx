"use client";

import Link from "next/link";
import { BrandLogo, openCookieConsent } from "@engli-tutor/ui";
import { isLocale, type Locale } from "@engli-tutor/i18n";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/features/auth";
import { useMarketingI18n } from "@/features/i18n";
import { FOOTER_PRIVACY_LINKS } from "@/features/legal/model/legal-ctas";

const FOOTER_LINKS = [
  {
    titleKey: "footer.learn",
    items: [
      { href: "/#for-you", labelKey: "footer.forYou" },
      { href: "/#practice", labelKey: "footer.sampleSession" },
      { href: "/#path", labelKey: "footer.fourSkillPath" },
      { href: "/#pricing", labelKey: "footer.pricing" },
      { href: "/#faq", labelKey: "footer.faq" },
      { href: "/auth", labelKey: "footer.startLesson", entry: true as const },
    ],
  },
  {
    titleKey: "footer.company",
    items: [
      { href: "#", labelKey: "footer.about" },
      { href: "#", labelKey: "footer.blog" },
      { href: "#", labelKey: "footer.contact" },
    ],
  },
  {
    titleKey: "footer.privacy",
    items: FOOTER_PRIVACY_LINKS.map((item) => ({ ...item, labelKey: item.label === "Privacy Policy" ? "footer.privacyPolicy" : "footer.cookiePolicy" })),
  },
];

export function SiteFooter() {
  const t = useMarketingI18n();
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const locale: Locale = isLocale(segment) ? segment : "en";
  const localize = (href: string) => href.startsWith("/") ? `/${locale}${href}` : href;
  const { isLoggedIn, entryHref } = useAuthSession();

  return (
    <footer className="border-t border-primary/15 bg-primary text-primary-foreground shadow-[0_-24px_80px_hsl(var(--primary)/0.18)]">
      <div className="marketing-container grid grid-cols-2 gap-x-5 gap-y-6 py-12 sm:gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 min-w-0 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.06] p-5 shadow-sm lg:col-span-1">
          <BrandLogo size={36} tone="inverse" wordmarkClassName="text-primary-foreground" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            {t("footer.description")}
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.titleKey} className="min-w-0 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              {t(group.titleKey)}
            </p>
            <ul className="mt-4 space-y-1.5">
              {group.items.map((item) => {
                const isEntry = "entry" in item && item.entry;
                const href = isEntry ? entryHref : localize(item.href);
                const label = isEntry ? (isLoggedIn ? t("footer.workspace") : t(item.labelKey)) : t(item.labelKey);
                const external = isEntry && isLoggedIn;

                return (
                  <li key={item.labelKey}>
                    {external ? (
                      <a
                        href={href}
                        className="inline-flex min-h-11 items-center rounded-xl text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/60"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center rounded-xl text-sm text-primary-foreground/70 underline-offset-4 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/60"
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
        <div className="marketing-container flex flex-col gap-3 py-4 text-xs text-primary-foreground/55 lg:flex-row lg:items-center lg:justify-between">
          <span>© {new Date().getFullYear()} EngliTutor</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href={`/${locale}/policy`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl underline-offset-4 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/60">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href={`/${locale}/policy/cookies`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl underline-offset-4 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/60">
              {t("footer.cookiePolicy")}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-xl text-left underline-offset-4 transition-colors hover:text-primary-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground/60"
              onClick={openCookieConsent}
            >
              {t("footer.cookieSettings")}
            </button>
            <span className="tracking-wide">{t("footer.tagline")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
