"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileSearch, LoaderCircle, PencilLine, Search } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@landing-page-generator/ui";
import { STATUS_LABEL, type LandingPage } from "../../model/types";
import type { StatusFilter } from ".";

export type LandingPageListViewProps = {
  pages: LandingPage[];
  total: number;
  search: string;
  status: StatusFilter;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  actionError: string | null;
  togglingId: string | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onActiveChange: (id: string, active: boolean) => void;
};

function statusVariant(status: LandingPage["status"]) {
  if (status === "PUBLISHED") return "default" as const;
  if (status === "ARCHIVED") return "outline" as const;
  return "secondary" as const;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}

function LandingPageCardSkeleton() {
  return (
    <Card aria-hidden="true" className="gap-4 overflow-hidden py-0 shadow-none">
      <div className="relative h-24 animate-pulse border-b bg-muted/70 p-4">
        <div className="flex items-start justify-between">
          <div className="h-6 w-24 rounded-md bg-muted-foreground/15" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-9 rounded-full bg-muted-foreground/15" />
            <div className="size-8 rounded-md bg-muted-foreground/15" />
          </div>
        </div>
        <div className="absolute right-4 bottom-3 h-5 w-16 rounded-full bg-muted-foreground/15" />
      </div>
      <CardContent className="space-y-4 pb-5">
        <div className="animate-pulse space-y-2">
          <div className="h-5 w-2/3 rounded bg-muted" />
          <div className="h-3.5 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

export function LandingPageListView({
  pages,
  total,
  search,
  status,
  isLoading,
  isError,
  errorMessage,
  actionError,
  togglingId,
  onSearchChange,
  onStatusChange,
  onClearFilters,
  onRetry,
  onActiveChange,
}: LandingPageListViewProps) {
  const hasFilters = Boolean(search) || status !== "ALL";

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Thư viện trang
          </h2>
          <p className="text-sm text-muted-foreground">
            Tìm kiếm và quản lý các chiến dịch trong workspace.
          </p>
        </div>
        <Badge variant="secondary">{total} trang</Badge>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên hoặc slug..."
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <LandingPageCardSkeleton key={item} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{errorMessage ?? "Không thể kết nối backend."}</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {actionError ? (
        <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>
      ) : null}

      {!isLoading && !isError && pages.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="mb-4 grid size-12 place-items-center rounded-full bg-muted">
              <FileSearch className="size-5 text-muted-foreground" />
            </span>
            <p className="font-semibold">
              {hasFilters ? "Không tìm thấy trang phù hợp" : "Chưa có landing page"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {hasFilters
                ? "Thử đổi từ khóa hoặc bộ lọc trạng thái."
                : "Bấm “Tạo landing page” để bắt đầu chiến dịch đầu tiên."}
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onClearFilters}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && pages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Card
              key={page.id}
              className="group gap-4 overflow-hidden py-0 shadow-none transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <div className="relative h-24 border-b bg-[linear-gradient(135deg,hsl(var(--primary)/.13),hsl(var(--surface)))] p-4">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-background/80 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    /{page.slug}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={page.status === "PUBLISHED"}
                      aria-label={`${page.status === "PUBLISHED" ? "Tắt" : "Bật"} landing page ${page.name}`}
                      disabled={togglingId === page.id || !page.hasContent}
                      onClick={() => onActiveChange(page.id, page.status !== "PUBLISHED")}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                        page.status === "PUBLISHED" ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-full bg-white shadow-sm transition-transform",
                          page.status === "PUBLISHED" ? "translate-x-[18px]" : "translate-x-0.5",
                        )}
                      >
                        {togglingId === page.id ? <LoaderCircle className="size-2.5 animate-spin text-primary" /> : null}
                      </span>
                    </button>
                    <Button
                      asChild={Boolean(page.hasContent)}
                      variant="ghost"
                      size="icon"
                      className="size-8 bg-background/70"
                      disabled={!page.hasContent}
                      aria-label={page.hasContent ? `Sửa nội dung ${page.name}` : "Trang chưa có nội dung"}
                    >
                      {page.hasContent ? (
                        <Link href={`/pages/${page.id}/edit`}><PencilLine className="size-4" /></Link>
                      ) : (
                        <PencilLine className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Badge className="absolute right-4 bottom-3" variant={statusVariant(page.status)}>
                  {STATUS_LABEL[page.status]}
                </Badge>
              </div>
              <CardContent className="space-y-4 pb-5">
                <div>
                  <h3 className="truncate font-semibold">{page.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Cập nhật {formatDate(page.updatedAt)}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={`/pages/${page.id}`}>
                    Quản lý trang <ArrowUpRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
