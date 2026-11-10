"use client";

import { useState } from "react";
export function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const ratio = total > 0 ? seconds / total : 0;
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
      <span
        className="size-2 rounded-full bg-amber-300"
        style={{ opacity: ratio < 0.2 ? 1 : 0.6 }}
      />
      {seconds}s
    </div>
  );
}

export function PicturePrompt({
  imageUrl,
  imageEmoji,
}: {
  imageUrl?: string;
  imageEmoji?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-border/60 bg-muted/30 px-4 py-6">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- game flashcards from /public SVGs
        <img
          src={imageUrl}
          alt=""
          className="h-44 w-44 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-7xl leading-none" aria-hidden>
          {imageEmoji || "🖼️"}
        </span>
      )}
    </div>
  );
}

export function ShortcutTip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 translate-y-1 opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100">
      <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-border bg-popover px-1.5 py-1 font-sans text-[11px] font-medium leading-none text-foreground shadow-[0_8px_18px_-12px_rgba(15,23,42,0.6)]">
        {label}
      </kbd>
    </span>
  );
}
