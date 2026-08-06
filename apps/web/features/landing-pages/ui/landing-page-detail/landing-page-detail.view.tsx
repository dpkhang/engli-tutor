"use client";

import Link from "next/link";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Copy,
  Eye,
  FileCode2,
  PencilLine,
  Globe2,
  Layers3,
  Save,
  Settings2,
  Trash2,
  Target,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@landing-page-generator/ui";
import type { UpdateLandingPageValues } from "../../model/schema";
import type { LandingPageLocalMetadata } from "../../model/local-metadata";
import { STATUS_LABEL, STATUS_OPTIONS, type LandingPageDetail } from "../../model/types";

export type LandingPageDetailViewProps = {
  page: LandingPageDetail | null;
  localMetadata: LandingPageLocalMetadata | null;
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
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(value),
  );
}

function statusVariant(status: LandingPageDetail["status"]) {
  if (status === "PUBLISHED") return "default" as const;
  if (status === "ARCHIVED") return "outline" as const;
  return "secondary" as const;
}

export function LandingPageDetailView({
  page,
  localMetadata,
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
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>{loadError ?? "Không tải được landing page."}</span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!page) return null;

  const publicPath = `/${page.slug}`;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/landing-pages">
            <ArrowLeft /> Quay lại Landing pages
          </Link>
        </Button>
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
                Chi tiết trang
              </p>
              <Badge variant={statusVariant(page.status)}>{STATUS_LABEL[page.status]}</Badge>
            </div>
            <h1 className="truncate font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
              {page.name}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">{publicPath}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {page.content ? (
              <Button type="button" asChild>
                <Link href={`/demo/${page.slug}`}>
                  <Eye /> Xem demo
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigator.clipboard.writeText(publicPath)}
            >
              <Copy /> Sao chép đường dẫn
            </Button>
          </div>
        </header>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-3 py-4 shadow-none">
          <CardContent className="flex items-center gap-3 px-4">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Globe2 className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Trạng thái</p>
              <p className="text-sm font-semibold">{STATUS_LABEL[page.status]}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-3 py-4 shadow-none">
          <CardContent className="flex items-center gap-3 px-4">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Tạo lúc</p>
              <p className="text-sm font-semibold">{formatDate(page.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-3 py-4 shadow-none">
          <CardContent className="flex items-center gap-3 px-4">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Save className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Cập nhật</p>
              <p className="text-sm font-semibold">{formatDate(page.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-5 text-primary" /> Thông tin chung
              </CardTitle>
              <CardDescription>
                Tên hiển thị và đường dẫn định danh của landing page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên trang</Label>
                <Input id="edit-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <div className="flex items-center rounded-md border bg-muted/40 pl-3 focus-within:ring-2 focus-within:ring-ring/40">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="edit-slug"
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                    aria-invalid={Boolean(errors.slug)}
                    {...register("slug")}
                  />
                </div>
                {errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái xuất bản</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-status" className="w-full">
                        <SelectValue />
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
            </CardContent>
            <CardFooter className="justify-between border-t">
              <p className="text-xs text-muted-foreground">
                {dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}
              </p>
              <Button type="submit" disabled={pending || !dirty}>
                <Save /> {pending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="space-y-6">
          {localMetadata ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers3 className="size-5 text-primary" /> Phân loại
                </CardTitle>
                <CardDescription>Metadata cục bộ trên trình duyệt hiện tại.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Danh mục</span>
                  <Badge variant="outline">{localMetadata.category}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="size-4" /> Mục tiêu
                  </span>
                  <span className="font-medium">{localMetadata.objective}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">{localMetadata.template}</span>
                </div>
                {localMetadata.description ? (
                  <p className="rounded-lg bg-muted p-3 text-xs leading-5 text-muted-foreground">
                    {localMetadata.description}
                  </p>
                ) : null}
                {localMetadata.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {localMetadata.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode2 className="size-5 text-primary" /> Nội dung trang
              </CardTitle>
              <CardDescription>Blocks, SEO metadata và theme của landing page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed p-6 text-center">
                {page.content ? (
                  <>
                    <p className="text-sm font-semibold">Đã có nội dung AI</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Mở demo để xem landing page đầy đủ và thử form thu thập leads.
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
                      <Link href={`/pages/${page.id}/edit`}>
                        <PencilLine /> Chỉnh sửa nội dung
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">Chưa có nội dung AI</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Tạo trang mới bằng chế độ &quot;Tạo bằng AI&quot; để sinh content và mở demo.
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/landing-pages/new">Tạo bằng AI</Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" /> Danger zone
              </CardTitle>
              <CardDescription>Xóa vĩnh viễn trang và dữ liệu liên quan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deleteError ? (
                <Alert variant="destructive">
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={deletePending}
                onClick={onDelete}
              >
                <Trash2 /> {deletePending ? "Đang xóa..." : "Xóa landing page"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
