"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Timer } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import { getPreferredLevel } from "@/features/settings/model/preferences";
import { useSkillExercises } from "../hooks/use-learning-catalog";
import {
  LEVELS,
  getSkillMeta,
  isSkillLevel,
  type SkillId,
  type SkillLevel,
} from "../model/skill-exercises";

export function SkillListPage({ skill }: { skill: SkillId }) {
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const [preferredLevel, setPreferredLevel] = useState<SkillLevel | null>(null);

  useEffect(() => {
    setPreferredLevel(getPreferredLevel());
  }, []);

  const activeLevel: SkillLevel | "all" =
    levelParam === "all"
      ? "all"
      : levelParam && isSkillLevel(levelParam)
        ? levelParam
        : (preferredLevel ?? "all");

  const meta = getSkillMeta(skill);
  const { loading, groups, total, countsByLevel, source } = useSkillExercises(skill, activeLevel);

  if (!meta) return null;

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/skills">
            <ArrowLeft /> All skills
          </Link>
        </Button>
        <header className="workspace-hero-accent relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary to-primary/80 px-5 py-6 text-primary-foreground sm:rounded-[1.75rem] sm:px-9 sm:py-10">
          <div
            aria-hidden
            className="absolute -right-12 -top-16 hidden size-52 rounded-full border-[26px] border-white/[0.07] sm:block"
          />
          <div className="relative">
            <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase sm:block">
              {meta.labelEn}
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">
              {meta.labelVi}
            </h1>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block sm:text-base">
              {meta.blurb}
            </p>
            {skill === "speaking" ? (
              <div className="pt-2">
                <Button
                  asChild
                  className="h-10 rounded-full border-0 bg-white px-5 text-primary hover:bg-white/90"
                >
                  <Link href="/speaking">Speaking conversation with AI</Link>
                </Button>
              </div>
            ) : null}
            <p className="mt-4 hidden text-xs text-white/50 sm:block">
              {loading
                ? "Loading exercises…"
                : `${total} exercises · grouped A2 → B1 → TOEIC → IELTS`}
              {!loading && source === "api" ? " · live curriculum" : null}
            </p>
          </div>
        </header>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/skills/${skill}?level=all`}
          className={cn(
            "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
            activeLevel === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All levels
        </Link>
        {LEVELS.map((level) => {
          const count = countsByLevel[level.id] ?? 0;
          return (
            <Link
              key={level.id}
              href={`/skills/${skill}?level=${level.id}`}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                activeLevel === level.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {level.id}
              <span className="ml-1.5 opacity-70">· {count}</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-10">
        {loading ? (
          <DataLoadingState
            title="Loading exercises"
            description={`Preparing ${meta.labelEn.toLowerCase()} practice for this level.`}
            cards={3}
          />
        ) : null}
        {groups.map(({ level, exercises }) => (
          <section key={level.id} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {level.id}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {level.labelVi}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">{level.blurb}</p>
            </div>

            <div className="grid gap-4">
              {exercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                        {exercise.level}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="size-3.5" />
                        {exercise.duration}
                      </span>
                      <span>{exercise.questions.length} questions</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Tip: </span>
                      {exercise.tip}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href={`/skills/${skill}/${exercise.id}`}>Start exercise</Link>
                  </Button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {!loading && groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No exercises for this level.</p>
      ) : null}
    </div>
  );
}
