"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoadingOverlay } from "./page-loading-overlay";

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

  return <PageLoadingOverlay open={loading} />;
}
