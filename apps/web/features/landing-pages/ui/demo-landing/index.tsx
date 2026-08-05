"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, FileText, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, Badge, Button } from "@landing-page-generator/ui";
import { useLandingPageBySlug } from "../../hooks/use-landing-pages";
import { parseGeneratedContent } from "../../model/generated-content";
import { DemoLandingRenderer } from "./demo-landing-renderer";

export function DemoLanding({ slug }: { slug: string }) {
  const query = useLandingPageBySlug(slug);
  const content = query.data ? parseGeneratedContent(query.data.content) : null;

  useEffect(() => {
    if (!content) return;
    const previousTitle = document.title;
    document.title = content.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? null;
    if (meta) meta.setAttribute("content", content.meta.description);
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) meta.setAttribute("content", previousDescription);
    };
  }, [content]);

  if (query.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Đang tải demo...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{query.error?.message ?? "Không tìm thấy landing page demo."}</span>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/landing-pages">Về danh sách</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-5 py-16">
        <Alert>
          <AlertDescription>
            Trang này chưa có nội dung AI. Tạo lại bằng chế độ &quot;Tạo bằng AI&quot; hoặc mở chi
            tiết trang.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/pages/${query.data.id}`}>Chi tiết trang</Link>
          </Button>
          <Button asChild>
            <Link href="/landing-pages/new">Tạo bằng AI</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Eye className="size-3" /> Demo
            </Badge>
            <p className="truncate text-sm font-medium">{query.data.name}</p>
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              /{query.data.slug}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/landing-pages">
                <ArrowLeft /> Danh sách
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pages/${query.data.id}`}>
                <FileText /> Chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <DemoLandingRenderer content={content} landingPageId={query.data.id} slug={query.data.slug} />
    </div>
  );
}
