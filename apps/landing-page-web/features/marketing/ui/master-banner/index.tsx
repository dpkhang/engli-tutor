"use client";

import { useEffect, useRef } from "react";
import { useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useDemoSession } from "@/features/auth/hooks/use-demo-session";
import { goToEntry } from "@/features/auth/model/session";
import { MasterBannerView } from "./master-banner.view";

export function MasterBanner() {
  const { entryLabel } = useDemoSession();
  const sectionRef = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  const imageTransform = useMotionTemplate`translate3d(${x}px, ${y}px, 0) scale(1.08)`;
  const glowTransform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rawX.set(px * -28);
      rawY.set(py * -18);
    };

    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [rawX, rawY]);

  return (
    <MasterBannerView
      sectionRef={sectionRef}
      entryLabel={entryLabel}
      imageTransform={imageTransform}
      glowTransform={glowTransform}
      onEntryClick={goToEntry}
      onFeaturesClick={() => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      }}
    />
  );
}
