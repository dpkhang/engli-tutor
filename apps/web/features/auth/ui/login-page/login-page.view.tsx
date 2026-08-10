"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button, Input } from "@landing-page-generator/ui";
import type { LoginFormValues } from "../../model/login-schema";

export type AuthMode = "login" | "register";

export type LoginPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  marketingUrl: string;
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPageView({
  mode,
  pending,
  error,
  marketingUrl,
  register,
  errors,
  onModeChange,
  onSubmit,
}: LoginPageViewProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center space-y-8">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Vào workspace để quản lý landing page."
            : "Tạo tài khoản để bắt đầu xuất bản trang."}
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

      <form className="space-y-2.5" onSubmit={onSubmit} noValidate>
        {mode === "register" ? (
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-foreground">Họ và tên</span>
            <Input
              placeholder="Nguyễn Văn A"
              disabled={pending}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <p className="min-h-3 text-[11px] leading-3 text-destructive">
              {errors.name?.message ?? ""}
            </p>
          </label>
        ) : null}

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <Input
            type="email"
            placeholder="ban@congty.com"
            autoComplete="email"
            disabled={pending}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <p className="min-h-3 text-[11px] leading-3 text-destructive">
            {errors.email?.message ?? ""}
          </p>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Mật khẩu</span>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={pending}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <p className="min-h-3 text-[11px] leading-3 text-destructive">
            {errors.password?.message ?? ""}
          </p>
        </label>

        <p className="min-h-4 text-xs leading-4 text-destructive" role={error ? "alert" : undefined}>
          {error ?? ""}
        </p>

        <div className="pt-1.5">
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        <a href={marketingUrl} className="font-medium text-primary hover:underline">
          ← Về trang marketing
        </a>
        {" · "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Workspace
        </Link>
      </p>
    </main>
  );
}
