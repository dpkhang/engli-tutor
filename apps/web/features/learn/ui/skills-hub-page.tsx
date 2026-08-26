"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Mic, PenLine } from "lucide-react";
import {
  LEVELS,
  SKILLS,
  getExercisesBySkill,
  type SkillId,
} from "../model/skill-exercises";

const ICONS: Record<SkillId, typeof BookOpen> = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenLine,
};

export function SkillsHubPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
          Practice 4 skills
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Exercises by level A2 → B1
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick a skill, then work through each band: A2 (basic), A2+ (stronger A2), B1 (intermediate). Every
          exercise has content plus a question set.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map((level) => (
          <div
            key={level.id}
            className="rounded-2xl border border-border bg-card px-4 py-4"
          >
            <p className="text-sm font-semibold tracking-tight">
              {level.id}
              <span className="ml-2 text-xs font-medium text-muted-foreground">{level.labelVi}</span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{level.blurb}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {SKILLS.map((skill) => {
          const Icon = ICONS[skill.id];
          const count = getExercisesBySkill(skill.id).length;
          return (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/35"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {skill.labelVi}
                <span className="ml-2 text-sm font-medium text-muted-foreground">{skill.labelEn}</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{skill.blurb}</p>
              {skill.id === "speaking" ? (
                <p className="mt-3 text-xs font-medium text-primary">
                  AI conversation room · /speaking
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {LEVELS.map((level) => {
                  const levelCount = getExercisesBySkill(skill.id, level.id).length;
                  return (
                    <span
                      key={level.id}
                      className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {level.id}: {levelCount}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-medium text-accent">{count} exercises</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
