"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { goToEntry, useAuthSession } from "@/features/auth";
import { MasterBannerView } from "./master-banner.view";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function canUseParallax() {
  if (prefersReducedMotion()) return false;
  // Skip continuous transform work on touch / small screens
  if (window.matchMedia("(max-width: 768px), (pointer: coarse)").matches) return false;
  return true;
}

export function MasterBanner() {
  const { entryLabel, isLoggedIn } = useAuthSession();
  const sectionRef = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 90, damping: 28, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 90, damping: 28, mass: 0.4 });
  const imageTransform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) scale(1.06)`;
  const glowTransform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !canUseParallax()) return;

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let dirty = false;

    const flush = () => {
      raf = 0;
      dirty = false;
      rawX.set(pendingX);
      rawY.set(pendingY);
    };

    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      pendingX = px * -16;
      pendingY = py * -10;
      if (!dirty) {
        dirty = true;
        raf = requestAnimationFrame(flush);
      }
    };

    const onLeave = () => {
      pendingX = 0;
      pendingY = 0;
      if (!dirty) {
        dirty = true;
        raf = requestAnimationFrame(flush);
      }
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY]);

  const onEntryClick = useCallback(() => goToEntry(isLoggedIn), [isLoggedIn]);
  const onPracticeClick = useCallback(() => {
    document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <MasterBannerView
      sectionRef={sectionRef}
      entryLabel={entryLabel}
      imageTransform={imageTransform}
      glowTransform={glowTransform}
      onEntryClick={onEntryClick}
      onPracticeClick={onPracticeClick}
    />
  );
}
