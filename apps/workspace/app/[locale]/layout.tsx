import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, SUPPORTED_LOCALES } from "@engli-tutor/i18n";
import { CookieConsentBanner } from "@engli-tutor/ui";
import { siteMetadata } from "@/lib/seo";

export const dynamicParams = false;

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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      {children}
      <CookieConsentBanner policyHref={`/${locale}/policy/cookies`} />
    </>
  );
}
