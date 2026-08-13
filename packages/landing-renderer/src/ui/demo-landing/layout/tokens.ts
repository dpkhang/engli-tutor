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
      // Generated pages own their visual theme and must not inherit the workspace dark mode.
      ["--background" as string]: "160 28% 97%",
      ["--foreground" as string]: "168 42% 10%",
      ["--card" as string]: "0 0% 100%",
      ["--card-foreground" as string]: "168 42% 10%",
      ["--popover" as string]: "0 0% 100%",
      ["--popover-foreground" as string]: "168 42% 10%",
      ["--primary" as string]: "166 58% 28%",
      ["--primary-foreground" as string]: "150 40% 98%",
      ["--secondary" as string]: "158 18% 90%",
      ["--secondary-foreground" as string]: "168 42% 10%",
      ["--muted" as string]: "158 18% 90%",
      ["--muted-foreground" as string]: "168 12% 38%",
      ["--accent" as string]: "158 72% 42%",
      ["--accent-foreground" as string]: "168 42% 8%",
      ["--border" as string]: "160 16% 82%",
      ["--input" as string]: "160 16% 82%",
      ["--ring" as string]: "166 58% 28%",
      ["--surface" as string]: "158 22% 93%",
      colorScheme: "light",
      fontFamily: fontFamilyFromStyle(fontStyle),
    } as CSSProperties,
    sectionPad: DENSITY_PAD[layout.density],
    cardRadius: "var(--lp-radius)",
    maxWidth: PRESET_MAX_WIDTH[layout.preset],
  };
}
