"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@landing-page-generator/ui";
import { motion } from "motion/react";
import { WELCOME_DURATION_MS } from "../model/onboarding";

const SPARKS = [
  { x: -86, y: -48, delay: 0.05, size: 10 },
  { x: 78, y: -36, delay: 0.18, size: 8 },
  { x: -40, y: 62, delay: 0.28, size: 7 },
  { x: 96, y: 28, delay: 0.4, size: 9 },
] as const;

export function WelcomeScreen({
  firstName,
  onFinished,
}: {
  firstName: string;
  onFinished: () => void | Promise<void>;
}) {
  const finished = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    void Promise.resolve(onFinishedRef.current());
  };

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finish, reduced ? 700 : WELCOME_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 grid size-20 place-items-center">
        {SPARKS.map((spark) => (
          <motion.span
            key={`${spark.x}-${spark.y}`}
            aria-hidden
            className="absolute text-primary"
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0.35], scale: [0.4, 1, 0.85], x: spark.x, y: spark.y }}
            transition={{ duration: 1.1, delay: spark.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sparkles style={{ width: spark.size, height: spark.size }} />
          </motion.span>
        ))}
        <motion.span
          className="grid size-20 place-items-center rounded-[1.4rem] bg-primary text-2xl font-semibold text-primary-foreground shadow-[0_18px_50px_-18px_hsl(var(--primary))]"
          initial={{ opacity: 0, scale: 0.72, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
        >
          E
        </motion.span>
      </div>

      <motion.p
        className="text-sm font-medium text-primary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        You’re in
      </motion.p>
      <motion.h1
        className="mt-2 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        Welcome, {firstName}
      </motion.h1>
      <motion.p
        className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
      >
        Your workspace is ready. Opening Today so you can start speaking, practicing, and playing.
      </motion.p>

      <motion.div
        className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          className="block h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: WELCOME_DURATION_MS / 1000, ease: "linear" }}
        />
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button type="button" variant="ghost" className="rounded-full text-muted-foreground" onClick={finish}>
          Enter workspace
        </Button>
      </motion.div>
    </div>
  );
}
