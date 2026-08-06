"use client";

import Link from "next/link";
import { ArrowLeft, Check, Eye } from "lucide-react";
import { Badge, Button } from "@landing-page-generator/ui";
import { applyFrameLayoutToContent } from "@/features/landing-pages/model/frame-sample-content";
import {
  FUNNEL_LABEL,
  getPageFrameById,
  type PageFrame,
} from "@/features/landing-pages/model/page-frames";
import { DemoLandingRenderer } from "@/features/landing-pages/ui/demo-landing/demo-landing-renderer";

type Props = {
  frameId: string;
  /** Where “Dùng khung này” should go (wizard with preselect). */
  useHref?: string;
};

export function FrameTryPreview({ frameId, useHref }: Props) {
  const frame = getPageFrameById(frameId);
  if (!frame) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-5 py-16 text-center">
        <p className="text-sm text-muted-foreground">Không tìm thấy khung trang.</p>
        <Button asChild variant="outline">
          <Link href="/templates">Về Templates</Link>
        </Button>
      </div>
    );
  }

  const content = applyFrameLayoutToContent(frame);
  const createHref = useHref ?? `/landing-pages/new?frame=${encodeURIComponent(frame.id)}`;

  return (
    <div>
      <div className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Eye className="size-3" /> Xem thử
            </Badge>
            <p className="truncate text-sm font-medium">{frame.name}</p>
            <Badge variant="outline">{FUNNEL_LABEL[frame.funnel]}</Badge>
            <span className="hidden text-xs text-muted-foreground sm:inline">{frame.preset}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates">
                <ArrowLeft /> Templates
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={createHref}>
                <Check /> Dùng khung này
              </Link>
            </Button>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-3 text-xs text-muted-foreground sm:px-6">
          Nội dung mẫu — không trừ credit. Chọn khung rồi tạo bằng AI với brief của bạn.
        </p>
      </div>
      <DemoLandingRenderer
        content={content}
        landingPageId={`preview-${frame.id}`}
        slug={`preview-${frame.id}`}
      />
    </div>
  );
}

export type { PageFrame };
