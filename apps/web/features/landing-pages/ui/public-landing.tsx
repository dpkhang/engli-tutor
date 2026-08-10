"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, Button } from "@landing-page-generator/ui";
import { getPublishedLandingPageBySlug } from "../api/public-landing-pages";
import { parseGeneratedContent } from "../model/generated-content";
import { DemoLandingRenderer } from "./demo-landing/demo-landing-renderer";

export function publicLandingPageQueryKey(slug: string) {
  return ["public-landing-page", slug] as const;
}

export function PublicLanding({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: publicLandingPageQueryKey(slug),
    queryFn: () => getPublishedLandingPageBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });
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
      <div className="flex min-h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" /> Đang tải trang...
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-5 py-16">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>
              {query.error?.message ?? "Trang không tồn tại hoặc chưa được xuất bản."}
            </span>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/">Về workspace</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-5 py-16">
        <Alert>
          <AlertDescription>
            Trang đã xuất bản nhưng chưa có nội dung để hiển thị.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DemoLandingRenderer content={content} landingPageId={query.data.id} slug={query.data.slug} />
  );
}
