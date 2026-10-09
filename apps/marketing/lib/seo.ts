import type { Metadata } from "next";
import type { Locale } from "@engli-tutor/i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3002").replace(/\/$/, "");

const COPY: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "EngliTutor — AI English Tutor",
    description: "Practice speaking English with AI every day and get feedback in Vietnamese.",
    ogLocale: "en_US",
  },
  vi: {
    title: "EngliTutor — Gia sư tiếng Anh AI",
    description: "Luyện tiếng Anh với AI mỗi ngày và nhận phản hồi bằng tiếng Việt.",
    ogLocale: "vi_VN",
  },
};

const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "EngliTutor — AI English Tutor" };

/** Next replaces (not merges) `openGraph` per segment, so every level must pass the full object. */
export function siteMetadata(locale: Locale): Metadata {
  const { title, description, ogLocale } = COPY[locale];
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "EngliTutor",
      title,
      description,
      url: `/${locale}`,
      locale: ogLocale,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
