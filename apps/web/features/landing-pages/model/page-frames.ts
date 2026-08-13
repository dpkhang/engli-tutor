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

export const FUNNEL_LABEL: Record<PageFrameFunnel, string> = {
  LEADS: "Leads",
  SALES: "Sales",
  REGISTRATION: "Đăng ký",
  AWARENESS: "Awareness",
};

export function getPageFrameById(frames: PageFrame[], id: string | null | undefined): PageFrame | undefined {
  if (!id) return undefined;
  return frames.find((frame) => frame.id === id);
}

export function templateToPageFrame(template: { content: unknown }): PageFrame | null {
  if (!template.content || typeof template.content !== "object") return null;
  const value = template.content as { kind?: unknown; frame?: Partial<PageFrame> };
  const frame = value.frame;
  if (value.kind !== "PAGE_FRAME" || !frame) return null;
  if (!frame.id || !frame.name || !frame.description || !frame.funnel || !frame.preset || !frame.density || !frame.radius || !frame.sectionVariantPlan || !frame.previewAccent) return null;
  return frame as PageFrame;
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
