"use client";

import type { SVGProps } from "react";
import { cn } from "../lib/utils";

export type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  /** Height of the mark in pixels. The word scales with it. */
  size?: number;
  withWordmark?: boolean;
  /** `inverse` for dark or primary surfaces */
  tone?: "default" | "inverse";
};

type BrandLogoMarkProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
  tone?: "default" | "inverse";
};

/** EngliTutor mark — stylized E + voice arcs (AI speaking tutor). */
export function BrandLogoMark({
  className,
  size = 32,
  tone = "default",
  style,
  ...props
}: BrandLogoMarkProps) {
  // Opaque square + CSS radius: avoids transparent SVG corners that show as
  // black “roots” under box-shadow on dark surfaces.
  const radius = (size * 9) / 32;
  const fill = tone === "inverse" ? "rgba(255,255,255,0.16)" : "#4F46E5";
  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      style={{ width: size, height: size, borderRadius: radius, ...style }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="block size-full overflow-hidden"
        style={{ borderRadius: radius }}
        {...props}
      >
        <rect width="32" height="32" fill={fill} />
        <path
          d="M9.5 8.5h10.5M9.5 16h8.5M9.5 23.5h10.5M9.5 8.5v15"
          stroke="#fff"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M21.2 12.2c1.15 1.15 1.85 2.7 1.85 4.3s-.7 3.15-1.85 4.3"
          stroke="#fff"
          strokeWidth="1.85"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
        <path
          d="M24.1 10c1.85 1.85 2.95 4.3 2.95 6.95S25.95 21.1 24.1 23"
          stroke="#fff"
          strokeWidth="1.85"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}

const lockupMarkClass =
  "shadow-[0_8px_16px_-12px_rgba(15,23,42,0.55)] ring-1 ring-black/[0.06] transition-transform duration-200 ease-out group-hover:-translate-y-px dark:shadow-[0_8px_16px_-10px_rgba(0,0,0,0.65)] dark:ring-white/10";

/** Mark stands in for the E and sits against “ngliTutor”. */
export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  size = 30,
  withWordmark = true,
  tone = "default",
}: BrandLogoProps) {
  const wordSize = Math.round(size * 0.75);
  return (
    <span
      className={cn("inline-flex items-center", className)}
      role="img"
      aria-label="EngliTutor"
    >
      <BrandLogoMark size={size} tone={tone} className={cn(lockupMarkClass, markClassName)} />
      {withWordmark ? (
        <span
          className={cn("font-bold leading-none tracking-[-0.04em]", wordmarkClassName)}
          style={{ fontSize: wordSize, marginLeft: -Math.max(1, size / 30) }}
          aria-hidden
        >
          {tone === "inverse" ? <span className="opacity-80">ngli</span> : "ngli"}
          <span className={tone === "inverse" ? undefined : "text-primary"}>Tutor</span>
        </span>
      ) : null}
    </span>
  );
}
