import { z } from "zod";

export const generatedLandingContentSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    fontStyle: z.string(),
  }),
  sections: z
    .array(
      z.object({
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
      }),
    )
    .min(3)
    .max(10),
});

export type GeneratedLandingContent = z.infer<typeof generatedLandingContentSchema>;
export type GeneratedSection = GeneratedLandingContent["sections"][number];

export function parseGeneratedContent(value: unknown): GeneratedLandingContent | null {
  const result = generatedLandingContentSchema.safeParse(value);
  return result.success ? result.data : null;
}
