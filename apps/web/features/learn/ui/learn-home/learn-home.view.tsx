"use client";

import { memo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  Headphones,
  Lightbulb,
  MessageCircle,
  Mic2,
  PenLine,
  Play,
  Sparkles,
  Timer,
  WandSparkles,
} from "lucide-react";
import { Button } from "@landing-page-generator/ui";
import { LESSON_PACKS, MINI_GAMES, QUICK_TIPS } from "../../model/curriculum";

const SKILLS = [
  {
    label: "Listening",
    note: "Train your ear",
    href: "/skills/listening",
    icon: Headphones,
    style: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    wash: "from-sky-500/12",
  },
  {
    label: "Speaking",
    note: "Talk with confidence",
    href: "/speaking",
    icon: Mic2,
    style: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    wash: "from-violet-500/12",
  },
  {
    label: "Reading",
    note: "Understand naturally",
    href: "/skills/reading",
    icon: BookOpen,
    style: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    wash: "from-amber-500/12",
  },
  {
    label: "Writing",
    note: "Express your ideas",
    href: "/skills/writing",
    icon: PenLine,
    style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    wash: "from-emerald-500/12",
  },
] as const;

export type LearnHomeViewProps = {
  firstName: string;
};

export const LearnHomeView = memo(function LearnHomeView({ firstName }: LearnHomeViewProps) {
  const [nextLesson, ...moreLessons] = LESSON_PACKS.slice(0, 4);

  return (
    <div className="space-y-12 pb-10">
      <section className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground shadow-xl shadow-primary/10 sm:rounded-4xl sm:px-9 sm:py-10 lg:px-12 lg:py-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(129,140,248,.38),transparent_30%),radial-gradient(circle_at_5%_100%,rgba(14,165,233,.2),transparent_35%)]"
        />
        <div
          aria-hidden
          className="absolute -right-12 -top-16 size-56 rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="absolute -right-3 -top-5 size-36 rounded-full border border-white/10"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-5 hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 sm:inline-flex">
              <Sparkles className="size-3.5 text-amber-300" />A little English every day
            </div>
            <h1 className="max-w-2xl text-xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[2.75rem]">
              Hi {firstName}, what do you feel like learning today?
            </h1>
            <p className="mt-4 hidden max-w-xl text-sm leading-6 text-white/65 sm:block sm:text-base">
              No pressure, no complicated dashboard. Pick one small activity and make today count.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-indigo-50"
              >
                <Link href="/speaking">
                  <Mic2 className="size-4 text-primary" />
                  Speak with AI now
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden size-40 place-items-center lg:grid">
            <div className="relative grid size-28 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="absolute inset-3 rounded-full bg-primary opacity-90 blur-md" />
              <WandSparkles className="relative size-10 text-white" />
              <span className="absolute -right-2 bottom-2 rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold text-emerald-950 shadow-lg">
                READY
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Choose your mood
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">
              What would you like to practice?
            </h2>
          </div>
          <Link
            href="/skills"
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            See all activities <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SKILLS.map(({ label, note, href, icon: Icon, style, wash }) => (
            <Link
              key={label}
              href={href}
              className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br ${wash} to-card p-4 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-lg sm:p-5`}
            >
              <span className={`grid size-11 place-items-center rounded-2xl ${style}`}>
                <Icon className="size-5" />
              </span>
              <p className="mt-5 font-semibold tracking-tight">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{note}</p>
              <ArrowRight className="absolute right-4 top-4 size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {nextLesson ? (
        <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 sm:p-8">
            <div
              aria-hidden
              className="absolute -right-14 -top-14 size-40 rounded-full bg-primary/15 blur-2xl"
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Recommended next
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3.5" />
                  {nextLesson.duration}
                </span>
                <span className="text-xs font-medium text-primary">{nextLesson.level}</span>
              </div>
              <h2 className="mt-5 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                {nextLesson.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {nextLesson.focus}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="h-11 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/practice?scenario=${nextLesson.scenario}&lesson=${nextLesson.id}`}>
                    <Play className="size-4 fill-current" />
                    Start lesson
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {nextLesson.skills.join(" · ")}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                <Lightbulb className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tiny tip for today</p>
                <h2 className="font-semibold">Speak first, perfect later</h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{QUICK_TIPS[0]}</p>
            <p className="mt-5 rounded-xl bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
              Consistency beats intensity. Even five focused minutes is a win.
            </p>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">More ways to learn</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Short activities for whichever energy level you have today.
            </p>
          </div>
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Explore lessons <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {moreLessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
              className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`grid size-9 place-items-center rounded-xl ${index === 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300" : index === 1 ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300" : "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"}`}
                >
                  <MessageCircle className="size-4" />
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3" />
                  {lesson.duration}
                </span>
              </div>
              <h3 className="mt-4 font-semibold tracking-tight group-hover:text-primary">
                {lesson.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {lesson.focus}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card">
        <div className="grid md:grid-cols-[.75fr_1.25fr]">
          <div className="bg-linear-to-br from-rose-500 to-orange-400 p-7 text-white sm:p-8">
            <Gamepad2 className="size-8" />
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">Learn by playing</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              A quick game can be the best way to remember something new.
            </p>
            <Link
              href="/games"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
            >
              All games <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-px bg-border/70 sm:grid-cols-2">
            {MINI_GAMES.slice(0, 4).map((game, index) => (
              <Link
                key={game.title}
                href={game.href}
                className="bg-card p-5 transition-colors hover:bg-muted/40"
              >
                <span className="text-xs font-bold text-rose-500">0{index + 1}</span>
                <h3 className="mt-2 text-sm font-semibold">{game.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{game.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});
