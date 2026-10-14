"use client";

import { memo, type FormEvent } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { useRouter } from "next/navigation";
import { withCurrentLocale } from "@/lib/locale-path";
import { ArrowRight, BookOpen, Heart, LoaderCircle, Search, Sparkles } from "lucide-react";
import { Button, cn, Input } from "@engli-tutor/ui";
import { DataLoadingState } from "@/features/layout";
import type { LessonPack } from "../../model/curriculum";
import { useWorkspaceI18n } from "@/features/i18n";
import { LocalizedLink } from "@/features/i18n";

export type SearchPageViewProps = {
  query: string;
  lessons: LessonPack[];
  loading: boolean;
  favoriteIds: Set<string>;
  onToggleFavorite: (lessonId: string) => void;
};

export const SearchPageView = memo(function SearchPageView({
  query,
  lessons,
  loading,
  favoriteIds,
  onToggleFavorite,
}: SearchPageViewProps) {
  const t = useWorkspaceI18n();
  const router = useRouter();

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(withCurrentLocale(next ? `/search?q=${encodeURIComponent(next)}` : "/search"));
  };

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/12 via-card to-accent/10 px-5 py-6 sm:rounded-4xl sm:px-9 sm:py-8">
        <Sparkles
          className="absolute top-7 right-8 hidden size-7 text-primary/25 sm:block"
          aria-hidden
        />
        <p className="hidden text-xs font-semibold tracking-[0.16em] text-primary uppercase sm:block">
          {t("workspace.searchDiscover")}
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-3xl">
          {t("workspace.searchContent")}
        </h1>
        <p className="mt-2 hidden max-w-xl text-sm leading-6 text-muted-foreground sm:block">
          {t("workspace.searchDescription")}
        </p>

        <form onSubmit={onSearch} className="mt-6 grid max-w-2xl gap-2 sm:relative sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              clearButtonClassName="sm:right-28"
              key={query}
              name="q"
              defaultValue={query}
              autoFocus
              placeholder={t("workspace.searchPlaceholder")}
              className="h-13 w-full rounded-full border border-border bg-background pr-10 pl-12 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15 sm:pr-36"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full px-5 sm:absolute sm:top-1/2 sm:right-1.5 sm:h-10 sm:w-auto sm:-translate-y-1/2"
            disabled={loading}
          >
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {loading ? t("workspace.searching") : t("workspace.search")}
          </Button>
        </form>
      </section>

      {query ? (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t("workspace.resultsFor").replace("{query}", query)}</h2>
            {!loading ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {lessons.length} {t("workspace.lessonsFound")}
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <LocalizedLink href="/lessons">{t("workspace.browseAllLessons")}</LocalizedLink>
          </Button>
        </div>
      ) : null}

      {loading && query ? (
        <DataLoadingState
          title={t("workspace.searchingLessons")}
          description={t("workspace.searchingLessonsDescription")}
          cards={4}
        />
      ) : null}

      {!loading && lessons.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => {
            const favorited = favoriteIds.has(lesson.id);
            return (
              <article
                key={lesson.id}
                className="group relative flex flex-col rounded-3xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg sm:p-6"
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
                  onClick={() => onToggleFavorite(lesson.id)}
                >
                  <Heart className={cn("size-4", favorited && "fill-current")} />
                </button>
                <div className="flex flex-wrap items-center gap-2 pr-10 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    {lesson.level}
                  </span>
                  <span className="text-muted-foreground">{lesson.duration}</span>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                    <BookOpen className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold group-hover:text-primary">{lesson.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{lesson.focus}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {lesson.skills.map((skill) => t(`workspace.${skill.toLowerCase()}`)).join(" · ")}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button asChild className="rounded-full">
                    <Link href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}>
                      {t("workspace.startLesson")} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && query && lessons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <Search className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">{t("workspace.noLessonsSearch")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.broaderSearch")}
          </p>
        </div>
      ) : null}

      {!query ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <BookOpen className="mx-auto size-7 text-primary" />
          <h2 className="mt-4 font-semibold">{t("workspace.whatLearn")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspace.searchHint")}
          </p>
        </div>
      ) : null}
    </div>
  );
});
