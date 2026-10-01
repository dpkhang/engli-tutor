"use client";

import { AnimatePresence, motion } from "motion/react";

type PageLoadingOverlayProps = {
  open: boolean;
  title?: string;
  description?: string;
  label?: string;
};

export function PageLoadingOverlay({
  open,
  title = "Loading page",
  description = "Getting everything ready…",
  label = "Loading page",
}: PageLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="page-loading-overlay"
          className="fixed inset-0 z-100 grid place-items-center bg-background/72 px-6 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          role="status"
          aria-live="polite"
          aria-label={label}
          aria-busy="true"
        >
          <motion.div
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-xl shadow-foreground/5"
            initial={{ y: 8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <span className="relative grid size-9 place-items-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full border border-primary/15 bg-primary/5" />
              <span className="absolute inset-1 animate-[spin_1.2s_linear_infinite] rounded-full border-2 border-transparent border-t-primary border-r-primary/25" />
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-foreground">{title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
            </span>
          </motion.div>

          <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-primary/10" aria-hidden="true">
            <span className="block h-full w-1/3 animate-[splash-progress_1.1s_ease-in-out_infinite] bg-primary" />
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
