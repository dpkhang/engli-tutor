"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const SAFETY_TIMEOUT_MS = 12_000;

function isInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const target = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);
  if (target.origin !== current.origin) return false;

  return `${target.pathname}${target.search}` !== `${current.pathname}${current.search}`;
}

function isSettingsPath(pathname: string) {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

function pathnameFromRenderedUrl(url: string) {
  return url.split("?")[0] ?? url;
}

function shouldSkipOverlay(fromPathname: string, toPathname: string, visited: Set<string>) {
  if (isSettingsPath(fromPathname) && isSettingsPath(toPathname)) return true;
  return visited.has(toPathname);
}

export function GlobalNavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const startedAt = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visitedPathnames = useRef(new Set<string>([pathname]));
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  const renderedUrl = useRef(currentUrl);
  renderedUrl.current = currentUrl;

  useEffect(() => {
    visitedPathnames.current.add(pathname);
    if (!startedAt.current || startedAt.current === currentUrl) return;
    startedAt.current = null;
    setLoading(false);
    if (timer.current) clearTimeout(timer.current);
  }, [currentUrl, pathname]);

  useEffect(() => {
    const start = () => {
      // Keep the last rendered URL so popstate can still be detected after the
      // browser has already changed window.location.
      startedAt.current = renderedUrl.current;
      setLoading(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        startedAt.current = null;
        setLoading(false);
      }, SAFETY_TIMEOUT_MS);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || !isInternalNavigation(event, anchor)) return;
      const next = new URL(anchor.href, window.location.href);
      if (shouldSkipOverlay(window.location.pathname, next.pathname, visitedPathnames.current)) {
        return;
      }
      start();
    };

    const handlePopState = () => {
      if (
        shouldSkipOverlay(
          pathnameFromRenderedUrl(renderedUrl.current),
          window.location.pathname,
          visitedPathnames.current,
        )
      ) {
        return;
      }
      start();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          key="global-navigation-loading"
          className="fixed inset-0 z-[100] grid place-items-center bg-background/72 px-6 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          role="status"
          aria-live="polite"
          aria-label="Loading page"
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
              <span className="block text-sm font-semibold tracking-tight text-foreground">
                Loading page
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Getting everything ready…
              </span>
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
