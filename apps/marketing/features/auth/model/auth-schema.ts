import { z } from "zod";

const credentials = {
  email: z
    .string()
    .trim()
    .min(1, "auth.validation.emailRequired")
    .email("auth.validation.emailInvalid")
    .max(254, "auth.validation.emailTooLong")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "auth.validation.passwordTooShort")
    .max(128, "auth.validation.passwordTooLong"),
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
      .min(2, "auth.validation.nameTooShort")
      .max(80, "auth.validation.nameTooLong")
      .transform((value) => value.replace(/\s+/g, " ")),
    ...credentials,
  }),
]);

export type AuthFormValues = z.input<typeof authFormSchema>;
export type AuthPayload = z.output<typeof authFormSchema>;
