"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Coffee, Mail, Mic2, Sparkles, Users } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { LESSON_PACKS } from "../../model/curriculum";

const SCENARIOS = [
  {
    id: "interview",
    label: "Interview",
    body: "Share your story with confidence",
    icon: BriefcaseBusiness,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
  {
    id: "standup",
    label: "Team stand-up",
    body: "Talk about plans and progress",
    icon: Users,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  {
    id: "smalltalk",
    label: "Small talk",
    body: "Enjoy an easy office conversation",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  {
    id: "email",
    label: "Email",
    body: "Write clear, natural messages",
    icon: Mail,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  {
    id: "free",
    label: "Choose your topic",
    body: "Talk about anything on your mind",
    icon: Mic2,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
] as const;

export const StartPracticePageView = memo(function StartPracticePageView() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute right-0 top-0 hidden size-56 rounded-full bg-violet-500/25 blur-3xl sm:block"
        />
        <div className="relative">
          <p className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium sm:inline-flex">
            <Sparkles className="size-3.5 text-amber-300" />
            Your AI tutor is ready
          </p>
          <h1 className="max-w-xl text-xl font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
            What shall we talk about?
          </h1>
          <p className="mt-3 hidden max-w-xl text-sm leading-6 text-white/65 sm:block sm:text-base">
            Pick a situation that feels useful—or simply talk about your day. There are no wrong
            choices here.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Choose a conversation</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((item) => (
            <Link
              key={item.id}
              href={`/practice?scenario=${item.id}`}
              className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg"
            >
              <span className={`grid size-10 place-items-center rounded-xl ${item.color}`}>
                <item.icon className="size-4" />
              </span>
              <p className="mt-4 font-semibold tracking-tight">{item.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Let&apos;s talk{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h2 className="text-xl font-semibold tracking-tight">Prefer a guided lesson?</h2>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          {LESSON_PACKS.slice(0, 4).map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-semibold">{lesson.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lesson.level} · {lesson.duration} · {lesson.skills.join(" · ")}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/lessons">View full path</Link>
        </Button>
      </section>
    </div>
  );
});
