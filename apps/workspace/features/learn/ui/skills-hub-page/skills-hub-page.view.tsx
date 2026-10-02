"use client";

import { memo } from "react";
import { ArrowRight, BookOpen, Headphones, Mic, PenLine, Sparkles } from "lucide-react";
import { LEVELS, SKILLS, type SkillId } from "../../model/skill-exercises";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LocalizedLink } from "@/features/i18n/localized-link";

const THEMES: Record<
  SkillId,
  { icon: typeof BookOpen; color: string; gradient: string; prompt: string }
> = {
  listening: {
    icon: Headphones,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    gradient: "from-sky-500/15",
    prompt: "Hear the details",
  },
  speaking: {
    icon: Mic,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    gradient: "from-violet-500/15",
    prompt: "Find your voice",
  },
  reading: {
    icon: BookOpen,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    gradient: "from-amber-500/15",
    prompt: "Read with ease",
  },
  writing: {
    icon: PenLine,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    gradient: "from-emerald-500/15",
    prompt: "Shape your ideas",
  },
};

export type SkillsHubPageViewProps = {
  coverage: Record<SkillId, { total: number; byLevel: Record<string, number> }> | null;
  loading: boolean;
  source: "api" | "local";
};

export const SkillsHubPageView = memo(function SkillsHubPageView({
  coverage,
  loading,
  source,
}: SkillsHubPageViewProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-10 pb-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 px-5 py-6 text-primary-foreground sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 hidden size-64 rounded-full border-32 border-white/6 sm:block"
        />
        <div className="relative">
          <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium sm:inline-flex">
            <Sparkles className="size-3.5 text-amber-300" />
            {t("workspace.practiceYourWay")}
          </span>
          <h1 className="max-w-xl text-xl font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
            {t("workspace.fourSkillsTitle")}
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block sm:text-base">
            {t("workspace.fourSkillsDescription")}{!loading && source === "api" ? t("workspace.freshActivities") : ""}
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {SKILLS.map((skill) => {
          const theme = THEMES[skill.id];
          const Icon = theme.icon;
          const stats = coverage?.[skill.id];
          return (
            <LocalizedLink
              key={skill.id}
              href={`/skills/${skill.id}`}
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br ${theme.gradient} via-card to-card p-6 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-12 place-items-center rounded-2xl ${theme.color}`}>
                  <Icon className="size-5" />
                </span>
                <ArrowRight className="size-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
              <p className="mt-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {theme.prompt}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{skill.labelEn}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{skill.blurb}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {LEVELS.map((level) => (
                  <span
                    key={level.id}
                    className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {level.id} · {loading ? "…" : (stats?.byLevel[level.id] ?? 0)}
                  </span>
                ))}
              </div>
            </LocalizedLink>
          );
        })}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-semibold">{t("workspace.wantSomethingShorter")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.miniGamesDescription")}
          </p>
        </div>
        <LocalizedLink
          href="/games"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted sm:self-auto"
        >
          {t("workspace.playGame")}
        </LocalizedLink>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-semibold">{t("workspace.notSureWhereToBegin")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.startSpeakingDescription")}
          </p>
        </div>
        <LocalizedLink
          href="/speaking"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:self-auto"
        >
          <Mic className="size-4" />
          {t("workspace.talkWithAi")}
        </LocalizedLink>
      </section>
    </div>
  );
});
