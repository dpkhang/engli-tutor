import type { LayoutDensity, LayoutPreset, LayoutRadius } from "./generated-content";

export type PageFrameFunnel = "LEADS" | "SALES" | "REGISTRATION" | "AWARENESS";

export type PageFrame = {
  id: string;
  name: string;
  description: string;
  funnel: PageFrameFunnel;
  preset: LayoutPreset;
  density: LayoutDensity;
  radius: LayoutRadius;
  /** Preferred variant per section type — BE maps to index after AI returns sections. */
  sectionVariantPlan: Record<string, string>;
  /** CSS preview accent (hex) for mini-mock cards. */
  previewAccent: string;
};

export const PAGE_FRAMES: PageFrame[] = [
  {
    id: "leads-bold-split",
    name: "Lead capture mạnh",
    description: "Hero + form, phù hợp ads lead gen.",
    funnel: "LEADS",
    preset: "bold-split",
    density: "comfortable",
    radius: "soft",
    sectionVariantPlan: {
      header: "simple",
      hero: "split-form",
      features: "grid-3",
      "social-proof": "stat-row",
      testimonials: "cards-2",
      faq: "accordion",
      cta: "split-form",
      footer: "simple",
    },
    previewAccent: "#2563eb",
  },
  {
    id: "sales-editorial",
    name: "Editorial bán hàng",
    description: "Stack nội dung dài, storytelling & CTA giữa.",
    funnel: "SALES",
    preset: "editorial-stack",
    density: "airy",
    radius: "sharp",
    sectionVariantPlan: {
      header: "centered",
      hero: "asymmetric",
      features: "list-check",
      "social-proof": "quote-banner",
      testimonials: "carousel-stack",
      faq: "two-column",
      cta: "centered-band",
      footer: "columns",
    },
    previewAccent: "#0f766e",
  },
  {
    id: "awareness-minimal",
    name: "Brand tối giản",
    description: "Hero giữa, khoảng trắng thoáng — nhận diện thương hiệu.",
    funnel: "AWARENESS",
    preset: "minimal-center",
    density: "airy",
    radius: "pill",
    sectionVariantPlan: {
      header: "centered",
      hero: "centered-cta",
      features: "bento",
      "social-proof": "logo-strip",
      testimonials: "cards-2",
      faq: "accordion",
      cta: "centered-band",
      footer: "simple",
    },
    previewAccent: "#57534e",
  },
  {
    id: "leads-soft-cards",
    name: "Form mềm mại",
    description: "Card mềm, checklist benefits — nurture leads nhẹ.",
    funnel: "LEADS",
    preset: "soft-cards",
    density: "comfortable",
    radius: "pill",
    sectionVariantPlan: {
      header: "simple",
      hero: "centered-cta",
      features: "list-check",
      "social-proof": "stat-row",
      testimonials: "cards-2",
      faq: "two-column",
      cta: "split-form",
      footer: "columns",
    },
    previewAccent: "#db2777",
  },
  {
    id: "registration-bold",
    name: "Đăng ký sự kiện",
    description: "Hero form + bento highlights + social proof số liệu.",
    funnel: "REGISTRATION",
    preset: "bold-split",
    density: "compact",
    radius: "sharp",
    sectionVariantPlan: {
      header: "simple",
      hero: "split-form",
      features: "bento",
      "social-proof": "stat-row",
      testimonials: "carousel-stack",
      faq: "accordion",
      cta: "centered-band",
      footer: "simple",
    },
    previewAccent: "#ea580c",
  },
  {
    id: "sales-soft-split",
    name: "Product soft split",
    description: "Hero lệch + lưới 3 cột + CTA band — ra mắt sản phẩm.",
    funnel: "SALES",
    preset: "soft-cards",
    density: "comfortable",
    radius: "soft",
    sectionVariantPlan: {
      header: "simple",
      hero: "asymmetric",
      features: "grid-3",
      "social-proof": "logo-strip",
      testimonials: "cards-2",
      faq: "two-column",
      cta: "centered-band",
      footer: "columns",
    },
    previewAccent: "#7c3aed",
  },
];

export const FUNNEL_LABEL: Record<PageFrameFunnel, string> = {
  LEADS: "Leads",
  SALES: "Sales",
  REGISTRATION: "Đăng ký",
  AWARENESS: "Awareness",
};

export function getPageFrameById(id: string | null | undefined): PageFrame | undefined {
  if (!id) return undefined;
  return PAGE_FRAMES.find((frame) => frame.id === id);
}

/** Payload shape accepted by BE `generate` layout hint. */
export function frameToLayoutHint(frame: PageFrame) {
  return {
    preset: frame.preset,
    density: frame.density,
    radius: frame.radius,
    sectionVariantPlan: frame.sectionVariantPlan,
  };
}
