"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Gamepad2, Lightbulb, MessageCircle, Timer } from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { LESSON_PACKS } from "../model/curriculum";

const SKILL_FILTERS = ["All", "Listening", "Speaking", "Reading", "Writing"] as const;

export function LessonsPage() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get("skill");
  const activeSkill = SKILL_FILTERS.includes(skillParam as (typeof SKILL_FILTERS)[number])
    ? (skillParam as (typeof SKILL_FILTERS)[number])
    : "All";

  const lessons = useMemo(() => {
    if (activeSkill === "All") return LESSON_PACKS;
    return LESSON_PACKS.filter((lesson) =>
      lesson.skills.includes(activeSkill as "Listening" | "Speaking" | "Reading" | "Writing"),
    );
  }, [activeSkill]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">Path</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Lesson packs</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Each pack covers listening · speaking · reading · writing (depending on focus), with quick tips and
          mini-games. Pick a pack to open AI chat, or go to{" "}
          <Link href="/skills" className="font-medium text-foreground underline-offset-4 hover:underline">
            practice 4 skills
          </Link>{" "}
          for reading/listening passages plus question sets.
        </p>
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
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {skill}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <article
            key={lesson.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {lesson.level}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="size-3.5" />
                {lesson.duration}
              </span>
              <span className="text-xs font-medium text-accent">{lesson.skills.join(" · ")}</span>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight">{lesson.title}</h2>
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
                  {lesson.game}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <Button asChild className="h-10 rounded-full px-5">
                <Link href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}>
                  <MessageCircle className="size-4" />
                  Practice with AI
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons match this filter.</p>
      ) : null}
    </div>
  );
}
