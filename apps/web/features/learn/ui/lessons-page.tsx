"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Gamepad2, Lightbulb, MessageCircle, Timer } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import { useLessonPacks } from "../hooks/use-learning-catalog";

const SKILL_FILTERS = ["All", "Listening", "Speaking", "Reading", "Writing"] as const;

export function LessonsPage() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get("skill");
  const activeSkill = SKILL_FILTERS.includes(skillParam as (typeof SKILL_FILTERS)[number])
    ? (skillParam as (typeof SKILL_FILTERS)[number])
    : "All";
  const { packs, loading, source } = useLessonPacks();

  const lessons = useMemo(() => {
    if (activeSkill === "All") return packs;
    return packs.filter((lesson) =>
      lesson.skills.includes(activeSkill as "Listening" | "Speaking" | "Reading" | "Writing"),
    );
  }, [activeSkill, packs]);

  return (
    <div className="space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 to-orange-400 px-6 py-9 text-white sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 size-56 rounded-full border-[28px] border-white/10"
        />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
            Your learning path
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Learn through real-life moments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            Choose a lesson that feels useful right now. Each one blends practical English, helpful
            tips and a little play. You can also explore{" "}
            <Link href="/skills" className="font-semibold text-white underline underline-offset-4">
              focused skill practice
            </Link>{" "}
            when you want to train one area.
            {!loading && source === "api"
              ? " Showing integrated lessons from the learning API."
              : null}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/skills"
          className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/15"
        >
          4-skill exercises →
        </Link>
        {SKILL_FILTERS.map((skill) => {
          const href = skill === "All" ? "/lessons" : `/lessons?skill=${encodeURIComponent(skill)}`;
          const active = activeSkill === skill;
          return (
            <Link
              key={skill}
              href={href}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {skill}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <DataLoadingState
          title="Loading lesson packs"
          description="Finding the right activities for your current level."
          cards={4}
        />
      ) : null}

      <div className={cn("grid gap-4 md:grid-cols-2", loading && "hidden")}>
        {lessons.map((lesson) => (
          <article
            key={lesson.id}
            className="group flex flex-col rounded-[1.5rem] border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                {lesson.level}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="size-3.5" />
                {lesson.duration}
              </span>
              <span className="text-xs font-medium text-accent">{lesson.skills.join(" · ")}</span>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
              {lesson.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.focus}</p>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <p className="flex gap-2 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  <span className="font-medium text-foreground">Tip: </span>
                  {lesson.tip}
                </span>
              </p>
              <p className="flex gap-2 text-sm text-muted-foreground">
                <Gamepad2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  <span className="font-medium text-foreground">Game: </span>
                  {lesson.gameSlug ? (
                    <Link
                      href={`/games/${lesson.gameSlug}?lesson=${lesson.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lesson.game}
                    </Link>
                  ) : (
                    lesson.game
                  )}
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                asChild
                className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Link href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}>
                  <MessageCircle className="size-4" />
                  Practice with AI
                </Link>
              </Button>
              {lesson.gameSlug ? (
                <Button asChild variant="outline" className="h-10 rounded-full">
                  <Link href={`/games/${lesson.gameSlug}?lesson=${lesson.id}`}>
                    <Gamepad2 className="size-4" />
                    Play mini-game
                  </Link>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!loading && lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons match this filter.</p>
      ) : null}
    </div>
  );
}
