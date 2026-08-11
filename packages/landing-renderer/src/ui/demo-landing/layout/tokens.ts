import type { CSSProperties } from "react";
import type { GeneratedLandingContent, GeneratedLayout } from "../../../model/generated-content";

export type LayoutTokens = {
  style: CSSProperties;
  sectionPad: string;
  cardRadius: string;
  maxWidth: string;
};

const DENSITY_PAD: Record<GeneratedLayout["density"], string> = {
  compact: "py-12 sm:py-14",
  comfortable: "py-16 sm:py-20",
  airy: "py-20 sm:py-28",
};

const RADIUS: Record<GeneratedLayout["radius"], string> = {
  sharp: "0.5rem",
  soft: "1rem",
  pill: "1.5rem",
};

const PRESET_MAX_WIDTH: Record<GeneratedLayout["preset"], string> = {
  "bold-split": "max-w-6xl",
  "editorial-stack": "max-w-4xl",
  "minimal-center": "max-w-3xl",
  "soft-cards": "max-w-5xl",
};

function fontFamilyFromStyle(fontStyle: string): string {
  const value = fontStyle.toLowerCase();
  if (value.includes("serif") || value.includes("editorial") || value.includes("classic")) {
    return 'Georgia, "Times New Roman", serif';
  }
  if (value.includes("mono") || value.includes("tech") || value.includes("code")) {
    return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  }
  if (value.includes("display") || value.includes("bold") || value.includes("impact")) {
    return 'var(--font-display, "Segoe UI", system-ui, sans-serif)';
  }
  return 'var(--font-sans, system-ui, -apple-system, "Segoe UI", sans-serif)';
}

export function buildLayoutTokens(
  content: GeneratedLandingContent,
  layout: GeneratedLayout,
): LayoutTokens {
  const { primaryColor, secondaryColor, fontStyle } = content.theme;

  return {
    style: {
      ["--lp-primary" as string]: primaryColor,
      ["--lp-secondary" as string]: secondaryColor,
      ["--lp-radius" as string]: RADIUS[layout.radius],
      fontFamily: fontFamilyFromStyle(fontStyle),
    } as CSSProperties,
    sectionPad: DENSITY_PAD[layout.density],
    cardRadius: "var(--lp-radius)",
    maxWidth: PRESET_MAX_WIDTH[layout.preset],
  };
}
