import type { GeneratedLandingContent, GeneratedLayout, SectionType } from "./generated-content";
import { SECTION_VARIANT_CATALOG } from "./generated-content";
import type { PageFrame } from "./page-frames";

/** Sample copy used only for “Xem thử” frame preview — not persisted. */
export const FRAME_PREVIEW_SAMPLE_CONTENT: GeneratedLandingContent = {
  meta: {
    title: "Preview khung trang",
    description: "Bản xem thử layout với nội dung mẫu.",
  },
  theme: {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    fontStyle: "sans",
  },
  sections: [
    {
      type: "hero",
      heading: "Biến brief thành landing sẵn chạy ads",
      subheading: "Nội dung mẫu — chỉ để xem bố cục khung trang.",
      body: "Chọn khung phù hợp funnel, AI sẽ điền copy theo brief của bạn.",
      ctaLabel: "Dùng thử miễn phí",
      items: [],
    },
    {
      type: "features",
      heading: "Vì sao marketer chọn Pagecraft",
      subheading: null,
      body: null,
      ctaLabel: null,
      items: [
        "Layout chuẩn conversion",
        "Generate copy theo brief",
        "Xuất bản và gắn domain nhanh",
      ],
    },
    {
      type: "social-proof",
      heading: "Tin tưởng bởi đội marketing",
      subheading: null,
      body: null,
      ctaLabel: null,
      items: ["120+ chiến dịch", "4.9★ đánh giá", "Xuất bản trong ngày"],
    },
    {
      type: "testimonials",
      heading: "Feedback từ người dùng",
      subheading: null,
      body: null,
      ctaLabel: null,
      items: [
        "“Khung rõ ràng, team chỉ việc viết message.” — Minh, Growth",
        "“Từ brief tới demo chỉ vài phút.” — Lan, Performance",
      ],
    },
    {
      type: "faq",
      heading: "Câu hỏi thường gặp",
      subheading: null,
      body: null,
      ctaLabel: null,
      items: [
        "Có cần code không? — Không, chọn khung và generate.",
        "Đổi khung sau khi tạo? — Có thể tạo lại với khung khác.",
      ],
    },
    {
      type: "cta",
      heading: "Sẵn sàng tạo trang của bạn?",
      subheading: "Quay lại wizard, điền brief và tạo bằng AI.",
      body: null,
      ctaLabel: "Bắt đầu tạo trang",
      items: [],
    },
    {
      type: "footer",
      heading: "Pagecraft",
      subheading: null,
      body: "Bản xem thử khung — nội dung mẫu.",
      ctaLabel: null,
      items: ["Trang chủ", "Domains", "Thanh toán"],
    },
  ],
};

export function applyFrameLayoutToContent(
  frame: PageFrame,
  base: GeneratedLandingContent = FRAME_PREVIEW_SAMPLE_CONTENT,
): GeneratedLandingContent {
  const sectionVariants: Record<string, string> = {};
  for (let index = 0; index < base.sections.length; index += 1) {
    const type = base.sections[index]!.type as SectionType;
    const catalog = SECTION_VARIANT_CATALOG[type];
    const preferred = frame.sectionVariantPlan[type];
    sectionVariants[String(index)] =
      preferred && (catalog as readonly string[]).includes(preferred)
        ? preferred
        : catalog[0]!;
  }

  const layout: GeneratedLayout = {
    preset: frame.preset,
    density: frame.density,
    radius: frame.radius,
    sectionVariants,
  };

  return {
    ...base,
    theme: {
      ...base.theme,
      primaryColor: frame.previewAccent,
    },
    layout,
  };
}
