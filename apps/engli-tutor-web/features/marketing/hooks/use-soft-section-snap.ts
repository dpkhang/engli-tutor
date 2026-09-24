"use client";

import { useEffect } from "react";

const SECTION_SELECTOR = ".section-snap";
const SETTLE_DELAY_MS = 140;
const ANIM_DURATION_MS = 820;
const SNAP_THRESHOLD_PX = 28;

function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5;
}

function getSections() {
  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
}

function getNearestSection() {
  const sections = getSections();
  if (sections.length === 0) return null;

  const pivot = window.scrollY + window.innerHeight * 0.28;
  let nearest = sections[0]!;
  let best = Number.POSITIVE_INFINITY;

  for (const section of sections) {
    const distance = Math.abs(section.offsetTop - pivot);
    if (distance < best) {
      best = distance;
      nearest = section;
    }
  }

  return nearest;
}

/**
 * Soft-snap only for the first settle after entering the page.
 * After that first snap (or skipped near-align), scrolling stays native.
 */
export function useSoftSectionSnap() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const root = document.documentElement;
    root.classList.add("section-scroll");

    let settleTimer = 0;
    let raf = 0;
    let animating = false;
    let used = false;
    let disposed = false;

    const removeListeners = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserIntent);
      window.removeEventListener("touchstart", onUserIntent);
    };

    const finishSoftSnap = () => {
      if (disposed || used) return;
      used = true;
      window.clearTimeout(settleTimer);
      removeListeners();
    };

    const cancelAnimation = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      animating = false;
    };

    const animateTo = (targetY: number) => {
      cancelAnimation();
      const startY = window.scrollY;
      const delta = targetY - startY;
      // Still aligned — keep soft-snap armed for the next settle
      if (Math.abs(delta) < SNAP_THRESHOLD_PX) return;

      animating = true;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ANIM_DURATION_MS);
        const y = startY + delta * easeOutQuint(t);
        window.scrollTo(0, y);

        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          animating = false;
          raf = 0;
          finishSoftSnap();
        }
      };

      raf = requestAnimationFrame(tick);
    };

    const settle = () => {
      if (used || disposed) return;
      const section = getNearestSection();
      if (!section) return;
      animateTo(section.offsetTop);
    };

    const onScroll = () => {
      if (used || animating) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_DELAY_MS);
    };

    const onUserIntent = () => {
      if (used) return;
      if (animating) {
        cancelAnimation();
        finishSoftSnap();
        return;
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_DELAY_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserIntent, { passive: true });
    window.addEventListener("touchstart", onUserIntent, { passive: true });

    return () => {
      disposed = true;
      root.classList.remove("section-scroll");
      window.clearTimeout(settleTimer);
      cancelAnimation();
      removeListeners();
    };
  }, []);
}
