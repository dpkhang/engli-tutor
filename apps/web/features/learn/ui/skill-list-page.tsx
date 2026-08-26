"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Timer } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
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
  const activeLevel: SkillLevel | "all" =
    levelParam && isSkillLevel(levelParam) ? levelParam : "all";

  const meta = getSkillMeta(skill);
  const { loading, groups, total, countsByLevel, source } = useSkillExercises(skill, activeLevel);

  if (!meta) return null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/skills">
            <ArrowLeft /> All skills
          </Link>
        </Button>
        <header className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            {meta.labelEn}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{meta.labelVi}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{meta.blurb}</p>
          {skill === "speaking" ? (
            <div className="pt-2">
              <Button asChild className="h-10 rounded-full px-5">
                <Link href="/speaking">Speaking conversation with AI</Link>
              </Button>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading exercises…" : `${total} exercises · grouped A2 → A2+ → B1`}
            {!loading && source === "api" ? " · live curriculum" : null}
          </p>
        </header>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/skills/${skill}`}
          className={cn(
            "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
            activeLevel === "all"
              ? "border-primary bg-primary text-primary-foreground"
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
                  ? "border-primary bg-primary text-primary-foreground"
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
        {groups.map(({ level, exercises }) => (
          <section key={level.id} className="space-y-4">
            <div className="space-y-1 border-b border-border pb-3">
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
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                        {exercise.level}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Timer className="size-3.5" />
                        {exercise.duration}
                      </span>
                      <span>{exercise.questions.length} questions</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Tip: </span>
                      {exercise.tip}
                    </p>
                  </div>
                  <Button asChild className="h-10 shrink-0 rounded-full px-5">
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
