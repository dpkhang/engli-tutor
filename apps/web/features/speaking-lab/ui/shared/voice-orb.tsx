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

function primaryChannels() {
  if (typeof document === "undefined") return "244 72% 56%";
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() ||
    "244 72% 56%"
  );
}

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
    const hue = primaryChannels();

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

      paint(5, `hsl(${hue} / 0.22)`);
      const grad = ctx2d.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, `hsl(${hue} / 0.05)`);
      grad.addColorStop(0.5, `hsl(${hue} / 0.95)`);
      grad.addColorStop(1, `hsl(${hue} / 0.05)`);
      paint(2.25, grad);

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
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 flex h-12 items-center justify-center transition-opacity duration-300 sm:h-14",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!active}
      >
        <canvas ref={canvasRef} width={320} height={72} className="h-full w-full" />
      </div>

      <div className="absolute right-1/2 bottom-0 grid size-[9.5rem] translate-x-1/2 place-items-center sm:size-[10.5rem]">
        <span
          aria-hidden
          className={cn(
            "absolute size-[140%] rounded-full blur-3xl transition-colors duration-500",
            mode === "recording" && "bg-primary/30",
            mode === "ai" && "bg-primary/22",
            mode === "thinking" && "bg-primary/12",
            mode === "idle" && "bg-primary/14",
          )}
        />

        <span
          ref={ringRef}
          aria-hidden
          className={cn(
            "absolute size-[92%] rounded-full transition-colors duration-500",
            mode === "recording" && "speaking-breath bg-primary/20",
            mode === "ai" && "speaking-breath-slow bg-primary/16",
            mode === "thinking" && "bg-primary/8",
            mode === "idle" && "speaking-breath-slow bg-primary/10",
          )}
        />

        <span
          aria-hidden
          className={cn(
            "absolute size-[76%] rounded-full ring-2 transition-colors duration-500",
            mode === "recording" && "ring-primary/55",
            mode === "ai" && "ring-primary/40",
            mode === "thinking" && "ring-primary/20",
            mode === "idle" && "ring-primary/25",
          )}
        />

        <span
          className={cn(
            "relative z-10 grid size-[5.5rem] place-items-center rounded-full sm:size-[6.25rem]",
            "transition-[background-color,box-shadow,color,transform] duration-300 ease-out",
            "group-hover:scale-[1.03] group-active:scale-[0.97]",
            mode === "idle" &&
              "bg-primary text-primary-foreground shadow-[0_18px_42px_-14px_hsl(var(--primary)/0.55)]",
            mode === "recording" &&
              "bg-primary text-primary-foreground shadow-[0_18px_46px_-12px_hsl(var(--primary)/0.72)] ring-4 ring-primary/25",
            mode === "ai" &&
              "bg-primary text-primary-foreground shadow-[0_18px_42px_-14px_hsl(var(--primary)/0.58)]",
            mode === "thinking" &&
              "bg-primary/80 text-primary-foreground shadow-[0_14px_32px_-16px_hsl(var(--primary)/0.4)]",
          )}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
