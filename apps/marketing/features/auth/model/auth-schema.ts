import { z } from "zod";

const credentials = {
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address")
    .max(254, "Email address is too long")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
};

export const authFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("login"),
    name: z.string().optional(),
    ...credentials,
  }),
  z.object({
    mode: z.literal("register"),
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters")
      .max(80, "Name must be 80 characters or fewer")
      .transform((value) => value.replace(/\s+/g, " ")),
    ...credentials,
  }),
]);

export type AuthFormValues = z.input<typeof authFormSchema>;
export type AuthPayload = z.output<typeof authFormSchema>;
