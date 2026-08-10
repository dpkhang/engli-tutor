"use client";

import Link from "next/link";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  ArrowRight,
  CircleCheck,
  Clock3,
  Coins,
  CreditCard,
  FileText,
  Globe2,
  Images,
  Plus,
  UsersRound,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@landing-page-generator/ui";
import { PageHeader } from "@/features/layout";
import { useLandingPages } from "@/features/landing-pages/hooks/use-landing-pages";
import { domainHooks, leadHooks, mediaHooks, useSettings } from "@/features/workspace-api/hooks";
import { useBillingMe } from "@/features/payments/hooks/use-billing";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_LABEL = {
  PUBLISHED: "Đã xuất bản",
  DRAFT: "Bản nháp",
  ARCHIVED: "Lưu trữ",
} as const;

const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Tiềm năng",
  CONVERTED: "Đã chuyển đổi",
  ARCHIVED: "Lưu trữ",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(value),
  );
}

export function DashboardOverview() {
  const pagesQuery = useLandingPages();
  const leadsQuery = leadHooks.useList();
  const mediaQuery = mediaHooks.useList();
  const domainsQuery = domainHooks.useList();
  const settingsQuery = useSettings();
  const billingQuery = useBillingMe();

  const pages = pagesQuery.data ?? [];
  const leads = leadsQuery.data ?? [];
  const media = mediaQuery.data ?? [];
  const domains = domainsQuery.data ?? [];
  const published = pages.filter((page) => page.status === "PUBLISHED").length;
  const drafts = pages.filter((page) => page.status === "DRAFT").length;
  const archived = pages.filter((page) => page.status === "ARCHIVED").length;
  const verifiedDomains = domains.filter((domain) => domain.status === "VERIFIED").length;
  const recentPages = pages.slice(0, 5);
  const recentLeads = leads.slice(0, 5);
  const contentTotal = pages.length || 1;
  const loading =
    pagesQuery.isLoading || leadsQuery.isLoading || mediaQuery.isLoading || domainsQuery.isLoading;
  const planName = billingQuery.data?.hasPaidPlan
    ? billingQuery.data.subscription.planId.toUpperCase()
    : "STARTER";

  const stats = [
    { label: "Landing pages", value: pages.length, hint: `${drafts} bản nháp`, icon: FileText },
    { label: "Đã xuất bản", value: published, hint: `${archived} lưu trữ`, icon: CircleCheck },
    { label: "Tổng leads", value: leads.length, hint: `${leads.filter((lead) => lead.status === "NEW").length} lead mới`, icon: UsersRound },
    { label: "Media assets", value: media.length, hint: "Trong thư viện", icon: Images },
  ];

  const statusRows = [
    { label: "Đã xuất bản", count: published, color: "bg-primary", chartColor: "#16805f" },
    { label: "Bản nháp", count: drafts, color: "bg-amber-500", chartColor: "#d89a32" },
    { label: "Lưu trữ", count: archived, color: "bg-muted-foreground", chartColor: "#858b94" },
  ];
  const chartHasData = pages.length > 0;
  const chartData = {
    labels: chartHasData ? statusRows.map((row) => row.label) : ["Chưa có dữ liệu"],
    datasets: [
      {
        data: chartHasData ? statusRows.map((row) => row.count) : [1],
        backgroundColor: chartHasData
          ? statusRows.map((row) => row.chartColor)
          : ["rgba(133, 139, 148, 0.2)"],
        borderWidth: 0,
        hoverOffset: chartHasData ? 4 : 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Tổng quan"
        description="Theo dõi nội dung, khách hàng tiềm năng và tài nguyên trong workspace."
        action={
          <Button asChild>
            <Link href="/landing-pages/new">
              <Plus /> Tạo landing page
            </Link>
          </Button>
        }
      />

      <section className="flex flex-col gap-5 border-y py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">Workspace hiện tại</p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {settingsQuery.data?.workspaceName ?? "Pagecraft Workspace"}
          </h2>
        </div>
        <dl className="grid grid-cols-3 gap-x-7 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Gói</dt>
            <dd className="mt-1 font-semibold">{billingQuery.isLoading ? "—" : planName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Credit</dt>
            <dd className="mt-1 flex items-center gap-1.5 font-semibold">
              <Coins className="size-4 text-primary" /> {billingQuery.data?.balance ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Domain</dt>
            <dd className="mt-1 font-semibold">{domainsQuery.isLoading ? "—" : verifiedDomains}</dd>
          </div>
        </dl>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className="gap-3 py-4 shadow-none">
            <CardContent className="flex items-start justify-between px-4">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{loading ? "—" : value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
              </div>
              <Icon className="size-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Landing page gần đây</CardTitle>
              <Link
                href="/landing-pages"
                className="group/link flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
              >
                Xem tất cả
                <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">Các trang được cập nhật mới nhất.</p>
          </CardHeader>
          <CardContent>
            {!pagesQuery.isLoading && recentPages.length === 0 ? (
              <div className="border-y border-dashed py-8 text-center text-sm text-muted-foreground">
                Chưa có landing page.
              </div>
            ) : null}
            <div className="divide-y">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/pages/${page.id}`}
                  className="group flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold group-hover:text-primary">{page.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      /{page.slug} · {formatDate(page.updatedAt)}
                    </p>
                  </div>
                  <Badge variant={page.status === "PUBLISHED" ? "default" : "secondary"}>
                    {STATUS_LABEL[page.status]}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Trạng thái nội dung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid items-center gap-6 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
              <div className="relative mx-auto size-36">
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "72%",
                    animation: { duration: 500 },
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: chartHasData },
                    },
                  }}
                />
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{pagesQuery.isLoading ? "—" : pages.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Tổng trang</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {statusRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`size-2 rounded-full ${row.color}`} />
                      {row.label}
                    </span>
                    <span className="font-semibold">
                      {row.count} · {Math.round((row.count / contentTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Leads mới nhất</CardTitle>
              <Link
                href="/leads"
                className="group/link flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
              >
                Xem tất cả
                <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">Liên hệ vừa được ghi nhận.</p>
          </CardHeader>
          <CardContent className="divide-y">
            {!leadsQuery.isLoading && recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có lead.</p>
            ) : null}
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.name || lead.email || "Khách chưa đặt tên"}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.email || lead.phone || "Chưa có thông tin liên hệ"}</p>
                </div>
                <Badge variant={lead.status === "NEW" ? "default" : "outline"}>
                  {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Truy cập nhanh</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 sm:gap-x-6">
            {[
              { href: "/landing-pages/new", label: "Tạo landing page", icon: Plus },
              { href: "/media", label: "Thư viện media", icon: Images },
              { href: "/domains", label: "Quản lý domain", icon: Globe2 },
              { href: "/payments", label: "Gói & credit", icon: CreditCard },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex h-12 items-center gap-3 border-b text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <Icon className="size-4.5" />
                <span>{label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
