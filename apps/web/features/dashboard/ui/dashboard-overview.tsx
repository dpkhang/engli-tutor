"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, Clock3, FileText, Plus } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useLandingPages } from "@/features/landing-pages/hooks/use-landing-pages";

export function DashboardOverview() {
  const { data: pages = [], isLoading } = useLandingPages();
  const published = pages.filter((page) => page.status === "PUBLISHED").length;
  const drafts = pages.filter((page) => page.status === "DRAFT").length;
  const recentPages = pages.slice(0, 4);

  const stats = [
    { label: "Tổng landing page", value: pages.length, icon: FileText },
    { label: "Đã xuất bản", value: published, icon: CircleCheck },
    { label: "Bản nháp", value: drafts, icon: Clock3 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Tổng quan"
        description="Theo dõi nhanh nội dung, trạng thái xuất bản và hoạt động gần đây của workspace."
        action={
          <Button asChild>
            <Link href="/landing-pages">
              <Plus /> Tạo landing page
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-4 shadow-none">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{isLoading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Landing page gần đây</CardTitle>
            <p className="text-sm text-muted-foreground">Các trang được cập nhật mới nhất.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/landing-pages">Xem tất cả <ArrowRight /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}
          {!isLoading && recentPages.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Chưa có landing page. Hãy tạo trang đầu tiên để bắt đầu.
            </div>
          ) : null}
          <div className="divide-y">
            {recentPages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.id}`}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{page.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>
                  {page.status === "PUBLISHED" ? "Published" : page.status === "DRAFT" ? "Draft" : "Archived"}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
