"use client";

import { useEffect } from "react";

const SECTION_SELECTOR = ".section-snap";

/** Single wheel/trackpad event treated as a fast flick */
const FAST_DELTA = 48;
/** Accumulated |delta| in a short window → fast burst */
const FAST_BURST = 130;
const BURST_WINDOW_MS = 90;
/** Stay in free (native) mode after a fast gesture */
const FREE_HOLD_MS = 320;
/** Slow deltas accumulate until this triggers one section step */
const SLOW_STEP = 36;
/** Ignore section animation completion chatter */
const LOCK_MS = 750;

function getSections() {
  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
}

function getNearestIndex() {
  const sections = getSections();
  if (sections.length === 0) return 0;

  const pivot = window.scrollY + window.innerHeight * 0.3;
  let nearest = 0;
  let best = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const distance = Math.abs(section.offsetTop - pivot);
    if (distance < best) {
      best = distance;
      nearest = index;
    }
  });

  return nearest;
}

function isScrollableOverflow(target: EventTarget | null, direction: 1 | -1) {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;
      const canScroll =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        node.scrollHeight > node.clientHeight + 1;

      if (canScroll) {
        if (direction > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) {
          return true;
        }
        if (direction < 0 && node.scrollTop > 1) {
          return true;
        }
      }
    }
    node = node.parentElement;
  }

  return false;
}

/**
 * Hybrid section scroll:
 * - Fast wheel/trackpad → native page scroll (no intercept)
 * - Slow deliberate scroll → one section at a time
 */
export function useSectionScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const root = document.documentElement;
    root.classList.add("section-scroll");

    let locked = false;
    let unlockTimer = 0;
    let freeUntil = 0;
    let burstAcc = 0;
    let burstStartedAt = 0;
    let slowAcc = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartAt = 0;

    const unlock = () => {
      locked = false;
      window.clearTimeout(unlockTimer);
    };

    const enterFreeMode = (now: number) => {
      freeUntil = now + FREE_HOLD_MS;
      slowAcc = 0;
      burstAcc = 0;
      locked = false;
      window.clearTimeout(unlockTimer);
    };

    const goTo = (index: number) => {
      const sections = getSections();
      if (index < 0 || index >= sections.length) return;

      locked = true;
      window.clearTimeout(unlockTimer);
      sections[index].scrollIntoView({ behavior: "smooth", block: "start" });
      unlockTimer = window.setTimeout(unlock, LOCK_MS);
    };

    const stepSection = (direction: 1 | -1) => {
      if (locked) return;
      const next = getNearestIndex() + direction;
      const sections = getSections();
      if (next < 0 || next >= sections.length) return;
      goTo(next);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      // Mouse wheel line mode: treat each notch as slow section intent
      const deltaY =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * window.innerHeight
            : event.deltaY;

      if (Math.abs(event.deltaX) > Math.abs(deltaY)) return;

      const now = performance.now();
      const abs = Math.abs(deltaY);
      const direction: 1 | -1 = deltaY > 0 ? 1 : -1;

      if (now - burstStartedAt > BURST_WINDOW_MS) {
        burstAcc = 0;
        burstStartedAt = now;
      }
      burstAcc += abs;

      const inFreeHold = now < freeUntil;
      const isFast = abs >= FAST_DELTA || burstAcc >= FAST_BURST || inFreeHold;

      // Fast / momentum → native scroll, no preventDefault (avoids flicker)
      if (isFast) {
        if (!inFreeHold || abs >= FAST_DELTA || burstAcc >= FAST_BURST) {
          enterFreeMode(now);
        }
        return;
      }

      // Nested scrollables (e.g. open panels) keep native behavior
      if (isScrollableOverflow(event.target, direction)) {
        return;
      }

      // Slow path: consume micro-deltas, step one section when enough intent
      event.preventDefault();

      if (locked) return;

      // Reset slow accumulator if direction flips
      if (slowAcc !== 0 && Math.sign(slowAcc) !== direction) {
        slowAcc = 0;
      }

      slowAcc += deltaY;

      if (Math.abs(slowAcc) < SLOW_STEP) return;

      slowAcc = 0;
      burstAcc = 0;
      stepSection(direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const keysNext = ["ArrowDown", "PageDown"];
      const keysPrev = ["ArrowUp", "PageUp"];
      if (![...keysNext, ...keysPrev].includes(event.key)) return;

      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((event.target as HTMLElement | null)?.isContentEditable) return;

      // Keyboard = deliberate → section step
      event.preventDefault();
      if (locked) return;
      stepSection(keysNext.includes(event.key) ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      touchStartAt = performance.now();
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch || locked) return;

      const dy = touchStartY - touch.clientY;
      const dx = touchStartX - touch.clientX;
      const dt = Math.max(performance.now() - touchStartAt, 1);
      const speed = Math.abs(dy) / dt;

      if (Math.abs(dy) < 40 || Math.abs(dy) < Math.abs(dx)) return;

      // Fast swipe → native (already happened); don't fight
      if (speed > 0.85 || Math.abs(dy) > 140) {
        enterFreeMode(performance.now());
        return;
      }

      // Slow swipe → snap to neighboring section
      stepSection(dy > 0 ? 1 : -1);
    };

    const onScrollEnd = () => {
      unlock();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      root.classList.remove("section-scroll");
      window.clearTimeout(unlockTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);
}
