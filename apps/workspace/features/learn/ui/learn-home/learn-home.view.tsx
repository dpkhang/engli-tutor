"use client";

import { memo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  CirclePlay,
  Gamepad2,
  Headphones,
  Heart,
  Lightbulb,
  MessageCircle,
  Mic2,
  PenLine,
  Play,
  Sparkles,
  Timer,
  WandSparkles,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { MINI_GAMES, QUICK_TIPS, type LessonPack } from "../../model/curriculum";

const SKILLS = [
  {
    label: "Listening",
    note: "Train your ear",
    href: "/skills/listening",
    icon: Headphones,
    style: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    wash: "from-sky-500/20 via-sky-500/5",
  },
  {
    label: "Speaking",
    note: "Talk with confidence",
    href: "/skills/speaking",
    icon: Mic2,
    style: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    wash: "from-violet-500/20 via-violet-500/5",
  },
  {
    label: "Reading",
    note: "Understand naturally",
    href: "/skills/reading",
    icon: BookOpen,
    style: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    wash: "from-amber-500/20 via-amber-500/5",
  },
  {
    label: "Writing",
    note: "Express your ideas",
    href: "/skills/writing",
    icon: PenLine,
    style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    wash: "from-emerald-500/20 via-emerald-500/5",
  },
] as const;

const QUICK_START = [
  { label: "Speak", href: "/speaking", icon: Mic2 },
  { label: "Chat", href: "/practice", icon: MessageCircle },
  { label: "Skills", href: "/skills", icon: BookOpenCheck },
  { label: "Progress", href: "/progress", icon: CirclePlay },
] as const;

const SPEAKING_SCENARIOS = [
  { id: "interview", label: "Interview", blurb: "Self-intro & behavioral" },
  { id: "standup", label: "Stand-up", blurb: "Yesterday / today / blockers" },
  { id: "smalltalk", label: "Small talk", blurb: "Chat with a colleague" },
  { id: "free", label: "Free talk", blurb: "You pick the topic" },
] as const;

const EXPLORE_MORE = [
  { label: "Lessons", note: "Full lesson packs", href: "/lessons" },
  { label: "Games", note: "Quick drills", href: "/games" },
  { label: "Search", note: "Find anything", href: "/search" },
  { label: "Credits", note: "Top up practice", href: "/payments" },
] as const;

export type HomeContinueItem = {
  id: string;
  title: string;
  level: string;
  duration: string;
  focus: string;
  href: string;
  updatedAt: string;
};

export type HomeSavedItem = {
  id: string;
  kind: "lesson" | "exercise";
  title: string;
  meta: string;
  href: string;
  updatedAt: string;
};

export type HomeFinishedItem = {
  id: string;
  title: string;
  level: string;
  href: string;
  updatedAt: string;
};

export type HomeDrillItem = {
  id: string;
  skillLabel: string;
  title: string;
  level: string;
  duration: string;
  href: string;
};

export type HomeSnapshot = {
  credits: number | undefined;
  creditsLoading: boolean;
  started: number;
  completed: number;
  saved: number;
};

export type HomeDailyChallenge = {
  title: string;
  body: string;
  href: string;
};

export type LearnHomeViewProps = {
  firstName: string;
  continueItems: HomeContinueItem[];
  savedItems: HomeSavedItem[];
  finishedItems: HomeFinishedItem[];
  discoverLessons: LessonPack[];
  drillItems: HomeDrillItem[];
  snapshot: HomeSnapshot;
  dailyChallenge: HomeDailyChallenge;
};

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h2 className={cn("text-2xl font-semibold tracking-tight", eyebrow && "mt-1.5")}>
          {title}
        </h2>
        {description ? <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export const LearnHomeView = memo(function LearnHomeView({
  firstName,
  continueItems,
  savedItems,
  finishedItems,
  discoverLessons,
  drillItems,
  snapshot,
  dailyChallenge,
}: LearnHomeViewProps) {
  const [nextLesson, ...moreLessons] = discoverLessons;
  const [featuredMore, ...restMore] = moreLessons;
  const tips = QUICK_TIPS.slice(0, 3);
  const latestContinue = continueItems[0];
  const otherContinue = continueItems.slice(1);
  const snapshotStats = [
    {
      label: "Credits",
      value: snapshot.creditsLoading ? "…" : (snapshot.credits ?? 0).toLocaleString("en-US"),
    },
    { label: "In progress", value: String(snapshot.started) },
    { label: "Done", value: String(snapshot.completed) },
    { label: "Saved", value: String(snapshot.saved) },
  ];

  return (
    <div className="space-y-14 pb-10">
      {/* Hero — full wash */}
      <section className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground shadow-xl shadow-primary/10 sm:rounded-4xl sm:px-9 sm:py-10 lg:px-12 lg:py-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(129,140,248,.38),transparent_30%),radial-gradient(circle_at_5%_100%,rgba(14,165,233,.2),transparent_35%)]"
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
              {latestContinue
                ? `You still have “${latestContinue.title}” waiting. Jump back in or start a fresh speaking session.`
                : "No pressure, no complicated dashboard. Pick one small activity and make today count."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {latestContinue ? (
                <>
                  <Button
                    asChild
                    className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-indigo-50"
                  >
                    <Link href={latestContinue.href}>
                      <CirclePlay className="size-4 text-primary" />
                      Continue “{latestContinue.title}”
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/25 bg-white/10 px-5 font-semibold text-white hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/speaking">
                      <Mic2 className="size-4" />
                      Speak with AI
                    </Link>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-indigo-50"
                >
                  <Link href="/speaking">
                    <Mic2 className="size-4 text-primary" />
                    Speak with AI now
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="hidden size-40 place-items-center lg:grid">
            <div className="relative grid size-28 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="absolute inset-3 rounded-full bg-primary opacity-90 blur-md" />
              <WandSparkles className="relative size-10 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick start — pill strip */}
      <section>
        <p className="mb-3 text-xs font-semibold tracking-wider text-primary uppercase">Jump in</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {QUICK_START.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Snapshot — single divided strip */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">At a glance</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Study snapshot</h2>
          </div>
          <Link
            href="/settings/billing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Billing →
          </Link>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          {snapshotStats.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Continue — featured + side list */}
      {latestContinue ? (
        <section>
          <SectionHeader
            eyebrow="Pick up where you left off"
            title="Continue learning"
            href="/progress"
            linkLabel="My progress"
          />
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Link
              href={latestContinue.href}
              className="group relative overflow-hidden rounded-[1.5rem] bg-linear-to-br from-amber-500/15 via-card to-card p-6 ring-1 ring-amber-500/25 transition hover:ring-amber-500/40 sm:p-7"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <CirclePlay className="size-3.5" />
                In progress · {latestContinue.duration}
              </span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight group-hover:text-primary sm:text-3xl">
                {latestContinue.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {latestContinue.focus}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            {otherContinue.length > 0 ? (
              <div className="flex flex-col justify-center divide-y divide-border/70 rounded-[1.5rem] border border-border/70 bg-card px-1">
                {otherContinue.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.level} · {item.duration}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center rounded-[1.5rem] border border-dashed border-border/80 px-5 py-6 text-sm text-muted-foreground">
                More in-progress lessons will stack here as you start them.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Skills — wash tiles, no shared border chrome */}
      <section>
        <SectionHeader
          eyebrow="Choose your mood"
          title="What would you like to practice?"
          href="/skills"
          linkLabel="See all"
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SKILLS.map(({ label, note, href, icon: Icon, style, wash }) => (
            <Link
              key={label}
              href={href}
              className={`group relative overflow-hidden rounded-3xl bg-linear-to-br ${wash} to-transparent p-5 transition hover:scale-[1.01] sm:p-6`}
            >
              <span className={`grid size-12 place-items-center rounded-2xl ${style}`}>
                <Icon className="size-5" />
              </span>
              <p className="mt-6 text-lg font-semibold tracking-tight">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Speaking — numbered menu rows */}
      <section>
        <SectionHeader
          eyebrow="Talk it out"
          title="Speaking scenarios"
          description="Open Speak with AI and warm up with a familiar workplace scene."
          href="/speaking"
          linkLabel="Open room"
        />
        <div className="overflow-hidden rounded-[1.5rem] border border-border/70">
          {SPEAKING_SCENARIOS.map((scene, index) => (
            <Link
              key={scene.id}
              href="/speaking"
              className={cn(
                "group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-primary/5 sm:px-5 sm:py-5",
                index > 0 && "border-t border-border/60",
              )}
            >
              <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight group-hover:text-primary">{scene.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{scene.blurb}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      {/* Drills — stacked rows */}
      {drillItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="Short drills"
            title="Skill drills"
            description="One ready exercise from each skill."
            href="/skills"
            linkLabel="All skills"
          />
          <div className="space-y-2">
            {drillItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:px-3"
              >
                <span className="w-20 shrink-0 text-[11px] font-semibold tracking-wider text-primary uppercase sm:w-24">
                  {item.skillLabel}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                  {item.title}
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {item.level} · {item.duration}
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Saved — compact chips/rows */}
      {savedItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="Come back anytime"
            title="Saved for later"
            href="/progress"
            linkLabel="Manage"
          />
          <div className="flex flex-wrap gap-2">
            {savedItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card py-2 pr-3 pl-2.5 text-sm transition hover:border-rose-400/40 hover:bg-rose-500/5"
              >
                <Heart className="size-3.5 shrink-0 fill-current text-rose-500" />
                <span className="truncate font-medium">{item.title}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{item.meta}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Recommended — keep split */}
      {nextLesson ? (
        <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 sm:p-8">
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Recommended next
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3.5" />
                  {nextLesson.duration}
                </span>
              </div>
              <h2 className="mt-5 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                {nextLesson.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {nextLesson.focus}
              </p>
              <Button asChild className="mt-6 h-11 rounded-full px-5">
                <Link href={`/practice?scenario=${nextLesson.scenario}&lesson=${nextLesson.id}`}>
                  <Play className="size-4 fill-current" />
                  Start lesson
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[1.75rem] bg-muted/50 p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                <Lightbulb className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tiny tip</p>
                <h2 className="font-semibold">Speak first, perfect later</h2>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-muted-foreground">{QUICK_TIPS[0]}</p>
          </div>
        </section>
      ) : null}

      {/* Daily challenge — bold banner */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-foreground px-6 py-8 text-background sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,hsl(var(--primary)/0.45),transparent_45%)]"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-background/55 uppercase">
              Daily challenge
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {dailyChallenge.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-background/65">{dailyChallenge.body}</p>
          </div>
          <Button
            asChild
            className="h-12 shrink-0 rounded-full bg-background px-6 font-semibold text-foreground hover:bg-background/90"
          >
            <Link href={dailyChallenge.href}>
              <Gamepad2 className="size-4" />
              Play now
            </Link>
          </Button>
        </div>
      </section>

      {/* Finished — checklist */}
      {finishedItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="Nice work"
            title="Recently finished"
            href="/progress"
            linkLabel="All done"
          />
          <ul className="space-y-1">
            {finishedItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* More lessons — magazine */}
      {featuredMore ? (
        <section>
          <SectionHeader
            title="More ways to learn"
            description="Short activities for whichever energy level you have today."
            href="/lessons"
            linkLabel="Explore"
          />
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Link
              href={`/practice?scenario=${featuredMore.scenario}&lesson=${featuredMore.id}`}
              className="group flex min-h-48 flex-col justify-end rounded-[1.5rem] bg-linear-to-br from-primary/15 via-card to-card p-6 ring-1 ring-border/60 transition hover:ring-primary/30 sm:p-8"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="size-3.5" />
                {featuredMore.duration}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight group-hover:text-primary">
                {featuredMore.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {featuredMore.focus}
              </p>
            </Link>
            <div className="flex flex-col gap-3">
              {restMore.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                  className="group flex flex-1 flex-col justify-center rounded-2xl bg-muted/45 px-5 py-4 transition hover:bg-muted/70"
                >
                  <p className="font-semibold tracking-tight group-hover:text-primary">{lesson.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {lesson.focus}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Games — keep colored panel */}
      <section className="overflow-hidden rounded-[1.75rem]">
        <div className="grid md:grid-cols-[.8fr_1.2fr]">
          <div className="bg-linear-to-br from-rose-500 to-orange-400 p-7 text-white sm:p-8">
            <Gamepad2 className="size-8" />
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">Learn by playing</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              A quick game can be the best way to remember something new.
            </p>
            <Link
              href="/games"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
              All games <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="divide-y divide-border/60 bg-card">
            {MINI_GAMES.slice(0, 4).map((game, index) => (
              <Link
                key={game.title}
                href={game.href}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <span className="font-mono text-xs font-bold text-rose-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{game.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{game.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore — text links */}
      <section>
        <SectionHeader eyebrow="Go further" title="Explore more" />
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {EXPLORE_MORE.map((item) => (
            <Link key={item.label} href={item.href} className="group border-b border-border/50 pb-4">
              <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight underline-offset-4 group-hover:underline">
                {item.label}
                <ArrowRight className="size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tips — numbered list / blockquotes */}
      <section>
        <SectionHeader eyebrow="Study smarter" title="Quick tips" />
        <ol className="space-y-6 border-l border-primary/25 pl-5 sm:pl-6">
          {tips.map((tip, index) => (
            <li key={tip} className="relative">
              <span className="absolute -left-[1.65rem] top-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:-left-[1.9rem]">
                {index + 1}
              </span>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">{tip}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
});
