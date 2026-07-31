"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { Button } from "@landing-page-generator/ui";
import { motion, type MotionValue } from "motion/react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=70";

const easeOut = [0.22, 1, 0.36, 1] as const;

export type MasterBannerViewProps = {
  sectionRef: RefObject<HTMLElement | null>;
  entryLabel: string;
  imageTransform: MotionValue<string>;
  glowTransform: MotionValue<string>;
  onEntryClick: () => void;
  onFeaturesClick: () => void;
};

export function MasterBannerView({
  sectionRef,
  entryLabel,
  imageTransform,
  glowTransform,
  onEntryClick,
  onFeaturesClick,
}: MasterBannerViewProps) {
  return (
    <section
      ref={sectionRef}
      className="section-snap relative min-h-svh overflow-hidden bg-[#041f1a] [contain:paint]"
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
          sizes="(max-width: 768px) 100vw, 1600px"
          className="object-cover object-center"
        />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,28,24,0.94)_0%,rgba(4,40,34,0.82)_38%,rgba(6,45,40,0.62)_62%,rgba(3,22,20,0.78)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(52,211,153,0.22),transparent_52%),radial-gradient(ellipse_at_20%_80%,rgba(0,0,0,0.3),transparent_55%)]"
      />

      {/* Static light wash — no infinite opacity loop / no CSS blur filter */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/4 h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.18),transparent_62%)]"
        style={{ transform: glowTransform }}
      />

      <p
        aria-hidden
        className="pointer-events-none absolute right-[-4vw] bottom-[-6vh] select-none font-[family-name:var(--font-display)] text-[min(28vw,22rem)] leading-none tracking-[-0.06em] text-white/6"
      >
        PC
      </p>

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-5 pt-28 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          <motion.p
            className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] tracking-[-0.04em] text-primary-foreground"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            Pagecraft
          </motion.p>

          <motion.div
            className="mt-8 h-px w-24 origin-left bg-accent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
          />

          <motion.h1
            className="mt-7 max-w-2xl text-[clamp(1.35rem,2.6vw,2rem)] leading-tight font-medium text-primary-foreground/95"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: easeOut }}
          >
            Landing page tự sinh bởi AI — sẵn sàng chạy chiến dịch trong buổi chiều hôm nay.
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/72 sm:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22, ease: "easeOut" }}
          >
            Mô tả ý tưởng, Pagecraft auto-generate bố cục và nội dung — chỉnh lại rồi publish,
            không cần dựng trang từ đầu.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              type="button"
              onClick={onEntryClick}
            >
              {entryLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              type="button"
              onClick={onFeaturesClick}
            >
              Xem tính năng
            </Button>
          </motion.div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <span className="hero-scroll-cue block h-9 w-px origin-top bg-primary-foreground/45" />
        </div>
      </div>
    </section>
  );
}
