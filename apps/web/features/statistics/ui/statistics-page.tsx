"use client";

import { Archive, CircleCheck, FileText, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useLandingPages } from "@/features/landing-pages/hooks/use-landing-pages";

export default function StatisticsPage() {
  const { data: pages = [], isLoading } = useLandingPages();
  const counts = {
    published: pages.filter((page) => page.status === "PUBLISHED").length,
    draft: pages.filter((page) => page.status === "DRAFT").length,
    archived: pages.filter((page) => page.status === "ARCHIVED").length,
  };
  const total = pages.length || 1;
  const rows = [
    { label: "Published", count: counts.published, color: "bg-primary", icon: CircleCheck },
    { label: "Draft", count: counts.draft, color: "bg-amber-500", icon: FileText },
    { label: "Archived", count: counts.archived, color: "bg-muted-foreground", icon: Archive },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Thống kê"
        description="Số liệu nội dung được tổng hợp trực tiếp từ landing page trong workspace."
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tổng số trang", value: pages.length, icon: PieChart },
          ...rows.map((row) => ({ label: row.label, value: row.count, icon: row.icon })),
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-4 shadow-none">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4.5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{isLoading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Phân bổ trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {rows.map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="font-semibold">
                  {row.count} · {Math.round((row.count / total) * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${(row.count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">
            Lượt xem và conversion cần analytics endpoint từ backend; màn hình hiện không tạo dữ
            liệu giả.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
