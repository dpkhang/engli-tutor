"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { SocialAuthButtons } from "../social-auth-buttons";

export type AuthMode = "login" | "register";

export type AuthPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthPageView({
  mode,
  pending,
  error,
  onModeChange,
  onSubmit,
}: AuthPageViewProps) {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(ellipse_at_top_left,hsl(158_30%_90%),hsl(var(--background))_50%)]">
      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-stretch gap-0 px-5 pt-24 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-20 lg:pb-20">
        <motion.div
          className="flex w-full max-w-md items-center justify-self-center lg:justify-self-start"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full space-y-8 border-b border-border pb-10 lg:border-0 lg:pb-0">
            <div className="space-y-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Chào mừng trở lại Pagecraft."
                  : "Bắt đầu dựng landing page đầu tiên của bạn."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "login"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={pending}
                onClick={() => onModeChange("login")}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === "register"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={pending}
                onClick={() => onModeChange("register")}
              >
                Đăng ký
              </button>
            </div>

            <SocialAuthButtons mode={mode} disabled={pending} />

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>hoặc dùng email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === "register" && (
                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-foreground">Họ và tên</span>
                  <Input
                    name="name"
                    placeholder="Nguyễn Văn A"
                    className="h-11 w-full bg-background"
                    required
                    disabled={pending}
                  />
                </label>
              )}

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Email</span>
                <Input
                  name="email"
                  type="email"
                  placeholder="ban@congty.com"
                  className="h-11 w-full bg-background"
                  autoComplete="email"
                  required
                  disabled={pending}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-foreground">Mật khẩu</span>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 w-full bg-background"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  disabled={pending}
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" className="h-11 w-full" size="lg" disabled={pending}>
                {pending
                  ? "Đang vào workspace..."
                  : mode === "login"
                    ? "Đăng nhập"
                    : "Tạo tài khoản"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo: sau khi đăng nhập sẽ về trang chủ với menu Workspace.
              </p>
            </form>

            <p className="text-sm text-muted-foreground">
              Quay lại{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                trang chủ
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.aside
          className="relative mt-10 hidden overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#06352d,#0a4a3c_45%,#1f8a68)] p-10 text-primary-foreground lg:mt-0 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-end"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <motion.div
            aria-hidden
            className="absolute -top-10 -right-10 h-48 w-48 rounded-full border border-white/15"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="font-[family-name:var(--font-display)] text-4xl leading-tight">
            Vào workspace và xuất bản trang tiếp theo.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            Đăng nhập nhanh bằng Google, Apple, Facebook hoặc GitHub — rồi quản lý landing page
            trong cùng một chỗ.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
