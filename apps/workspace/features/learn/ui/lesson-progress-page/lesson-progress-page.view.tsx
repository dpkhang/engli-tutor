"use client";

import { memo, type ReactNode } from "react";
import { LocalizedLink as Link } from "@/features/i18n/localized-link";
import {
  BookOpenCheck,
  CheckCircle2,
  CirclePlay,
  Heart,
  MessageCircle,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { DataLoadingState } from "@/features/layout";
import type { LessonPack } from "../../model/curriculum";
import type {
  ExerciseFavoriteEntry,
  LessonFavoriteEntry,
  LessonProgressEntry,
} from "../../model/lesson-progress";
import type { SkillExercise, SkillId, SkillMeta } from "../../model/skill-exercises";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";
import { LocalizedLink } from "@/features/i18n/localized-link";

export type ManagedLesson = {
  entry: LessonProgressEntry | LessonFavoriteEntry;
  lesson: LessonPack | undefined;
};

export type ManagedExercise = {
  entry: ExerciseFavoriteEntry;
  exercise: SkillExercise | undefined;
  skill: SkillMeta | undefined;
};

export type LessonProgressPageViewProps = {
  exerciseFavorites: ManagedExercise[];
  favorites: ManagedLesson[];
  started: ManagedLesson[];
  completed: ManagedLesson[];
  available: LessonPack[];
  loading: boolean;
  hydrated: boolean;
  addOpen: boolean;
  onToggleAdd: () => void;
  onStartLesson: (lessonId: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  onReopenLesson: (lessonId: string) => void;
  onRemoveLesson: (lessonId: string) => void;
  onRemoveFavorite: (lessonId: string) => void;
  onToggleFavorite: (lessonId: string) => void;
  onRemoveExerciseFavorite: (skillId: SkillId, exerciseId: string) => void;
  onClearFavorites: () => void;
  onClearExerciseFavorites: () => void;
  onClearStarted: () => void;
  onClearCompleted: () => void;
  favoriteIds: Set<string>;
};

function formatUpdatedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function LessonCard({
  item,
  tone,
  actions,
  favorited,
  onToggleFavorite,
  t,
}: {
  item: ManagedLesson;
  tone: "favorite" | "started" | "completed";
  actions: ReactNode;
  favorited: boolean;
  onToggleFavorite: (lessonId: string) => void;
  t: (key: string) => string;
}) {
  const { lesson, entry } = item;
  const title = lesson?.title ?? entry.lessonId;
  const practiceHref = lesson
    ? `/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`
    : "/lessons";

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-5 transition-all sm:p-6",
        tone === "favorite" && "border-rose-500/25 hover:border-rose-500/40",
        tone === "started" && "border-amber-500/25 hover:border-amber-500/40",
        tone === "completed" && "border-emerald-500/25 hover:border-emerald-500/40",
      )}
    >
      <button
        type="button"
        className={cn(
          "absolute top-4 right-4 grid size-9 place-items-center rounded-full border transition-colors",
          favorited
            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "border-border bg-background text-muted-foreground hover:text-rose-500",
        )}
        aria-label={favorited ? t("workspace.removeFavorite") : t("workspace.addFavorite")}
        aria-pressed={favorited}
        onClick={() => onToggleFavorite(entry.lessonId)}
      >
        <Heart className={cn("size-4", favorited && "fill-current")} />
      </button>

      <div className="flex flex-wrap items-center gap-2 pr-10">
        {tone === "started" ? (
          <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            In progress
          </span>
        ) : null}
        {tone === "completed" ? (
          <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Completed
          </span>
        ) : null}
        {lesson ? (
          <>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {lesson.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="size-3.5" />
              {lesson.duration}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">{t("workspace.lessonUnavailable")}</span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      {lesson ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{lesson.focus}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {t("workspace.updated")} {formatUpdatedAt(entry.updatedAt)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">{actions}</div>

      {lesson ? (
        <Button asChild className="mt-3 h-10 w-full rounded-full sm:w-auto">
          <Link href={practiceHref}>
            <MessageCircle className="size-4" />
            {tone === "started" ? t("workspace.continuePractice") : t("workspace.practice")}
          </Link>
        </Button>
      ) : null}
    </article>
  );
}

export const LessonProgressPageView = memo(function LessonProgressPageView({
  exerciseFavorites,
  favorites,
  started,
  completed,
  available,
  loading,
  hydrated,
  addOpen,
  onToggleAdd,
  onStartLesson,
  onCompleteLesson,
  onReopenLesson,
  onRemoveLesson,
  onRemoveFavorite,
  onToggleFavorite,
  onRemoveExerciseFavorite,
  onClearFavorites,
  onClearExerciseFavorites,
  onClearStarted,
  onClearCompleted,
  favoriteIds,
}: LessonProgressPageViewProps) {
  const t = useWorkspaceI18n();
  const showContent = hydrated && !loading;

  return (
    <div className="space-y-8 pb-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-600 to-cyan-500 px-5 py-6 text-white sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-10 -top-14 hidden size-52 rounded-full border-28 border-white/10 sm:block"
        />
        <div className="relative">
          <p className="hidden text-xs font-semibold tracking-[0.16em] text-white/70 uppercase sm:block">
            {t("workspace.lessonTracker")}
          </p>
          <h1 className="text-xl font-semibold tracking-[-0.035em] sm:mt-3 sm:text-4xl">
            {t("workspace.manageLessons")}
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/80 sm:block sm:text-base">
            {t("workspace.manageLessonsDescription")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onToggleAdd}
              className="h-10 rounded-full bg-white px-4 font-semibold text-slate-950 hover:bg-teal-50"
            >
              {addOpen ? <X className="size-4" /> : <Plus className="size-4" />}
              {addOpen ? t("workspace.closeCatalog") : t("workspace.startLessonCta")}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/lessons">{t("workspace.browseFullPath")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {addOpen ? (
        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{t("workspace.addInProgress")}</h2>
            <p className="text-xs text-muted-foreground">{available.length} available</p>
          </div>
          {available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {t("workspace.everyLessonTracked")}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {available.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-background px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{lesson.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lesson.level} · {lesson.duration}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        "rounded-full",
                        favoriteIds.has(lesson.id) &&
                          "border-rose-500/30 bg-rose-500/10 text-rose-600",
                      )}
                      aria-label={
                        favoriteIds.has(lesson.id) ? "Remove from favorites" : "Add to favorites"
                      }
                      onClick={() => onToggleFavorite(lesson.id)}
                    >
                      <Heart
                        className={cn("size-3.5", favoriteIds.has(lesson.id) && "fill-current")}
                      />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full"
                      onClick={() => onStartLesson(lesson.id)}
                    >
                      <CirclePlay className="size-3.5" />
                      Start
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!showContent ? (
        <DataLoadingState
          title={t("workspace.loadingYourLessons")}
          description={t("workspace.loadingYourLessonsDescription")}
          cards={4}
        />
      ) : null}

      <div className={cn("grid gap-8", !showContent && "hidden")}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Heart className="size-5 fill-rose-500/20 text-rose-600 dark:text-rose-400" />
                {t("workspace.savedExercises")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.savedExercisesDescription")}
              </p>
            </div>
            {exerciseFavorites.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={onClearExerciseFavorites}
              >
                {t("workspace.clearAll")}
              </Button>
            ) : null}
          </div>

          {exerciseFavorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <Heart className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">{t("workspace.noSavedExercises")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.saveExerciseHint")}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/skills">{t("workspace.browseSkills")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {exerciseFavorites.map((item) => {
                const title = item.exercise?.title ?? item.entry.exerciseId;
                const skillLabel = item.skill?.labelEn ?? item.entry.skillId;
                return (
                  <article
                    key={`${item.entry.skillId}-${item.entry.exerciseId}`}
                    className="group relative flex flex-col rounded-3xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-rose-500/30 hover:shadow-md sm:p-6"
                  >
                    <button
                      type="button"
                      className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 transition-colors hover:bg-rose-500/15 dark:text-rose-400"
                      aria-label="Remove saved exercise"
                      onClick={() =>
                        onRemoveExerciseFavorite(item.entry.skillId, item.entry.exerciseId)
                      }
                    >
                      <Heart className="size-4 fill-current" />
                    </button>
                    <div className="flex flex-wrap items-center gap-2 pr-10 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                        {skillLabel}
                      </span>
                      {item.exercise ? (
                        <>
                          <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                            {item.exercise.level}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Timer className="size-3.5" />
                            {item.exercise.duration}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
                      {title}
                    </h3>
                    {item.exercise ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.exercise.tip}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-muted-foreground">
                      Updated {formatUpdatedAt(item.entry.updatedAt)}
                    </p>
                    <Button
                      asChild
                      className="mt-auto h-10 w-full rounded-full sm:mt-5 sm:w-auto"
                    >
                      <Link href={`/skills/${item.entry.skillId}/${item.entry.exerciseId}`}>
                        Practice
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Heart className="size-5 fill-rose-500/20 text-rose-600 dark:text-rose-400" />
                {t("workspace.favoriteLessons")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.favoriteLessonsDescription")}
              </p>
            </div>
            {favorites.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={onClearFavorites}
              >
                {t("workspace.clearAll")}
              </Button>
            ) : null}
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <Heart className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">{t("workspace.noFavoriteLessons")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.favoriteLessonHint")}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/lessons">{t("workspace.browseLessons")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((item) => (
                <LessonCard
                  key={item.entry.lessonId}
                  item={item}
                  tone="favorite"
                  favorited
                  onToggleFavorite={onToggleFavorite}
                  t={t}
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full"
                        onClick={() => onStartLesson(item.entry.lessonId)}
                      >
                        <CirclePlay className="size-4" />
                        Start
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full text-muted-foreground"
                        onClick={() => onRemoveFavorite(item.entry.lessonId)}
                      >
                        <Trash2 className="size-4" />
                        {t("workspace.remove")}
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <CirclePlay className="size-5 text-amber-600 dark:text-amber-400" />
                In progress
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.inProgressDescription")}
              </p>
            </div>
            {started.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={onClearStarted}
              >
                {t("workspace.clearAll")}
              </Button>
            ) : null}
          </div>

          {started.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <BookOpenCheck className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">{t("workspace.noLessonsInProgress")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.startFromCatalog")}
              </p>
              <Button type="button" className="mt-4 rounded-full" onClick={onToggleAdd}>
                <Plus className="size-4" />
                Start a lesson
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {started.map((item) => (
                <LessonCard
                  key={item.entry.lessonId}
                  item={item}
                  tone="started"
                  favorited={favoriteIds.has(item.entry.lessonId)}
                  onToggleFavorite={onToggleFavorite}
                  t={t}
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full"
                        onClick={() => onCompleteLesson(item.entry.lessonId)}
                      >
                        <CheckCircle2 className="size-4" />
                        {t("workspace.markComplete")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full text-muted-foreground"
                        onClick={() => onRemoveLesson(item.entry.lessonId)}
                      >
                        <Trash2 className="size-4" />
                        {t("workspace.remove")}
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                Completed
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.completedDescription")}
              </p>
            </div>
            {completed.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={onClearCompleted}
              >
                {t("workspace.clearAll")}
              </Button>
            ) : null}
          </div>

          {completed.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <CheckCircle2 className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">{t("workspace.noCompletedLessons")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("workspace.markCompleteHint")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completed.map((item) => (
                <LessonCard
                  key={item.entry.lessonId}
                  item={item}
                  tone="completed"
                  favorited={favoriteIds.has(item.entry.lessonId)}
                  onToggleFavorite={onToggleFavorite}
                  t={t}
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full"
                        onClick={() => onReopenLesson(item.entry.lessonId)}
                      >
                        <RotateCcw className="size-4" />
                        {t("workspace.moveToProgress")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full text-muted-foreground"
                        onClick={() => onRemoveLesson(item.entry.lessonId)}
                      >
                        <Trash2 className="size-4" />
                        {t("workspace.remove")}
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
});
