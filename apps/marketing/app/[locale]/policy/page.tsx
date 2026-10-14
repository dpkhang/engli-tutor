import type { Metadata } from "next";
import { PolicyPage } from "@/features/legal";
import { getServerTranslator } from "@/lib/server-i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = getServerTranslator((await params).locale);
  return {
    title: `${t("legal.privacyPolicy")} — EngliTutor`,
    description: t("legal.privacyMetaDescription"),
  };
}

export default function PolicyRoutePage() {
  return <PolicyPage />;
}
