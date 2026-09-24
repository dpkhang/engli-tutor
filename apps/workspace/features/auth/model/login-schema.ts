import { z } from "zod";

const credentialsSchema = {
  email: z.string().trim().min(1, "Please enter your email").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
};

export const loginFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("login"),
    name: z.string().optional(),
    ...credentialsSchema,
  }),
  z.object({
    mode: z.literal("register"),
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be at most 80 characters"),
    ...credentialsSchema,
  }),
]);

export type LoginFormValues = z.infer<typeof loginFormSchema>;
