"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n/localized-link";
import { ArrowLeft, Heart, Timer } from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { DataLoadingState } from "@/features/layout";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LocalizedLink } from "@/features/i18n/localized-link";
import {
  LEVELS,
  skillExerciseHref,
  skillListHref,
  type SkillExercise,
  type SkillId,
  type SkillLevel,
  type SkillMeta,
} from "../../model/skill-exercises";

export type SkillListPageViewProps = {
  skill: SkillId;
  meta: SkillMeta;
  activeLevel: SkillLevel | "all";
  loading: boolean;
  groups: Array<{ level: (typeof LEVELS)[number]; exercises: SkillExercise[] }>;
  total: number;
  countsByLevel: Record<SkillLevel, number>;
  source: "api" | "local";
  favoriteExerciseIds: Set<string>;
  onToggleFavorite: (exerciseId: string) => void;
};

export const SkillListPageView = memo(function SkillListPageView({
  skill,
  meta,
  activeLevel,
  loading,
  groups,
  total,
  countsByLevel,
  source,
  favoriteExerciseIds,
  onToggleFavorite,
}: SkillListPageViewProps) {
  const t = useWorkspaceI18n();
  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <LocalizedLink href="/skills">
            <ArrowLeft /> {t("workspace.backToSkills")}
          </LocalizedLink>
        </Button>
        <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/80 px-5 py-6 text-primary-foreground sm:rounded-[1.75rem] sm:px-9 sm:py-10">
          <div
            aria-hidden
            className="absolute -right-12 -top-16 hidden size-52 rounded-full border-26 border-white/7 sm:block"
          />
          <div className="relative">
            <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase sm:block">
              {meta.labelEn}
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">
              {meta.labelVi}
            </h1>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block sm:text-base">
              {meta.blurb}
            </p>
            {skill === "speaking" ? (
              <div className="mt-4">
                <Button
                  asChild
                  className="h-10 rounded-full border-0 bg-white px-5 text-primary hover:bg-white/90"
                >
                  <LocalizedLink href="/speaking">{t("workspace.speakingConversationAi")}</LocalizedLink>
                </Button>
              </div>
            ) : null}
            <p className="mt-4 hidden text-xs text-white/50 sm:block">
              {loading
                ? t("workspace.loadingExercises")
                : `${total} ${t("workspace.exerciseGroups")}`}
              {!loading && source === "api" ? t("workspace.liveCurriculum") : null}
            </p>
          </div>
        </header>
      </div>

      <div className="flex flex-wrap gap-2">
        <LocalizedLink
          href={skillListHref(skill, "all")}
          className={cn(
            "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
            activeLevel === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {t("workspace.allLevels")}
        </LocalizedLink>
        {LEVELS.map((level) => {
          const count = countsByLevel[level.id] ?? 0;
          return (
            <LocalizedLink
              key={level.id}
              href={skillListHref(skill, level.id)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                activeLevel === level.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {level.id}
              <span className="ml-1.5 opacity-70">· {count}</span>
            </LocalizedLink>
          );
        })}
      </div>

      <div className="space-y-10">
        {loading ? (
          <DataLoadingState
            title={t("workspace.loadingExercises")}
            description={t("workspace.preparingSkillPractice").replace("{skill}", meta.labelEn.toLowerCase())}
            cards={3}
          />
        ) : (
          groups.map(({ level, exercises }) => (
          <section key={level.id} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {level.id}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {level.labelVi}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">{level.blurb}</p>
            </div>

            <div className="grid gap-4">
              {exercises.map((exercise) => {
                const favorited = favoriteExerciseIds.has(exercise.id);
                return (
                  <article
                    key={exercise.id}
                    className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                          {exercise.level}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Timer className="size-3.5" />
                          {exercise.duration}
                        </span>
                        <span>{exercise.questions.length} {t("workspace.questionsCount")}</span>
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {exercise.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t("workspace.tip")}</span>
                        {exercise.tip}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className={cn(
                          "grid size-10 place-items-center rounded-full border transition-colors",
                          favorited
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-border bg-background text-muted-foreground hover:border-rose-500/30 hover:text-rose-500",
                        )}
                        aria-label={favorited ? t("workspace.removeFavorite") : t("workspace.saveExercise")}
                        aria-pressed={favorited}
                        onClick={() => onToggleFavorite(exercise.id)}
                      >
                        <Heart className={cn("size-4", favorited && "fill-current")} />
                      </button>
                      <Button
                        asChild
                        className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                      >
                        <LocalizedLink href={skillExerciseHref(skill, exercise.id, activeLevel)}>{t("workspace.startExercise")}</LocalizedLink>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
        )}
      </div>

      {!loading && groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("workspace.noExercises")}</p>
      ) : null}
    </div>
  );
});
