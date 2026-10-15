"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { ArrowRight, BriefcaseBusiness, Coffee, Mail, Mic2, Sparkles, Users } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { LESSON_PACKS } from "../../model/curriculum";
import { useWorkspaceI18n } from "@/features/i18n";
import { LocalizedLink } from "@/features/i18n";

const SCENARIOS = [
  {
    id: "interview",
    labelKey: "workspace.interview",
    bodyKey: "learn.scenario.interviewBody",
    icon: BriefcaseBusiness,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
  {
    id: "standup",
    labelKey: "learn.scenario.standup",
    bodyKey: "learn.scenario.standupBody",
    icon: Users,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  {
    id: "smalltalk",
    labelKey: "workspace.smallTalk",
    bodyKey: "learn.scenario.smalltalkBody",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  },
  {
    id: "email",
    labelKey: "workspace.email",
    bodyKey: "learn.scenario.emailBody",
    icon: Mail,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  {
    id: "free",
    labelKey: "learn.scenario.free",
    bodyKey: "learn.scenario.freeBody",
    icon: Mic2,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
] as const;

export const StartPracticePageView = memo(function StartPracticePageView() {
  const t = useWorkspaceI18n();
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
            {t("workspace.aiTutorReady")}
          </p>
          <h1 className="max-w-xl text-xl font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
            {t("workspace.whatTalkAbout")}
          </h1>
          <p className="mt-3 hidden max-w-xl text-sm leading-6 text-white/65 sm:block sm:text-base">
            {t("workspace.practiceDescription")}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("workspace.chooseConversation")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((item) => (
            <LocalizedLink
              key={item.id}
              href={`/practice?scenario=${item.id}`}
              className="group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg"
            >
              <span className={`grid size-10 place-items-center rounded-xl ${item.color}`}>
                <item.icon className="size-4" />
              </span>
              <p className="mt-4 font-semibold tracking-tight">{t(item.labelKey)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(item.bodyKey)}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {t("workspace.letsTalk")}{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </LocalizedLink>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h2 className="text-xl font-semibold tracking-tight">{t("workspace.preferGuidedLesson")}</h2>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          {LESSON_PACKS.slice(0, 4).map((lesson) => (
            <li key={lesson.id}>
              <LocalizedLink
                href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-semibold">{lesson.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lesson.level} · {lesson.duration} · {lesson.skills.map((skill) => t(`workspace.${skill.toLowerCase()}`)).join(" · ")}
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </LocalizedLink>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="rounded-full">
          <LocalizedLink href="/lessons">{t("workspace.viewFullPath")}</LocalizedLink>
        </Button>
      </section>
    </div>
  );
});
