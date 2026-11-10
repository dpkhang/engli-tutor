"use client";

import { useEffect, useState } from "react";

/** Keep in sync with `--breakpoint-nav` (850px) in app/globals.css. */
const MOBILE_QUERY = "(max-width: 849.98px)";
/** Never hide while the page is still within the header height from the top. */
const REVEAL_ZONE_PX = 64;
/** Ignore tiny scroll jitter before toggling. */
const DELTA_PX = 8;

/**
 * Mobile-only: returns `true` while the user scrolls down (hide header + tab bar)
 * and `false` once they scroll up, reach the top, or focus moves into the chrome.
 * `paused` keeps the chrome visible (e.g. an open account menu); `resetKey` reveals it on navigation.
 */
export function useHideChromeOnScroll({
  paused,
  resetKey,
}: {
  paused: boolean;
  resetKey: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
  }, [resetKey, paused]);

  useEffect(() => {
    if (paused) return;
    const media = window.matchMedia(MOBILE_QUERY);
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!media.matches) {
        setHidden(false);
        return;
      }
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      // Clamp so iOS rubber-band overscroll at either edge does not flip the state.
      const y = Math.min(Math.max(0, window.scrollY), maxY);
      if (y <= REVEAL_ZONE_PX) {
        setHidden(false);
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (Math.abs(delta) < DELTA_PX) return;
      setHidden(delta > 0);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as Element | null)?.closest?.("[data-shell-chrome]"))
        setHidden(false);
    };
    const onMediaChange = () => {
      lastY = Math.max(0, window.scrollY);
      if (!media.matches) setHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    media.addEventListener("change", onMediaChange);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      media.removeEventListener("change", onMediaChange);
    };
  }, [paused]);

  return hidden;
}
