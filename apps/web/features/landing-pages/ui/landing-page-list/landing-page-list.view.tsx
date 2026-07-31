"use client";

import { Button } from "@landing-page-generator/ui";
import type { LandingPage } from "../../model/types";

const STATUS_LABEL: Record<LandingPage["status"], string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export type LandingPageListViewProps = {
  pages: LandingPage[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
};

export function LandingPageListView({
  pages,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: LandingPageListViewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-foreground">
            Landing pages
          </h2>
          <p className="text-sm text-muted-foreground">Danh sách trang trong workspace.</p>
        </div>
        {!isLoading && !isError ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {pages.length} trang
          </p>
        ) : null}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      {isError ? (
        <div className="space-y-3 rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-red-600">
            {errorMessage ?? "Không thể kết nối backend. Kiểm tra `NEXT_PUBLIC_API_URL` và `be` đang chạy."}
          </p>
          <Button type="button" variant="outline" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 px-5 py-8 text-sm text-muted-foreground">
          Chưa có landing page nào. Tạo trang đầu tiên ở form phía trên.
        </p>
      ) : null}

      {!isLoading && !isError && pages.length > 0 ? (
        <div className="grid gap-3">
          {pages.map((page) => (
            <article
              key={page.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-5 py-4"
            >
              <div className="min-w-0">
                <h3 className="truncate font-medium text-foreground">{page.name}</h3>
                <p className="truncate text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {STATUS_LABEL[page.status]}
              </span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
