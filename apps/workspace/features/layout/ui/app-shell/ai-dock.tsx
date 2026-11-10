"use client";

import { memo, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { MessageCircle, Mic2, Sparkles, X } from "lucide-react";
import { cn } from "@engli-tutor/ui";
import { motion } from "motion/react";
import { FloatingTranslate } from "@/features/translate";
import { useWorkspaceI18n } from "@/features/i18n";

type AiDockProps = {
  localize: (href: string) => string;
  raiseFabForExerciseBar: boolean;
  showAiDock: boolean;
  showTranslate: boolean;
  aiToolsOpen: boolean;
  aiLauncherExpanded: boolean;
  clipAiTools: boolean;
  aiToolsHeight: number;
  aiToolsInnerRef: RefObject<HTMLDivElement | null>;
  onToggleAiDock: () => void;
  onAiToolsAnimationComplete: () => void;
};

/**
 * Floating AI launcher + translate panel anchor. Stateful and rendered exactly once;
 * its offset follows `--tabbar-h` (4rem on mobile, 0 on desktop), so no variant split is needed.
 * While the mobile chrome is hidden on scroll (`data-chrome-hidden`), it slides down by
 * `--tabbar-h` in sync with the tab bar.
 */
export const AiDock = memo(function AiDock({
  localize,
  raiseFabForExerciseBar,
  showAiDock,
  showTranslate,
  aiToolsOpen,
  aiLauncherExpanded,
  clipAiTools,
  aiToolsHeight,
  aiToolsInnerRef,
  onToggleAiDock,
  onAiToolsAnimationComplete,
}: AiDockProps) {
  const t = useWorkspaceI18n();
  const launcherLabelRef = useRef<HTMLSpanElement>(null);
  const [launcherWidth, setLauncherWidth] = useState(160);

  useLayoutEffect(() => {
    const label = launcherLabelRef.current;
    if (!label) return;
    // px-4 on both sides + gap-3 + Sparkles icon + 1px border on both sides
    const measure = () =>
      setLauncherWidth(Math.ceil(label.scrollWidth) + 32 + 12 + 20 + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(label);
    return () => observer.disconnect();
  }, [showAiDock]);

  if (!showAiDock && !showTranslate) return null;

  return (
    <div
      className="pointer-events-none fixed z-60 flex w-max max-w-[calc(100vw-2rem)] flex-col items-end transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-has-data-not-found/shell:hidden group-data-chrome-hidden/shell:translate-y-[var(--tabbar-h,0px)]"
      style={{
        right: "max(1rem, env(safe-area-inset-right, 0px))",
        bottom: raiseFabForExerciseBar
          ? "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))"
          : "calc(var(--tabbar-h, 0px) + max(1.25rem, env(safe-area-inset-bottom, 0px)))",
      }}
    >
      {showTranslate ? (
        <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-0">
          <FloatingTranslate />
        </div>
      ) : null}

      {showAiDock ? (
        <>
          <motion.button
            type="button"
            onClick={onToggleAiDock}
            className={cn(
              "pointer-events-auto relative flex h-12 max-w-[calc(100vw-2rem)] items-center overflow-hidden rounded-full shadow-[0_10px_28px_-8px_hsl(var(--primary)/0.65)] transition-[background-color,color,border-color] duration-300 ease-out",
              aiLauncherExpanded
                ? "justify-between border border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                : "justify-center border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
            initial={false}
            animate={{ width: aiLauncherExpanded ? launcherWidth : 48 }}
            transition={{ width: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            aria-expanded={aiToolsOpen}
            aria-label={
              aiToolsOpen
                ? t("workspace.hideAiTools")
                : t("workspace.showAiTools")
            }
            title={
              aiToolsOpen
                ? t("workspace.hideAiTools")
                : t("workspace.showAiTools")
            }
          >
            <motion.span
              className="absolute inset-0 grid place-items-center"
              animate={{
                opacity: aiLauncherExpanded ? 0 : 1,
                rotate: aiLauncherExpanded ? 45 : 0,
                scale: aiLauncherExpanded ? 0.7 : 1,
              }}
              transition={{ duration: aiLauncherExpanded ? 0.08 : 0.18 }}
            >
              <X className="size-4" />
            </motion.span>

            <span className="absolute inset-0 flex items-center justify-between gap-3 px-4 whitespace-nowrap">
              <motion.span
                ref={launcherLabelRef}
                className="speak-infinity-text text-sm font-semibold"
                animate={{ opacity: aiLauncherExpanded ? 1 : 0 }}
                transition={{
                  delay: aiLauncherExpanded ? 0.22 : 0,
                  duration: aiLauncherExpanded ? 0.16 : 0.1,
                }}
              >
                {t("workspace.speakWithAi")}
              </motion.span>
              <motion.span
                animate={{
                  opacity: aiLauncherExpanded ? 1 : 0,
                  scale: aiLauncherExpanded ? 1 : 0.8,
                }}
                transition={{
                  delay: aiLauncherExpanded ? 0.22 : 0,
                  duration: 0.16,
                }}
              >
                <Sparkles className="size-5 shrink-0" />
              </motion.span>
            </span>
          </motion.button>

          <motion.div
            initial={false}
            animate={{
              height: aiToolsOpen ? aiToolsHeight : 0,
              opacity: aiToolsOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={onAiToolsAnimationComplete}
            className={cn(
              "w-max min-w-13",
              clipAiTools || !aiToolsOpen
                ? "overflow-hidden"
                : "overflow-visible",
            )}
            aria-hidden={!aiToolsOpen}
          >
            <div
              ref={aiToolsInnerRef}
              className="pointer-events-none flex flex-col items-end gap-2 pt-2"
            >
              <Link
                href={localize("/speaking")}
                tabIndex={aiToolsOpen ? 0 : -1}
                className="pointer-events-auto group flex h-13 max-w-[calc(100vw-2rem)] items-center justify-end rounded-full bg-primary px-2.5 text-primary-foreground shadow-[0_12px_32px_-10px_hsl(var(--primary)/0.7)] transition-colors hover:bg-primary/90"
                aria-label={t("shell.startSpeaking")}
              >
                <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
                  <span className="min-w-0 overflow-hidden">
                    <span className="block whitespace-nowrap pr-2.5 text-sm font-semibold opacity-0 transition-opacity duration-200 delay-0 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100 group-focus-visible:delay-200">
                      {t("workspace.speakWithAi")}
                    </span>
                  </span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
                  <Mic2 className="size-4" />
                </span>
              </Link>

              <Link
                href={localize("/practice")}
                tabIndex={aiToolsOpen ? 0 : -1}
                className="pointer-events-auto group relative flex h-13 max-w-[calc(100vw-2rem)] items-center justify-end rounded-full border border-border bg-card px-2.5 text-foreground shadow-lg transition-colors hover:border-primary/30"
                aria-label={t("shell.openTutorChat")}
              >
                <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
                  <span className="min-w-0 overflow-hidden">
                    <span className="block whitespace-nowrap pr-2.5 text-sm font-semibold opacity-0 transition-opacity duration-200 delay-0 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100 group-focus-visible:delay-200">
                      {t("workspace.chatWithAi")}
                    </span>
                  </span>
                </span>
                <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="size-4" />
                  <Sparkles className="absolute -right-0.5 -top-0.5 size-2.5 text-amber-400" />
                </span>
                <span
                  className="absolute right-1 top-1 size-2 rounded-full border-2 border-card bg-emerald-400"
                  aria-hidden
                />
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
});
