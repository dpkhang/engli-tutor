"use client";

import { LandingPageList } from "../landing-page-list";
import { PageHeader } from "@/features/layout";
import Link from "next/link";
import { Archive, CircleCheck, FileText, PencilLine, Plus } from "lucide-react";
import { Button, Card, CardContent } from "@landing-page-generator/ui";
import { useLandingPages } from "../../hooks/use-landing-pages";

export function WorkspaceHome() {
  const { data: pages = [], isLoading } = useLandingPages();
  const metrics = [
    { label: "Tổng số", value: pages.length, icon: FileText },
    { label: "Published", value: pages.filter((page) => page.status === "PUBLISHED").length, icon: CircleCheck },
    { label: "Draft", value: pages.filter((page) => page.status === "DRAFT").length, icon: PencilLine },
    { label: "Archived", value: pages.filter((page) => page.status === "ARCHIVED").length, icon: Archive },
  ];
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Nội dung"
        title="Quản lý landing page"
        description="Tạo, cập nhật trạng thái và quản lý toàn bộ landing page trong workspace."
        action={<Button asChild><Link href="/landing-pages/new"><Plus /> Tạo landing page</Link></Button>}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-3 py-4 shadow-none"><CardContent className="flex items-center justify-between px-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{isLoading ? "—" : value}</p></div><Icon className="size-5 text-primary" /></CardContent></Card>
        ))}
      </section>

      <LandingPageList />
    </div>
  );
}
