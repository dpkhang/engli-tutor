"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@landing-page-generator/ui";

export type AuthMode = "login" | "register";

export type LoginPageViewProps = {
  mode: AuthMode;
  pending: boolean;
  error: string | null;
  marketingUrl: string;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPageView({
  mode,
  pending,
  error,
  marketingUrl,
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

      <form className="space-y-4" onSubmit={onSubmit}>
        {mode === "register" ? (
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Họ và tên</span>
            <Input name="name" placeholder="Nguyễn Văn A" required disabled={pending} />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <Input
            name="email"
            type="email"
            placeholder="ban@congty.com"
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
            disabled={pending}
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </Button>
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
