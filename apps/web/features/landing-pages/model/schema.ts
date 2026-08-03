import { z } from "zod";

export const createLandingPageSchema = z.object({
  name: z.string().trim().min(3, "Tên tối thiểu 3 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .min(3, "Slug tối thiểu 3 ký tự")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Chỉ dùng a-z, 0-9 và dấu gạch ngang"),
});

export const updateLandingPageSchema = createLandingPageSchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type CreateLandingPageValues = z.infer<typeof createLandingPageSchema>;
export type UpdateLandingPageValues = z.infer<typeof updateLandingPageSchema>;

export const createLandingPageAdvancedSchema = createLandingPageSchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED"]),
  description: z.string().trim().max(240, "Mô tả tối đa 240 ký tự"),
  category: z.enum(["MARKETING", "PRODUCT", "EVENT", "PORTFOLIO", "OTHER"]),
  objective: z.enum(["LEADS", "SALES", "REGISTRATION", "AWARENESS"]),
  template: z.enum(["BLANK", "PRODUCT_LAUNCH", "EVENT", "LEAD_CAPTURE"]),
  tags: z.array(z.string().trim().min(1).max(24)).max(5, "Tối đa 5 tags"),
});

export type CreateLandingPageAdvancedValues = z.infer<
  typeof createLandingPageAdvancedSchema
>;

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
