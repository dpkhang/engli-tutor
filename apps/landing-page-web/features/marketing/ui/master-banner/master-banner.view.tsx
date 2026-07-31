"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { Button } from "@landing-page-generator/ui";
import { motion, type MotionValue } from "motion/react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=2400&q=80";

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
      className="section-snap relative min-h-[100svh] overflow-hidden bg-[#041f1a]"
    >
      {/* Full-bleed photographic plane */}
      <motion.div
        aria-hidden
        className="absolute inset-[-4%] will-change-transform"
        style={{ transform: imageTransform }}
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Cinematic grade — keep pine brand over cool AI imagery */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,28,24,0.94)_0%,rgba(4,40,34,0.82)_38%,rgba(6,45,40,0.62)_62%,rgba(3,22,20,0.78)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(52,211,153,0.28),transparent_52%),radial-gradient(ellipse_at_20%_80%,rgba(0,0,0,0.35),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Slow drifting light wash */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/4 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.2),transparent_62%)] blur-2xl"
        style={{ transform: glowTransform }}
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Giant brand watermark for presence */}
      <motion.p
        aria-hidden
        className="pointer-events-none absolute right-[-4vw] bottom-[-6vh] select-none font-[family-name:var(--font-display)] text-[min(28vw,22rem)] leading-none tracking-[-0.06em] text-white/[0.06]"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        PC
      </motion.p>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          <motion.p
            className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.88] tracking-[-0.04em] text-primary-foreground"
            initial={{ opacity: 0, y: 36, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Pagecraft
          </motion.p>

          <motion.div
            className="mt-8 h-px w-24 origin-left bg-accent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          />

          <motion.h1
            className="mt-7 max-w-2xl text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.25] font-medium text-primary-foreground/95"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            Landing page tự sinh bởi AI — sẵn sàng chạy chiến dịch trong buổi chiều hôm nay.
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/72 sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            Mô tả ý tưởng, Pagecraft auto-generate bố cục và nội dung — chỉnh lại rồi publish,
            không cần dựng trang từ đầu.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.52, ease: "easeOut" }}
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

        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <motion.span
            className="block h-9 w-px origin-top bg-primary-foreground/45"
            animate={{ scaleY: [0.35, 1, 0.35], opacity: [0.25, 0.75, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
