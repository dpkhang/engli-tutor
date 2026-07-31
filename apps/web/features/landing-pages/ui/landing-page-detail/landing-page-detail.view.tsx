"use client";

import Link from "next/link";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button, Input } from "@landing-page-generator/ui";
import type { UpdateLandingPageValues } from "../../model/schema";
import { STATUS_LABEL, STATUS_OPTIONS, type LandingPageDetail } from "../../model/types";

export type LandingPageDetailViewProps = {
  page: LandingPageDetail | null;
  isLoading: boolean;
  isError: boolean;
  loadError: string | null;
  register: UseFormRegister<UpdateLandingPageValues>;
  errors: FieldErrors<UpdateLandingPageValues>;
  dirty: boolean;
  pending: boolean;
  deletePending: boolean;
  saveError: string | null;
  deleteError: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onRetry: () => void;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function LandingPageDetailView({
  page,
  isLoading,
  isError,
  loadError,
  register,
  errors,
  dirty,
  pending,
  deletePending,
  saveError,
  deleteError,
  onSubmit,
  onDelete,
  onRetry,
}: LandingPageDetailViewProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} />
          Quay lại danh sách
        </Link>

        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Chi tiết</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            {page?.name ?? "Landing page"}
          </h1>
          {page ? (
            <p className="text-sm text-muted-foreground">
              Cập nhật {formatDate(page.updatedAt)} · tạo {formatDate(page.createdAt)}
            </p>
          ) : null}
        </header>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-red-600">{loadError ?? "Không tải được landing page."}</p>
          <Button type="button" variant="outline" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      ) : null}

      {page && !isError ? (
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-[0_18px_40px_-28px_rgba(6,53,45,0.35)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Tên</span>
              <Input aria-invalid={Boolean(errors.name)} {...register("name")} />
              {errors.name ? <span className="text-xs text-red-600">{errors.name.message}</span> : null}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Slug</span>
              <Input aria-invalid={Boolean(errors.slug)} {...register("slug")} />
              {errors.slug ? <span className="text-xs text-red-600">{errors.slug.message}</span> : null}
            </label>
          </div>

          <label className="block space-y-1.5 text-sm sm:max-w-xs">
            <span className="font-medium text-foreground">Status</span>
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-invalid={Boolean(errors.status)}
              {...register("status")}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
            {errors.status ? (
              <span className="text-xs text-red-600">{errors.status.message}</span>
            ) : null}
          </label>

          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
          {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button
              type="submit"
              disabled={pending || !dirty}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {pending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deletePending}
              onClick={onDelete}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              {deletePending ? "Đang xóa..." : "Xóa trang"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
