"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button, Input } from "@landing-page-generator/ui";
import type { CreateLandingPageValues } from "../../model/schema";

export type LandingPageFormViewProps = {
  register: UseFormRegister<CreateLandingPageValues>;
  errors: FieldErrors<CreateLandingPageValues>;
  pending: boolean;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function LandingPageFormView({
  register,
  errors,
  pending,
  error,
  onSubmit,
}: LandingPageFormViewProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-border bg-background p-6 shadow-[0_18px_40px_-28px_rgba(6,53,45,0.35)]"
    >
      <div className="space-y-1">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-foreground">
          Tạo landing page
        </h2>
        <p className="text-sm text-muted-foreground">
          Nhập tên chiến dịch — slug được gợi ý tự động, bạn có thể chỉnh lại.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Tên</span>
          <Input placeholder="Summer sale 2026" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name ? <span className="text-xs text-red-600">{errors.name.message}</span> : null}
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Slug</span>
          <Input placeholder="summer-sale-2026" aria-invalid={Boolean(errors.slug)} {...register("slug")} />
          {errors.slug ? <span className="text-xs text-red-600">{errors.slug.message}</span> : null}
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
        {pending ? "Đang tạo..." : "Tạo trang"}
      </Button>
    </form>
  );
}
