import type { Metadata } from "next";
import type { Locale } from "@engli-tutor/i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

const COPY: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "EngliTutor — Learn English with AI",
    description: "Practice listening · speaking · reading · writing with AI chat, quick tips, and mini-games every day.",
    ogLocale: "en_US",
  },
  vi: {
    title: "EngliTutor — Học tiếng Anh với AI",
    description: "Luyện nghe · nói · đọc · viết với AI chat, mẹo nhanh và mini-game mỗi ngày.",
    ogLocale: "vi_VN",
  },
};

const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "EngliTutor — Learn English with AI" };

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
