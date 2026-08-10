import { z } from "zod";

const credentialsSchema = {
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
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
      .min(2, "Họ và tên tối thiểu 2 ký tự")
      .max(80, "Họ và tên tối đa 80 ký tự"),
    ...credentialsSchema,
  }),
]);

export type LoginFormValues = z.infer<typeof loginFormSchema>;
