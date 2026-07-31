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

export type CreateLandingPageValues = z.infer<typeof createLandingPageSchema>;

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
