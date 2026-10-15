import type { Metadata } from "next";
import { CookiesPage } from "@/features/legal";
import { getServerTranslator } from "@/lib/server-i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = getServerTranslator((await params).locale);
  return {
    title: `${t("legal.cookiePolicy")} — EngliTutor`,
    description: t("legal.cookieMetaDescription"),
  };
}

export default function CookiePolicyRoutePage() {
  return <CookiesPage />;
}
