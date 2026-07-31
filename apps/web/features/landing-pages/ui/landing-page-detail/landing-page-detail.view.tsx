"use client";

import Link from "next/link";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@landing-page-generator/ui";
import type { UpdateLandingPageValues } from "../../model/schema";
import { STATUS_LABEL, STATUS_OPTIONS, type LandingPageDetail } from "../../model/types";

export type LandingPageDetailViewProps = {
  page: LandingPageDetail | null;
  isLoading: boolean;
  isError: boolean;
  loadError: string | null;
  register: UseFormRegister<UpdateLandingPageValues>;
  control: Control<UpdateLandingPageValues>;
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
  control,
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
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="size-3.5" strokeWidth={2} />
            Quay lại danh sách
          </Link>
        </Button>

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
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{loadError ?? "Không tải được landing page."}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {page && !isError ? (
        <Card>
          <form onSubmit={onSubmit}>
            <CardHeader className="sr-only">
              <span>Chỉnh sửa landing page</span>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên</Label>
                  <Input id="edit-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
                  {errors.name ? (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input id="edit-slug" aria-invalid={Boolean(errors.slug)} {...register("slug")} />
                  {errors.slug ? (
                    <p className="text-xs text-destructive">{errors.slug.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 sm:max-w-xs">
                <Label htmlFor="edit-status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-status" className="w-full" aria-invalid={Boolean(errors.status)}>
                        <SelectValue placeholder="Chọn status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status ? (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                ) : null}
              </div>

              {saveError ? (
                <Alert variant="destructive">
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              ) : null}
              {deleteError ? (
                <Alert variant="destructive">
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={pending || !dirty}>
                {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletePending}
                onClick={onDelete}
              >
                {deletePending ? "Đang xóa..." : "Xóa trang"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
