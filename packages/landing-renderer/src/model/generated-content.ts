import { z } from "zod";

export const LAYOUT_PRESETS = [
  "bold-split",
  "editorial-stack",
  "minimal-center",
  "soft-cards",
] as const;

export const LAYOUT_DENSITIES = ["compact", "comfortable", "airy"] as const;
export const LAYOUT_RADII = ["sharp", "soft", "pill"] as const;

export const SECTION_VARIANT_CATALOG = {
  hero: ["split-form", "centered-cta", "asymmetric"],
  features: ["grid-3", "list-check", "bento"],
  "social-proof": ["stat-row", "logo-strip", "quote-banner"],
  testimonials: ["cards-2", "carousel-stack"],
  faq: ["accordion", "two-column"],
  cta: ["split-form", "centered-band"],
  footer: ["simple", "columns"],
} as const;

export type SectionType = keyof typeof SECTION_VARIANT_CATALOG;

export const generatedLayoutSchema = z.object({
  preset: z.enum(LAYOUT_PRESETS),
  density: z.enum(LAYOUT_DENSITIES),
  radius: z.enum(LAYOUT_RADII),
  sectionVariants: z.record(z.string(), z.string()),
});

export const generatedSectionSchema = z.object({
  type: z.enum([
    "hero",
    "features",
    "social-proof",
    "testimonials",
    "faq",
    "cta",
    "footer",
  ]),
  heading: z.string(),
  subheading: z.string().nullable(),
  body: z.string().nullable(),
  ctaLabel: z.string().nullable(),
  items: z.array(z.string()),
});

export const generatedLandingContentSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    fontStyle: z.string(),
  }),
  sections: z.array(generatedSectionSchema).min(3).max(10),
  layout: generatedLayoutSchema.optional(),
  media: z.object({ heroImageUrl: z.string().url() }).optional(),
});

export type LayoutPreset = (typeof LAYOUT_PRESETS)[number];
export type LayoutDensity = (typeof LAYOUT_DENSITIES)[number];
export type LayoutRadius = (typeof LAYOUT_RADII)[number];
export type GeneratedLayout = z.infer<typeof generatedLayoutSchema>;
export type GeneratedLandingContent = z.infer<typeof generatedLandingContentSchema>;
export type GeneratedSection = z.infer<typeof generatedSectionSchema>;

export function parseGeneratedContent(value: unknown): GeneratedLandingContent | null {
  const result = generatedLandingContentSchema.safeParse(value);
  return result.success ? result.data : null;
}

function hashSeed(seed: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    return (hash >>> 0) / 0xffffffff;
  };
}

function pickFromSeed<T>(items: readonly T[], next: () => number): T {
  return items[Math.floor(next() * items.length) % items.length]!;
}

/** Prefer stored layout; otherwise derive a stable recipe from landingPageId. */
export function resolveLayout(
  content: GeneratedLandingContent,
  seed: string,
): GeneratedLayout {
  if (content.layout) {
    const sectionVariants = { ...content.layout.sectionVariants };
    for (let index = 0; index < content.sections.length; index += 1) {
      const key = String(index);
      if (sectionVariants[key]) continue;
      const type = content.sections[index]!.type as SectionType;
      sectionVariants[key] = SECTION_VARIANT_CATALOG[type][0]!;
    }
    return { ...content.layout, sectionVariants };
  }

  const next = hashSeed(seed);
  const sectionVariants: Record<string, string> = {};
  for (let index = 0; index < content.sections.length; index += 1) {
    const type = content.sections[index]!.type as SectionType;
    sectionVariants[String(index)] = pickFromSeed(SECTION_VARIANT_CATALOG[type], next);
  }

  return {
    preset: pickFromSeed(LAYOUT_PRESETS, next),
    density: pickFromSeed(LAYOUT_DENSITIES, next),
    radius: pickFromSeed(LAYOUT_RADII, next),
    sectionVariants,
  };
}

export function resolveSectionVariant(
  layout: GeneratedLayout,
  section: GeneratedSection,
  index: number,
): string {
  const stored = layout.sectionVariants[String(index)];
  const catalog = SECTION_VARIANT_CATALOG[section.type as SectionType];
  if (stored && (catalog as readonly string[]).includes(stored)) return stored;
  return catalog[0]!;
}
