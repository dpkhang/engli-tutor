"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { Button } from "@landing-page-generator/ui";
import { motion, type MotionValue } from "motion/react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1499914485622-a88fac536970?auto=format&fit=crop&w=1800&q=70";

const easeOut = [0.22, 1, 0.36, 1] as const;

export type MasterBannerViewProps = {
  sectionRef: RefObject<HTMLElement | null>;
  entryLabel: string;
  imageTransform: MotionValue<string>;
  glowTransform: MotionValue<string>;
  onEntryClick: () => void;
  onPracticeClick: () => void;
};

export function MasterBannerView({
  sectionRef,
  entryLabel,
  imageTransform,
  glowTransform,
  onEntryClick,
  onPracticeClick,
}: MasterBannerViewProps) {
  return (
    <section
      ref={sectionRef}
      className="section-snap relative min-h-svh overflow-hidden bg-[#0b1524] [contain:paint]"
    >
      <motion.div
        aria-hidden
        className="absolute inset-[-3%] transform-gpu"
        style={{ transform: imageTransform }}
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          quality={70}
          sizes="(max-width: 768px) 100vw, 1800px"
          className="object-cover object-[center_40%]"
        />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(108deg,rgba(8,16,28,0.93)_0%,rgba(11,21,36,0.8)_40%,rgba(12,24,40,0.52)_70%,rgba(8,14,24,0.7)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_18%,rgba(196,160,90,0.12),transparent_50%)]"
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 right-0 h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(196,160,90,0.1),transparent_62%)]"
        style={{ transform: glowTransform }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-5 pt-28 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl">
          <motion.p
            className="text-[clamp(2.85rem,8.5vw,6rem)] leading-[0.92] font-semibold tracking-[-0.04em] text-white"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            EngliTutor
          </motion.p>

          <motion.h1
            className="mt-7 max-w-xl text-[clamp(1.35rem,2.6vw,2rem)] leading-snug font-medium tracking-[-0.02em] text-white/95"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: easeOut }}
          >
            Practice speaking English with AI every day — and get feedback in Vietnamese.
          </motion.h1>

          <motion.p
            className="mt-4 max-w-lg text-base leading-relaxed text-white/68 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            For A2–B1 professionals who need to speak in meetings, interviews, and at work — not just study theory.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
          >
            <Button
              size="lg"
              className="h-12 rounded-full border-0 bg-white px-7 text-[15px] font-medium text-[#0b1524] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] hover:bg-white/92"
              type="button"
              onClick={onEntryClick}
            >
              {entryLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/10 px-7 text-[15px] font-medium text-white shadow-none backdrop-blur-sm hover:bg-white/16 hover:text-white dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/16 dark:hover:text-white"
              type="button"
              onClick={onPracticeClick}
            >
              See a sample session
            </Button>
          </motion.div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <span className="hero-scroll-cue block h-9 w-px origin-top bg-white/40" />
        </div>
      </div>
    </section>
  );
}
