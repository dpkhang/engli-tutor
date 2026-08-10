"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, FileText, Globe2, Link2, LoaderCircle, Rocket } from "lucide-react";
import { Alert, AlertDescription, Badge, Button } from "@landing-page-generator/ui";
import {
  useLandingPageBySlug,
  useUpdateLandingPage,
} from "../../hooks/use-landing-pages";
import { parseGeneratedContent } from "../../model/generated-content";
import { DemoLandingRenderer } from "./demo-landing-renderer";

export function DemoLanding({ slug }: { slug: string }) {
  const query = useLandingPageBySlug(slug);
  const update = useUpdateLandingPage(query.data?.id ?? "");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const content = query.data ? parseGeneratedContent(query.data.content) : null;
  const isDraft = query.data?.status === "DRAFT";
  const isPublished = query.data?.status === "PUBLISHED";

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

  useEffect(() => {
    setPublishError(null);
    setPublishSuccess(false);
  }, [slug, query.data?.status]);

  const onPublish = async () => {
    if (!query.data || !isDraft) return;
    setPublishError(null);
    setPublishSuccess(false);
    try {
      await update.mutateAsync({ status: "PUBLISHED" });
      setPublishSuccess(true);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "Không thể xuất bản trang");
    }
  };

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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Badge variant="secondary" className="gap-1.5">
                <Eye className="size-3" /> Demo
              </Badge>
              <Badge variant={isPublished ? "default" : "outline"}>
                {isPublished ? "Published" : query.data.status}
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
              {isDraft ? (
                <Button size="sm" onClick={() => void onPublish()} disabled={update.isPending}>
                  {update.isPending ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Đang xuất bản...
                    </>
                  ) : (
                    <>
                      <Rocket /> Xuất bản
                    </>
                  )}
                </Button>
              ) : isPublished ? (
                <Button size="sm" variant="secondary" disabled>
                  <Check /> Đã xuất bản
                </Button>
              ) : null}
            </div>
          </div>
          {(publishError || publishSuccess || isDraft) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {publishError ? <span className="text-destructive">{publishError}</span> : null}
              {publishSuccess || isPublished ? (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Check className="size-3.5 text-primary" />
                  Trang đã xuất bản. Gắn hoặc thuê domain trên trang Domains.
                </span>
              ) : isDraft ? (
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="size-3.5" />
                  Xuất bản khi sẵn sàng ·{" "}
                  <Link href="/domains" className="inline-flex items-center gap-1 underline">
                    <Link2 className="size-3" /> Domains
                  </Link>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <DemoLandingRenderer content={content} landingPageId={query.data.id} slug={query.data.slug} />
    </div>
  );
}
