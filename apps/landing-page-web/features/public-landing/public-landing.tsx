"use client";

import { useEffect, useState } from "react";
import { LandingPageRenderer, parseGeneratedContent } from "@landing-page-generator/landing-renderer";
import { getPublicLandingPage, type PublicLandingPage } from "./api";

export function PublicLanding({ slug }: { slug: string }) {
  const [page, setPage] = useState<PublicLandingPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setPage(null);
    setError(null);
    void getPublicLandingPage(slug)
      .then((data) => {
        if (active) setPage(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không tìm thấy landing page");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="grid min-h-svh place-items-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Trang chưa sẵn sàng</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const content = page ? parseGeneratedContent(page.content) : null;
  if (!page) {
    return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Đang tải trang...</div>;
  }
  if (!content) {
    return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Trang chưa có nội dung.</div>;
  }

  return (
    <LandingPageRenderer
      content={content}
      landingPageId={page.id}
      slug={page.slug}
      publicMode
    />
  );
}
