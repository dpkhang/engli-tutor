"use client";

import Link from "next/link";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@landing-page-generator/ui";
import { STATUS_LABEL, type LandingPage } from "../../model/types";

export type LandingPageListViewProps = {
  pages: LandingPage[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
};

function statusVariant(status: LandingPage["status"]) {
  if (status === "PUBLISHED") return "default" as const;
  if (status === "ARCHIVED") return "outline" as const;
  return "secondary" as const;
}

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
          <Badge variant="secondary">{pages.length} trang</Badge>
        ) : null}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>
              {errorMessage ??
                "Không thể kết nối backend. Kiểm tra `NEXT_PUBLIC_API_URL` và `be` đang chạy."}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !isError && pages.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              Chưa có landing page nào. Tạo trang đầu tiên ở form phía trên.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && pages.length > 0 ? (
        <div className="grid gap-3">
          {pages.map((page) => (
            <Link key={page.id} href={`/pages/${page.id}`} className="block">
              <Card className="transition-colors hover:border-accent/50 hover:bg-surface/60">
                <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 py-0">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate text-base font-medium">{page.name}</CardTitle>
                    <CardDescription className="truncate">/{page.slug}</CardDescription>
                  </div>
                  <Badge variant={statusVariant(page.status)}>{STATUS_LABEL[page.status]}</Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
