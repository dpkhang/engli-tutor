"use client";

import Link from "next/link";
import { Check, Eye } from "lucide-react";
import { Badge, Button, cn } from "@landing-page-generator/ui";
import { FUNNEL_LABEL, type PageFrame } from "../../model/page-frames";

type FramePreviewProps = {
  frame: PageFrame;
  className?: string;
};

/** CSS mini-mock reflecting preset / density / radius of a page frame. */
export function FramePreview({ frame, className }: FramePreviewProps) {
  const accent = frame.previewAccent;
  const radius =
    frame.radius === "sharp" ? "2px" : frame.radius === "pill" ? "12px" : "8px";
  const isSplit = frame.preset === "bold-split" || frame.preset === "soft-cards";
  const isCenter = frame.preset === "minimal-center";
  const isEditorial = frame.preset === "editorial-stack";

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden border bg-[linear-gradient(160deg,#f8fafc_0%,#eef2ff_100%)] p-2 dark:bg-[linear-gradient(160deg,#1c1917_0%,#292524_100%)]",
        className,
      )}
      style={{ borderRadius: radius }}
      aria-hidden
    >
      <div className="mb-1.5 flex shrink-0 items-center gap-1">
        <span className="size-1.5 rounded-full bg-rose-400/80" />
        <span className="size-1.5 rounded-full bg-amber-400/80" />
        <span className="size-1.5 rounded-full bg-emerald-400/80" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <div className="flex h-4 shrink-0 items-center justify-between gap-2 rounded-sm bg-white/80 px-1.5 dark:bg-white/10">
          <span className="h-1.5 w-7" style={{ backgroundColor: accent, borderRadius: radius, opacity: 0.9 }} />
          <div className="flex flex-1 items-center justify-center gap-1">
            <span className="h-1 w-5 rounded bg-slate-200 dark:bg-white/20" />
            <span className="h-1 w-5 rounded bg-slate-200 dark:bg-white/20" />
            <span className="h-1 w-5 rounded bg-slate-200 dark:bg-white/20" />
          </div>
          <span className="h-2 w-6" style={{ backgroundColor: accent, borderRadius: radius, opacity: 0.75 }} />
        </div>
        <div
          className={cn(
            "grid min-h-0 flex-[1.4] gap-1.5",
            isSplit ? "grid-cols-[1.15fr_0.85fr]" : "grid-cols-1",
          )}
        >
          <div className="flex min-h-0 flex-col justify-center gap-1 rounded-sm bg-white/80 p-1.5 dark:bg-white/10">
            <div
              className={cn("h-1.5 w-3/4 shrink-0", isCenter && "mx-auto")}
              style={{ backgroundColor: accent, borderRadius: radius, opacity: 0.9 }}
            />
            <div
              className={cn(
                "h-1 w-full shrink-0 bg-slate-200 dark:bg-white/20",
                isCenter && "mx-auto max-w-[80%]",
              )}
              style={{ borderRadius: radius }}
            />
            <div
              className={cn(
                "h-1 w-2/3 shrink-0 bg-slate-200/80 dark:bg-white/15",
                isCenter && "mx-auto",
              )}
              style={{ borderRadius: radius }}
            />
            {!isSplit ? (
              <div
                className={cn("mt-0.5 h-3.5 w-14 shrink-0", isCenter && "mx-auto")}
                style={{ backgroundColor: accent, borderRadius: radius, opacity: 0.85 }}
              />
            ) : null}
          </div>
          {isSplit ? (
            <div
              className="flex min-h-0 flex-col justify-center gap-1 border border-dashed border-slate-300/80 bg-white/60 p-1.5 dark:border-white/20 dark:bg-white/5"
              style={{ borderRadius: radius }}
            >
              <div className="h-1 w-full rounded bg-slate-200 dark:bg-white/20" />
              <div className="h-1 w-full rounded bg-slate-200 dark:bg-white/20" />
              <div
                className="h-3 w-full"
                style={{ backgroundColor: accent, borderRadius: radius, opacity: 0.75 }}
              />
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-1",
            isEditorial ? "grid-cols-1" : "grid-cols-3",
          )}
        >
          {(isEditorial ? [1, 2] : [1, 2, 3]).map((i) => (
            <div
              key={i}
              className="min-h-0 bg-white/70 dark:bg-white/10"
              style={{
                borderRadius: radius,
                borderLeft: i === 1 ? `2px solid ${accent}` : undefined,
              }}
            />
          ))}
        </div>
        <div
          className="h-2.5 w-full shrink-0 opacity-70"
          style={{ backgroundColor: accent, borderRadius: radius }}
        />
      </div>
    </div>
  );
}

type FrameGalleryProps = {
  frames: PageFrame[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  error?: string | null;
};

export function FrameGallery({ frames, selectedId, onSelect, error }: FrameGalleryProps) {
  return (
    <div className="space-y-3">
      {/* 2 cols max: wizard column is narrow; 3 cols crushed cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {frames.map((frame) => {
          const selected = selectedId === frame.id;
          return (
            <div
              key={frame.id}
              className={cn(
                "flex min-w-0 flex-col overflow-hidden rounded-xl border transition",
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:border-primary/40",
              )}
            >
              <button
                type="button"
                className="relative flex min-w-0 flex-1 flex-col text-left"
                onClick={() => onSelect(frame.id)}
              >
                {selected ? (
                  <span className="absolute top-2 right-2 z-10 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check className="size-3" />
                  </span>
                ) : null}
                <div className="h-28 w-full shrink-0 p-2 pb-0 sm:h-32">
                  <FramePreview frame={frame} className="h-full w-full border-0" />
                </div>
                <div className="min-w-0 space-y-1 p-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{frame.name}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {FUNNEL_LABEL[frame.funnel]}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {frame.description}
                  </p>
                </div>
              </button>
              <div className="mt-auto flex gap-2 border-t px-3 py-2.5">
                <Button
                  type="button"
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  className="min-w-0 flex-1"
                  onClick={() => onSelect(frame.id)}
                >
                  {selected ? "Đã chọn" : "Chọn"}
                </Button>
                <Button type="button" variant="ghost" size="sm" className="shrink-0 px-2.5" asChild>
                  <Link
                    href={`/templates/preview/${encodeURIComponent(frame.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Xem thử"
                  >
                    <Eye />
                    <span className="sr-only sm:not-sr-only sm:inline">Xem thử</span>
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
