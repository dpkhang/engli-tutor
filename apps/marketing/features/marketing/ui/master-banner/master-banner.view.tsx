"use client";

import Image from "next/image";
import { memo, type RefObject } from "react";
import { Button } from "@engli-tutor/ui";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useMarketingI18n } from "@/features/i18n";

const HERO_IMAGE =
  "/images/academic-3d-banner.svg";

export type MasterBannerViewProps = {
  sectionRef: RefObject<HTMLElement | null>;
  entryLabel: string;
  onEntryClick: () => void;
  onPracticeClick: () => void;
};

export const MasterBannerView = memo(function MasterBannerView({
  sectionRef,
  entryLabel,
  onEntryClick,
  onPracticeClick,
}: MasterBannerViewProps) {
  const t = useMarketingI18n();
  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-slate-900 text-white"
    >
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="-z-20 object-cover object-[65%_center] lg:object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-black/25"
      />
      <div className="marketing-container flex flex-col justify-center pt-28 pb-14 sm:pt-32 sm:pb-16 lg:min-h-150 lg:pt-32 lg:pb-20">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700 sm:text-sm">
            <Sparkles aria-hidden="true" className="size-4 shrink-0" />
            {t("hero.eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] font-semibold tracking-[-0.045em] text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.65)]"
          >
            {t("hero.title").split("\n").map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.85)] sm:text-lg">
            {t("hero.description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:flex-wrap">
            <Button
              size="lg"
              className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              type="button"
              onClick={onEntryClick}
            >
              {entryLabel}<ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-slate-300 bg-white/90 px-6 text-sm font-semibold text-slate-900 hover:bg-white hover:text-slate-900 dark:border-slate-300 dark:bg-white/90 dark:hover:bg-white"
              type="button"
              onClick={onPracticeClick}
            >
              {t("hero.sampleLesson")}
            </Button>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-relaxed text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.85)] sm:text-sm">
            {["hero.learners", "hero.feedback", "hero.pace"].map((key) => (
              <li key={key} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 shrink-0" />{t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});
