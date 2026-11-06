"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
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
  RotateCcw,
  Sparkles,
  Timer,
  WandSparkles,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { MINI_GAMES, QUICK_TIPS, type LessonPack } from "../../model/curriculum";
import { LocalizedLink } from "@/features/i18n";
import { useWorkspaceI18n } from "@/features/i18n";

const SKILLS = [
  {
    labelKey: "workspace.listening",
    noteKey: "workspace.trainYourEar",
    href: "/skills/listening",
    icon: Headphones,
    style: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    wash: "from-sky-500/20 via-sky-500/5",
  },
  {
    labelKey: "workspace.speaking",
    noteKey: "workspace.talkWithConfidence",
    href: "/skills/speaking",
    icon: Mic2,
    style: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    wash: "from-violet-500/20 via-violet-500/5",
  },
  {
    labelKey: "workspace.reading",
    noteKey: "workspace.understandNaturally",
    href: "/skills/reading",
    icon: BookOpen,
    style: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    wash: "from-amber-500/20 via-amber-500/5",
  },
  {
    labelKey: "workspace.writing",
    noteKey: "workspace.expressYourIdeas",
    href: "/skills/writing",
    icon: PenLine,
    style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    wash: "from-emerald-500/20 via-emerald-500/5",
  },
] as const;

const QUICK_START = [
  { labelKey: "workspace.speak", href: "/speaking", icon: Mic2 },
  { labelKey: "workspace.chat", href: "/practice", icon: MessageCircle },
  { labelKey: "workspace.skills", href: "/skills", icon: BookOpenCheck },
  { labelKey: "workspace.progress", href: "/progress", icon: CirclePlay },
] as const;

const SPEAKING_SCENARIOS = [
  { id: "interview", labelKey: "workspace.interview", blurbKey: "workspace.selfIntroBehavioral" },
  { id: "standup", labelKey: "workspace.standUp", blurbKey: "workspace.yesterdayTodayBlockers" },
  { id: "smalltalk", labelKey: "workspace.smallTalk", blurbKey: "workspace.chatWithColleague" },
  { id: "free", labelKey: "workspace.freeTalk", blurbKey: "workspace.youPickTopic" },
] as const;

const EXPLORE_MORE = [
  { labelKey: "workspace.lessons", noteKey: "workspace.fullLessonPacks", href: "/lessons" },
  { labelKey: "workspace.games", noteKey: "workspace.quickDrills", href: "/games" },
  { labelKey: "workspace.search", noteKey: "workspace.findAnything", href: "/search" },
  { labelKey: "workspace.plans", noteKey: "workspace.unlockMorePractice", href: "/payments" },
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
  plan: string | undefined;
  planLoading: boolean;
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
  /** Words due for review, same source as the deck list and Review today. */
  dueCount: number;
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
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <LocalizedLink
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {linkLabel} <ArrowRight className="size-4" />
        </LocalizedLink>
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
  dueCount,
}: LearnHomeViewProps) {
  const t = useWorkspaceI18n();
  const [nextLesson, ...moreLessons] = discoverLessons;
  const [featuredMore, ...restMore] = moreLessons;
  const tips = QUICK_TIPS.slice(0, 3);
  const latestContinue = continueItems[0];
  const otherContinue = continueItems.slice(1);
  const snapshotStats = [
    {
      label: t("workspace.plans"),
      value: snapshot.planLoading ? "…" : (snapshot.plan ?? t("workspace.free")),
    },
    { label: t("workspace.inProgress"), value: String(snapshot.started) },
    { label: t("workspace.done"), value: String(snapshot.completed) },
    { label: t("workspace.saved"), value: String(snapshot.saved) },
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
              <Sparkles className="size-3.5 text-amber-300" />
              {t("workspace.dailyEnglish")}
            </div>
            <h1 className="max-w-2xl text-xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl lg:text-[2.75rem]">
              {t("workspace.todayPrompt").replace("{name}", firstName)}
            </h1>
            <p className="mt-4 hidden max-w-xl text-sm leading-6 text-white/65 sm:block sm:text-base">
              {latestContinue
                ? t("workspace.continueWaiting").replace("{title}", latestContinue.title)
                : t("workspace.noPressure")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {latestContinue ? (
                <>
                  <Button
                    asChild
                    className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-indigo-50"
                  >
                    <LocalizedLink href={latestContinue.href}>
                      <MessageCircle className="size-4 text-primary" />
                      {t("workspace.chatWithAi")}
                    </LocalizedLink>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/25 bg-white/10 px-5 font-semibold text-white hover:border-white/25 hover:bg-white/10 hover:text-white dark:border-white/25 dark:bg-white/10 dark:hover:border-white/25 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <LocalizedLink href="/speaking">
                      <Mic2 className="size-4" />
                      {t("workspace.speakWithAi")}
                    </LocalizedLink>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 hover:bg-indigo-50"
                >
                  <LocalizedLink href="/speaking">
                    <Mic2 className="size-4 text-primary" />
                    {t("workspace.speakWithAiNow")}
                  </LocalizedLink>
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
        <p className="mb-3 text-xs font-semibold tracking-wider text-primary uppercase">
          {t("workspace.jumpIn")}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {dueCount > 0 ? (
            <LocalizedLink
              href="/review"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-rose-200 bg-background px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
            >
              <RotateCcw className="size-4" aria-hidden />
              {t("learn.review.homeLink")} ({dueCount})
            </LocalizedLink>
          ) : null}
          {QUICK_START.map(({ labelKey, href, icon: Icon }) => (
            <LocalizedLink
              key={labelKey}
              href={href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-4 text-primary" />
              {t(labelKey)}
            </LocalizedLink>
          ))}
        </div>
      </section>

      {/* Snapshot — single divided strip */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              {t("workspace.atAGlance")}
            </p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight">
              {t("workspace.studySnapshot")}
            </h2>
          </div>
          <LocalizedLink
            href="/settings/billing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("workspace.billing")} →
          </LocalizedLink>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          {snapshotStats.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Continue — featured + side list */}
      {latestContinue ? (
        <section>
          <SectionHeader
            eyebrow={t("workspace.pickUpWhereLeftOff")}
            title={t("workspace.continueLearning")}
            href="/progress"
            linkLabel={t("workspace.myProgress")}
          />
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <LocalizedLink
              href={latestContinue.href}
              className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-500/15 via-card to-card p-6 ring-1 ring-amber-500/25 transition hover:ring-amber-500/40 sm:p-7"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <CirclePlay className="size-3.5" />
                {t("workspace.inProgress")} · {latestContinue.duration}
              </span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight group-hover:text-primary sm:text-3xl">
                {latestContinue.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {latestContinue.focus}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {t("workspace.continue")}{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </LocalizedLink>
            {otherContinue.length > 0 ? (
              <div className="flex flex-col justify-center divide-y divide-border/70 rounded-3xl border border-border/70 bg-card px-1">
                {otherContinue.map((item) => (
                  <LocalizedLink
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
                  </LocalizedLink>
                ))}
              </div>
            ) : (
              <div className="flex items-center rounded-3xl border border-dashed border-border/80 px-5 py-6 text-sm text-muted-foreground">
                {t("workspace.moreInProgressLessons")}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Skills — wash tiles, no shared border chrome */}
      <section>
        <SectionHeader
          eyebrow={t("workspace.chooseYourMood")}
          title={t("workspace.whatPractice")}
          href="/skills"
          linkLabel={t("workspace.seeAll")}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SKILLS.map(({ labelKey, noteKey, href, icon: Icon, style, wash }) => (
            <LocalizedLink
              key={labelKey}
              href={href}
              className={`group relative overflow-hidden rounded-3xl bg-linear-to-br ${wash} to-transparent p-5 transition hover:scale-[1.01] sm:p-6`}
            >
              <span className={`grid size-12 place-items-center rounded-2xl ${style}`}>
                <Icon className="size-5" />
              </span>
              <p className="mt-6 text-lg font-semibold tracking-tight">{t(labelKey)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(noteKey)}</p>
            </LocalizedLink>
          ))}
        </div>
      </section>

      {/* Speaking — numbered menu rows */}
      <section>
        <SectionHeader
          eyebrow={t("workspace.talkItOut")}
          title={t("workspace.speakingScenarios")}
          description={t("workspace.speakingScenariosDescription")}
          href="/speaking"
          linkLabel={t("workspace.openRoom")}
        />
        <div className="overflow-hidden rounded-3xl border border-border/70">
          {SPEAKING_SCENARIOS.map((scene, index) => (
            <LocalizedLink
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
                <p className="font-semibold tracking-tight group-hover:text-primary">
                  {t(scene.labelKey)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t(scene.blurbKey)}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </LocalizedLink>
          ))}
        </div>
      </section>

      {/* Drills — stacked rows */}
      {drillItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow={t("workspace.shortDrills")}
            title={t("workspace.skillDrills")}
            description={t("workspace.skillDrillsDescription")}
            href="/skills"
            linkLabel={t("workspace.allSkills")}
          />
          <div className="space-y-2">
            {drillItems.map((item) => (
              <LocalizedLink
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
              </LocalizedLink>
            ))}
          </div>
        </section>
      ) : null}

      {/* Saved — compact chips/rows */}
      {savedItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow={t("workspace.comeBackAnytime")}
            title={t("workspace.savedForLater")}
            href="/progress"
            linkLabel={t("workspace.manage")}
          />
          <div className="flex flex-wrap gap-2">
            {savedItems.map((item) => (
              <LocalizedLink
                key={item.id}
                href={item.href}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card py-2 pr-3 pl-2.5 text-sm transition hover:border-rose-400/40 hover:bg-rose-500/5"
              >
                <Heart className="size-3.5 shrink-0 fill-current text-rose-500" />
                <span className="truncate font-medium">{item.title}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{item.meta}</span>
              </LocalizedLink>
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
                  {t("workspace.recommendedNext")}
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
                <LocalizedLink
                  href={`/practice?scenario=${nextLesson.scenario}&lesson=${nextLesson.id}`}
                >
                  <Play className="size-4 fill-current" />
                  {t("workspace.startLesson")}
                </LocalizedLink>
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[1.75rem] bg-muted/50 p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                <Lightbulb className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("workspace.tinyTip")}
                </p>
                <h2 className="font-semibold">{t("workspace.speakFirst")}</h2>
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
              {t("workspace.dailyChallenge")}
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
            <LocalizedLink href={dailyChallenge.href}>
              <Gamepad2 className="size-4" />
              {t("workspace.playNow")}
            </LocalizedLink>
          </Button>
        </div>
      </section>

      {/* Finished — checklist */}
      {finishedItems.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow={t("workspace.niceWork")}
            title={t("workspace.recentlyFinished")}
            href="/progress"
            linkLabel={t("workspace.allDone")}
          />
          <ul className="space-y-1">
            {finishedItems.map((item) => (
              <li key={item.id}>
                <LocalizedLink
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="min-w-0 flex-1 truncate font-medium group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.level}</span>
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* More lessons — magazine */}
      {featuredMore ? (
        <section>
          <SectionHeader
            title={t("workspace.moreWaysToLearn")}
            description={t("workspace.moreWaysToLearnDescription")}
            href="/lessons"
            linkLabel={t("workspace.explore")}
          />
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <LocalizedLink
              href={`/practice?scenario=${featuredMore.scenario}&lesson=${featuredMore.id}`}
              className="group flex min-h-48 flex-col justify-end rounded-3xl bg-linear-to-br from-primary/15 via-card to-card p-6 ring-1 ring-border/60 transition hover:ring-primary/30 sm:p-8"
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
            </LocalizedLink>
            <div className="flex flex-col gap-3">
              {restMore.map((lesson) => (
                <LocalizedLink
                  key={lesson.id}
                  href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                  className="group flex flex-1 flex-col justify-center rounded-2xl bg-muted/45 px-5 py-4 transition hover:bg-muted/70"
                >
                  <p className="font-semibold tracking-tight group-hover:text-primary">
                    {lesson.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {lesson.focus}
                  </p>
                </LocalizedLink>
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
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">
              {t("workspace.learnByPlaying")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">{t("workspace.gameMemoryTip")}</p>
            <LocalizedLink
              href="/games"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {t("workspace.allGames")} <ArrowRight className="size-4" />
            </LocalizedLink>
          </div>
          <div className="divide-y divide-border/60 bg-card">
            {MINI_GAMES.slice(0, 4).map((game, index) => (
              <LocalizedLink
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
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* Explore — text links */}
      <section>
        <SectionHeader eyebrow={t("workspace.goFurther")} title={t("workspace.exploreMore")} />
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {EXPLORE_MORE.map((item) => (
            <LocalizedLink
              key={item.labelKey}
              href={item.href}
              className="group border-b border-border/50 pb-4"
            >
              <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight underline-offset-4 group-hover:underline">
                {t(item.labelKey)}
                <ArrowRight className="size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{t(item.noteKey)}</p>
            </LocalizedLink>
          ))}
        </div>
      </section>

      {/* Tips — numbered list / blockquotes */}
      <section>
        <SectionHeader eyebrow={t("workspace.studySmarter")} title={t("workspace.quickTips")} />
        <ol className="space-y-6">
          {tips.map((tip, index) => (
            <li key={tip} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
              <div className="relative">
                {index < tips.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-7 left-1/2 top-1 w-px -translate-x-1/2 bg-primary/25"
                  />
                )}
                <span className="relative mt-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-7">
                {tip}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
});
