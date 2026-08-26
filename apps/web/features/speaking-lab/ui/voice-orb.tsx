"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@landing-page-generator/ui";

type VoiceOrbProps = {
  stream: MediaStream | null;
  active: boolean;
  mode: "idle" | "recording" | "ai" | "thinking";
  children?: ReactNode;
  className?: string;
};

/** Stable-size record control: the waveform is visual-only and never changes layout. */
export function VoiceOrb({ stream, active, mode, children, className }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !stream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.88;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let alive = true;
    let phase = 0;

    const draw = () => {
      if (!alive) return;
      analyser.getByteTimeDomainData(data);
      phase += 0.04;

      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const n = (data[i] - 128) / 128;
        sum += n * n;
      }
      const rms = Math.min(1, Math.sqrt(sum / data.length) * 2.6);

      if (ringRef.current) {
        ringRef.current.style.transform = `scale(${1 + rms * 0.14})`;
        ringRef.current.style.opacity = String(0.4 + rms * 0.35);
      }

      const { width, height } = canvas;
      ctx2d.clearRect(0, 0, width, height);

      const mid = height / 2;
      const amp = height * (0.22 + rms * 0.28);

      const paint = (lineWidth: number, strokeStyle: string | CanvasGradient) => {
        ctx2d.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const t = x / width;
          const sample = (data[Math.floor(t * (data.length - 1))] - 128) / 128;
          const wave =
            Math.sin(t * Math.PI * 2 + phase) * 0.18 +
            sample * 0.88 +
            Math.sin(t * Math.PI * 3.2 - phase * 0.55) * 0.1;
          const y = mid + wave * amp;
          if (x === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.strokeStyle = strokeStyle;
        ctx2d.lineWidth = lineWidth;
        ctx2d.lineCap = "round";
        ctx2d.lineJoin = "round";
        ctx2d.stroke();
      };

      paint(5, "rgba(255, 90, 95, 0.2)");
      const grad = ctx2d.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "rgba(255,140,145,0.05)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.95)");
      grad.addColorStop(1, "rgba(255,140,145,0.05)");
      paint(2, grad);

      raf = requestAnimationFrame(draw);
    };

    void audioCtx.resume().then(() => {
      raf = requestAnimationFrame(draw);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      source.disconnect();
      void audioCtx.close();
    };
  }, [active, stream]);

  return (
    <div
      className={cn("relative h-[12.5rem] w-[min(76vw,18rem)] shrink-0 sm:h-[13.5rem]", className)}
    >
      {/* The fixed stage keeps the waveform above the orb without moving the layout. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex h-12 items-center justify-center transition-opacity duration-300 sm:h-14",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!active}
      >
        <canvas ref={canvasRef} width={320} height={72} className="h-full w-full" />
      </div>

      {/* Button + rings only */}
      <div className="absolute right-1/2 bottom-0 grid size-[9.5rem] translate-x-1/2 place-items-center sm:size-[10.5rem]">
        <span
          aria-hidden
          className={cn(
            "absolute size-[140%] rounded-full blur-3xl transition-colors duration-500",
            mode === "recording" && "bg-[#ff5a5f]/22",
            mode === "ai" && "bg-[#6b8cff]/18",
            mode === "thinking" && "bg-white/8",
            mode === "idle" && "bg-white/10",
          )}
        />

        <span
          ref={ringRef}
          aria-hidden
          className={cn(
            "absolute size-[92%] rounded-full transition-colors duration-500",
            mode === "recording" && "speaking-breath bg-[#ff5a5f]/14",
            mode === "ai" && "speaking-breath-slow bg-[#6b8cff]/12",
            mode === "thinking" && "bg-white/5",
            mode === "idle" && "speaking-breath-slow bg-white/[0.06]",
          )}
        />

        <span
          aria-hidden
          className={cn(
            "absolute size-[76%] rounded-full ring-2 transition-colors duration-500",
            mode === "recording" && "ring-[#ff5a5f]/40",
            mode === "ai" && "ring-[#6b8cff]/30",
            mode === "thinking" && "ring-white/15",
            mode === "idle" && "ring-white/18",
          )}
        />

        <span
          className={cn(
            "relative z-10 grid size-[5.5rem] place-items-center rounded-full sm:size-[6.25rem]",
            "transition-[background-color,box-shadow,color,transform] duration-300 ease-out",
            "group-hover:scale-[1.03] group-active:scale-[0.97]",
            mode === "idle" &&
              "bg-white text-[#0b1220] shadow-[0_18px_40px_-18px_rgba(255,255,255,0.55)]",
            mode === "recording" &&
              "bg-[#ff5a5f] text-white shadow-[0_18px_42px_-14px_rgba(255,90,95,0.65)]",
            mode === "ai" &&
              "bg-[#6b8cff] text-white shadow-[0_18px_42px_-14px_rgba(107,140,255,0.55)]",
            mode === "thinking" &&
              "bg-[#2a3348] text-white/80 shadow-[0_14px_32px_-16px_rgba(0,0,0,0.5)]",
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
