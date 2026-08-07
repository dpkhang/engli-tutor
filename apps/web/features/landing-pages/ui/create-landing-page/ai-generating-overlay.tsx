"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, ImageIcon, LayoutTemplate, Sparkles, Type, WandSparkles } from "lucide-react";
import { cn, useLockScroll } from "@landing-page-generator/ui";

const STAGES = [
  {
    id: "brief",
    title: "Đọc brief của bạn",
    detail: "Phân tích mục tiêu, đối tượng và giọng điệu",
    icon: FileText,
  },
  {
    id: "structure",
    title: "Dựng cấu trúc trang",
    detail: "Sắp xếp hero, benefits, social proof và CTA",
    icon: LayoutTemplate,
  },
  {
    id: "copy",
    title: "Viết nội dung",
    detail: "Soạn headline, mô tả và thông điệp chuyển đổi",
    icon: Type,
  },
  {
    id: "visual",
    title: "Tạo ảnh hero",
    detail: "Sinh banner và gắn vào phần hero của trang",
    icon: ImageIcon,
  },
  {
    id: "polish",
    title: "Hoàn thiện bản nháp",
    detail: "Tinh chỉnh nhịp đọc và điểm nhấn thị giác",
    icon: Sparkles,
  },
] as const;

type AiGeneratingOverlayProps = {
  open: boolean;
  pageName?: string;
};

export function AiGeneratingOverlay({ open, pageName }: AiGeneratingOverlayProps) {
  const [stageIndex, setStageIndex] = useState(0);
  useLockScroll(open);

  useEffect(() => {
    if (!open) {
      setStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % STAGES.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [open]);

  const active = STAGES[stageIndex] ?? STAGES[0];
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-background/80 p-4 backdrop-blur-xl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ai-generating-title"
          aria-describedby="ai-generating-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.12),transparent_50%)]"
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg,hsl(var(--primary)/0.18),transparent_35%,hsl(var(--accent)/0.14),transparent_70%,hsl(var(--primary)/0.18))] blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          />

          <motion.div
            className="relative grid w-full max-w-4xl gap-6 overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-5 shadow-[0_40px_80px_-40px_hsl(var(--foreground)/0.45)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr]"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                  <WandSparkles className="size-3.5" />
                  Pagecraft AI
                </div>
                <div className="space-y-2">
                  <h2
                    id="ai-generating-title"
                    className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-foreground sm:text-3xl"
                  >
                    Đang tạo landing page
                  </h2>
                  <p id="ai-generating-desc" className="max-w-md text-sm leading-6 text-muted-foreground">
                    {pageName?.trim()
                      ? `AI đang dựng “${pageName.trim()}” từ brief của bạn. Giữ tab này mở trong lúc tạo.`
                      : "AI đang dựng cấu trúc và nội dung từ brief của bạn. Giữ tab này mở trong lúc tạo."}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tiến độ ước lượng</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {STAGES.map((stage, index) => {
                    const Icon = stage.icon;
                    const state =
                      index < stageIndex ? "done" : index === stageIndex ? "active" : "todo";

                    return (
                      <li
                        key={stage.id}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors",
                          state === "active" && "border-primary/30 bg-primary/6",
                          state === "done" && "border-transparent bg-muted/40",
                          state === "todo" && "border-transparent opacity-55",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
                            state === "active" && "bg-primary text-primary-foreground",
                            state === "done" && "bg-primary/15 text-primary",
                            state === "todo" && "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{stage.title}</p>
                          <p className="text-xs leading-5 text-muted-foreground">{stage.detail}</p>
                        </div>
                        {state === "active" ? (
                          <motion.span
                            className="ml-auto mt-2 size-2 shrink-0 rounded-full bg-primary"
                            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,hsl(var(--surface)),hsl(var(--card)))] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Live canvas
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={active.id}
                      className="mt-1 text-sm font-semibold text-foreground"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      {active.title}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <span className="rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                  Drafting
                </span>
              </div>

              <div className="space-y-3">
                <SkeletonBlock className="h-28" delay={0} accent />
                <div className="grid grid-cols-3 gap-3">
                  <SkeletonBlock className="h-16" delay={0.08} />
                  <SkeletonBlock className="h-16" delay={0.16} />
                  <SkeletonBlock className="h-16" delay={0.24} />
                </div>
                <SkeletonBlock className="h-20" delay={0.18} />
                <div className="flex justify-end">
                  <SkeletonBlock className="h-9 w-28 rounded-full" delay={0.28} accent />
                </div>
              </div>

              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                initial={{ left: "-35%" }}
                animate={{ left: ["-35%", "110%"] }}
                transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SkeletonBlock({
  className,
  delay = 0,
  accent = false,
}: {
  className?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl",
        accent ? "bg-primary/15" : "bg-muted/80",
        className,
      )}
      animate={{ opacity: [0.45, 0.9, 0.45] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
