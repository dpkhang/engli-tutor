"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
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
import { Button, cn } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import type { LessonPack } from "../../model/curriculum";
import type {
  ExerciseFavoriteEntry,
  LessonFavoriteEntry,
  LessonProgressEntry,
} from "../../model/lesson-progress";
import type { SkillExercise, SkillId, SkillMeta } from "../../model/skill-exercises";

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
}: {
  item: ManagedLesson;
  tone: "favorite" | "started" | "completed";
  actions: ReactNode;
  favorited: boolean;
  onToggleFavorite: (lessonId: string) => void;
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
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
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
          <span className="text-xs text-muted-foreground">Lesson unavailable</span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      {lesson ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{lesson.focus}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        Updated {formatUpdatedAt(entry.updatedAt)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">{actions}</div>

      {lesson ? (
        <Button asChild className="mt-3 h-10 w-full rounded-full sm:w-auto">
          <Link href={practiceHref}>
            <MessageCircle className="size-4" />
            {tone === "started" ? "Continue practice" : "Practice"}
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
            Your lesson tracker
          </p>
          <h1 className="text-xl font-semibold tracking-[-0.035em] sm:mt-3 sm:text-4xl">
            Manage your lessons
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/80 sm:block sm:text-base">
            Save skill exercises and lessons, track what you have started, and review ones you have
            finished. Pick up where you left off or clear a list when you want a fresh start.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onToggleAdd}
              className="h-10 rounded-full bg-white px-4 font-semibold text-slate-950 hover:bg-teal-50"
            >
              {addOpen ? <X className="size-4" /> : <Plus className="size-4" />}
              {addOpen ? "Close catalog" : "Start a lesson"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/lessons">Browse full path</Link>
            </Button>
          </div>
        </div>
      </header>

      {addOpen ? (
        <section className="space-y-3 rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Add to in progress</h2>
            <p className="text-xs text-muted-foreground">{available.length} available</p>
          </div>
          {available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Every lesson is already started or completed.
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
          title="Loading your lessons"
          description="Pulling together saved exercises, favorites, started, and completed lessons."
          cards={4}
        />
      ) : null}

      <div className={cn("grid gap-8", !showContent && "hidden")}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Heart className="size-5 fill-rose-500/20 text-rose-600 dark:text-rose-400" />
                Saved exercises
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Skill exercises you saved for quick practice later.
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
                Clear all
              </Button>
            ) : null}
          </div>

          {exerciseFavorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <Heart className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">No saved exercises yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the heart on any skill exercise to save it here.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/skills">Browse skills</Link>
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
                Favorite lessons
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lessons you saved for quick access later.
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
                Clear all
              </Button>
            ) : null}
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <Heart className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">No favorite lessons yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the heart on any lesson in your path to save it here.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/lessons">Browse lessons</Link>
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
                        Remove
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
                Lessons you have started but not finished yet.
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
                Clear all
              </Button>
            ) : null}
          </div>

          {started.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <BookOpenCheck className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">No lessons in progress</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start one from the catalog or open a lesson from your path.
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
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full"
                        onClick={() => onCompleteLesson(item.entry.lessonId)}
                      >
                        <CheckCircle2 className="size-4" />
                        Mark complete
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full text-muted-foreground"
                        onClick={() => onRemoveLesson(item.entry.lessonId)}
                      >
                        <Trash2 className="size-4" />
                        Remove
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
                Lessons you have finished. Reopen any of them to practice again.
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
                Clear all
              </Button>
            ) : null}
          </div>

          {completed.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <CheckCircle2 className="mx-auto size-8 text-muted-foreground/70" />
              <p className="mt-3 font-semibold">No completed lessons yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mark a lesson complete when you are done practising it.
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
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full"
                        onClick={() => onReopenLesson(item.entry.lessonId)}
                      >
                        <RotateCcw className="size-4" />
                        Move to in progress
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full text-muted-foreground"
                        onClick={() => onRemoveLesson(item.entry.lessonId)}
                      >
                        <Trash2 className="size-4" />
                        Remove
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
