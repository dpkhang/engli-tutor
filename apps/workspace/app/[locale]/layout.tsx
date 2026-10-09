import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, SUPPORTED_LOCALES } from "@engli-tutor/i18n";
import { CookieConsentBanner } from "@engli-tutor/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    description:
      locale === "vi"
        ? "Luyện nghe · nói · đọc · viết với AI chat, mẹo nhanh và mini-game mỗi ngày."
        : "Practice listening · speaking · reading · writing with AI chat, quick tips, and mini-games every day.",
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
