"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Archive,
  CircleCheck,
  CirclePlus,
  Coins,
  FileText,
  PieChart,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useLandingPages } from "@/features/landing-pages/hooks/use-landing-pages";
import { useBillingMe } from "@/features/payments/hooks/use-billing";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
);

export default function StatisticsPage() {
  const { data: pages = [], isLoading } = useLandingPages();
  const billing = useBillingMe();
  const counts = {
    published: pages.filter((page) => page.status === "PUBLISHED").length,
    draft: pages.filter((page) => page.status === "DRAFT").length,
    archived: pages.filter((page) => page.status === "ARCHIVED").length,
  };
  const total = pages.length || 1;
  const rows = [
    { label: "Published", count: counts.published, color: "#16805f", icon: CircleCheck },
    { label: "Draft", count: counts.draft, color: "#d89a32", icon: FileText },
    { label: "Archived", count: counts.archived, color: "#858b94", icon: Archive },
  ];
  const chartData = {
    labels: rows.map((row) => row.label),
    datasets: [
      {
        label: "Landing pages",
        data: rows.map((row) => row.count),
        backgroundColor: rows.map((row) => row.color),
        borderRadius: 6,
        borderSkipped: false as const,
        maxBarThickness: 64,
      },
    ],
  };
  const ledger = billing.data?.ledger ?? [];
  const creditsUsed = ledger.reduce((total, entry) => total + (entry.delta < 0 ? -entry.delta : 0), 0);
  const creditsAdded = ledger.reduce((total, entry) => total + (entry.delta > 0 ? entry.delta : 0), 0);
  const aiGenerations = ledger.filter((entry) => entry.reason === "AI_GENERATE").length;
  const usageByDay = new Map<string, number>();
  [...ledger]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .filter((entry) => entry.delta < 0)
    .forEach((entry) => {
      const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(
        new Date(entry.createdAt),
      );
      usageByDay.set(date, (usageByDay.get(date) ?? 0) + -entry.delta);
    });
  const creditUsage = [...usageByDay.entries()].slice(-14);
  const hasCreditUsage = creditUsage.length > 0;
  const creditChartData = {
    labels: hasCreditUsage ? creditUsage.map(([date]) => date) : ["Chưa có"],
    datasets: [
      {
        label: "Credit đã dùng",
        data: hasCreditUsage ? creditUsage.map(([, value]) => value) : [0],
        borderColor: "#16805f",
        backgroundColor: "rgba(22, 128, 95, 0.14)",
        borderWidth: 2,
        pointRadius: hasCreditUsage ? 3 : 0,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
    ],
  };

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
          <p className="text-sm text-muted-foreground">So sánh số lượng trang theo trạng thái hiện tại.</p>
        </CardHeader>
        <CardContent>
          <div className="relative h-72 w-full">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      afterLabel: (context) =>
                        `${Math.round(((context.raw as number) / total) * 100)}% tổng số trang`,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: "#858b94", font: { size: 12, weight: 500 } },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: "#858b94" },
                    grid: { color: "rgba(133, 139, 148, 0.14)" },
                    border: { display: false },
                  },
                },
              }}
            />
            {!isLoading && pages.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu landing page.</p>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t pt-4 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
                {row.label}
                <span className="font-semibold text-foreground">
                  {row.count} · {Math.round((row.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="pt-4 text-xs text-muted-foreground">
            Lượt xem và conversion cần analytics endpoint từ backend; màn hình hiện không tạo dữ
            liệu giả.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Sử dụng credit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng hợp từ lịch sử giao dịch credit của workspace.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Số dư hiện tại", value: billing.data?.balance ?? 0, icon: Coins },
            { label: "Đã sử dụng", value: creditsUsed, icon: TrendingDown },
            { label: "Đã được cộng", value: creditsAdded, icon: CirclePlus },
            { label: "Lượt AI generate", value: aiGenerations, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="gap-3 py-4 shadow-none">
              <CardContent className="flex items-start justify-between px-4">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {billing.isLoading ? "—" : value}
                  </p>
                </div>
                <Icon className="size-5 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Credit tiêu thụ theo ngày</CardTitle>
            <p className="text-sm text-muted-foreground">Tối đa 14 ngày có phát sinh sử dụng gần nhất.</p>
          </CardHeader>
          <CardContent>
            <div className="relative h-72 w-full">
              <Line
                data={creditChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 500 },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: hasCreditUsage },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#858b94" },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0, color: "#858b94" },
                      grid: { color: "rgba(133, 139, 148, 0.14)" },
                      border: { display: false },
                    },
                  },
                }}
              />
              {!billing.isLoading && !hasCreditUsage ? (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <p className="text-sm text-muted-foreground">Chưa phát sinh sử dụng credit.</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
