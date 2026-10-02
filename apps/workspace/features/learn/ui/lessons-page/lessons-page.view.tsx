"use client";

import { memo, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  Gamepad2,
  Heart,
  Lightbulb,
  MessageCircle,
  Search,
  Timer,
  X,
} from "lucide-react";
import { Button, cn, Input } from "@engli-tutor/ui";
import { DataLoadingState } from "@/features/layout";
import type { LessonPack } from "../../model/curriculum";
import type { LessonProgressStatus } from "../../model/lesson-progress";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LocalizedLink } from "@/features/i18n/localized-link";

export const SKILL_FILTERS = ["All", "Listening", "Speaking", "Reading", "Writing"] as const;
export type LessonSkillFilter = (typeof SKILL_FILTERS)[number];

export type LessonsPageViewProps = {
  query: string;
  activeSkill: LessonSkillFilter;
  lessons: LessonPack[];
  loading: boolean;
  source: "api" | "local";
  statusById: Record<string, LessonProgressStatus>;
  favoriteIds: Set<string>;
  onToggleFavorite: (lessonId: string) => void;
};

export const LessonsPageView = memo(function LessonsPageView({
  query,
  activeSkill,
  lessons,
  loading,
  source,
  statusById,
  favoriteIds,
  onToggleFavorite,
}: LessonsPageViewProps) {
  const t = useWorkspaceI18n();
  const router = useRouter();

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    const params = new URLSearchParams();
    if (activeSkill !== "All") params.set("skill", activeSkill);
    if (next) params.set("q", next);
    router.push(params.size ? `/lessons?${params.toString()}` : "/lessons");
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-orange-400 px-5 py-6 text-white sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 hidden size-56 rounded-full border-28 border-white/10 sm:block"
        />
        <div className="relative">
          <p className="hidden text-xs font-semibold tracking-[0.16em] text-white/70 uppercase sm:block">
            {t("workspace.learningPath")}
          </p>
          <h1 className="text-xl font-semibold tracking-[-0.035em] sm:mt-3 sm:text-4xl">
            {t("workspace.learnRealLife")}
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/75 sm:block sm:text-base">
            {t("workspace.lessonsDescription")} You can also explore{" "}
            <Link href="/skills" className="font-semibold text-white underline underline-offset-4">
              {t("workspace.focusedSkillPractice")}
            </Link>{" "}
            when you want to train one area.
            {!loading && source === "api"
              ? t("workspace.integratedLessons")
              : null}
          </p>
          <div className="mt-5">
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
            >
              <BookOpenCheck className="size-4" />
              {t("workspace.manageFavoritesProgress")}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form className="relative w-full max-w-md" onSubmit={onSearch}>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            clearable={!query}
            name="q"
            defaultValue={query}
            placeholder={t("workspace.searchLessons")}
            className="h-11 w-full rounded-full border border-border bg-card pr-10 pl-10 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          {query ? (
            <Link
              href="/lessons"
              className="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t("workspace.clearLessonSearch")}
            >
              <X className="size-3.5" />
            </Link>
          ) : null}
        </form>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/progress"
            className="rounded-full border border-teal-500/35 bg-teal-500/10 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-teal-500/15"
          >
            {t("workspace.myProgressArrow")}
          </Link>
          <Link
            href="/skills"
            className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/15"
          >
            {t("workspace.fourSkillExercises")}
          </Link>
          {SKILL_FILTERS.map((skill) => {
            const params = new URLSearchParams();
            if (skill !== "All") params.set("skill", skill);
            if (query) params.set("q", query);
            const href = params.size ? `/lessons?${params.toString()}` : "/lessons";
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
      </div>

      {loading ? (
        <DataLoadingState
          title={t("workspace.loadingLessonPacks")}
          description={t("workspace.loadingLessonDescription")}
          cards={4}
        />
      ) : null}

      <div className={cn("grid gap-4 md:grid-cols-2", loading && "hidden")}>
        {lessons.map((lesson) => {
          const status = statusById[lesson.id];
          const favorited = favoriteIds.has(lesson.id);
          return (
          <article
            key={lesson.id}
            className="group relative flex flex-col rounded-3xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg sm:p-6"
          >
            <button
              type="button"
              className={cn(
                "absolute top-4 right-4 grid size-9 place-items-center rounded-full border transition-colors",
                favorited
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "border-border bg-background text-muted-foreground hover:text-rose-500",
              )}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorited}
              onClick={() => onToggleFavorite(lesson.id)}
            >
              <Heart className={cn("size-4", favorited && "fill-current")} />
            </button>

            <div className="flex flex-wrap items-center gap-2 pr-10">
              {status === "started" ? (
                <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {t("workspace.inProgress")}
                </span>
              ) : null}
              {status === "completed" ? (
                <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {t("workspace.completed")}
                </span>
              ) : null}
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
                  <span className="font-medium text-foreground">{t("workspace.tip")}</span>
                  {lesson.tip}
                </span>
              </p>
              <p className="flex gap-2 text-sm text-muted-foreground">
                <Gamepad2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  <span className="font-medium text-foreground">{t("workspace.game")}</span>
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

            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              <Button
                asChild
                className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Link href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}>
                  <MessageCircle className="size-4" />
                  {t("workspace.practiceWithAi")}
                </Link>
              </Button>
              {lesson.gameSlug ? (
                <Button asChild variant="outline" className="h-10 rounded-full">
                  <Link href={`/games/${lesson.gameSlug}?lesson=${lesson.id}`}>
                    <Gamepad2 className="size-4" />
                    {t("workspace.playMiniGame")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </article>
          );
        })}
      </div>

      {!loading && lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
          <p className="font-semibold">{t("workspace.noLessonsFound")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.tryAnotherKeyword")}
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link href="/lessons">{t("workspace.clearSearch")}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
});
