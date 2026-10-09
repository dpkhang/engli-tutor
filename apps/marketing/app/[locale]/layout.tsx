import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, SUPPORTED_LOCALES } from "@engli-tutor/i18n";
import { CookieConsentBanner } from "@engli-tutor/ui";
import { SiteShell } from "@/features/layout";
import { MarketingI18n } from "@/features/i18n";
import { siteMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    ...siteMetadata(locale),
    alternates: { languages: Object.fromEntries(SUPPORTED_LOCALES.map((item) => [item, `/${item}`])) },
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div lang={locale}>
      <MarketingI18n locale={locale}>
        <SiteShell>
          {children}
          <CookieConsentBanner policyHref={`/${locale}/policy/cookies`} />
        </SiteShell>
      </MarketingI18n>
    </div>
  );
}
