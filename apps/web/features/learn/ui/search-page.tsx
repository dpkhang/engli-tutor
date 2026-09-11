"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import { Button } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import { useLessonPacks } from "../hooks/use-learning-catalog";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { packs, loading } = useLessonPacks();

  const lessons = useMemo(() => {
    const term = normalize(query);
    if (!term) return [];
    return packs.filter((lesson) =>
      normalize(
        [lesson.title, lesson.focus, lesson.tip, lesson.game, lesson.level, ...lesson.skills].join(
          " ",
        ),
      ).includes(term),
    );
  }, [packs, query]);

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-gradient-to-br from-primary/12 via-card to-accent/10 px-5 py-6 sm:rounded-[2rem] sm:px-9 sm:py-8">
        <Sparkles
          className="absolute top-7 right-8 hidden size-7 text-primary/25 sm:block"
          aria-hidden
        />
        <p className="hidden text-xs font-semibold tracking-[0.16em] text-primary uppercase sm:block">
          Discover your next lesson
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-3xl">
          Search learning content
        </h1>
        <p className="mt-2 hidden max-w-xl text-sm leading-6 text-muted-foreground sm:block">
          Find lessons by topic, skill, level, or a real-life situation you want to practise.
        </p>

        <form action="/search" className="mt-6 grid max-w-2xl gap-2 sm:relative sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              key={query}
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Try “interview”, “speaking”, or “B1”…"
              className="h-13 w-full rounded-full border border-border bg-background pr-4 pl-12 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15 sm:pr-28"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full px-5 sm:absolute sm:top-1/2 sm:right-1.5 sm:h-10 sm:w-auto sm:-translate-y-1/2"
          >
            Search
          </Button>
        </form>
      </section>

      {query ? (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Results for “{query}”</h2>
            {!loading ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} found
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/lessons">Browse all lessons</Link>
          </Button>
        </div>
      ) : null}

      {loading && query ? (
        <DataLoadingState
          title="Searching lessons"
          description="Finding learning content that matches your goal."
          cards={4}
        />
      ) : null}

      {!loading && lessons.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="group flex flex-col rounded-[1.5rem] border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg sm:p-6"
            >
              <div className="flex items-center gap-2 text-xs">
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
                {lesson.skills.join(" · ")}
              </p>
              <Button asChild className="mt-5 w-full rounded-full">
                <Link href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}>
                  Start lesson <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && query && lessons.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <Search className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No lessons found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a broader topic, another skill, or a CEFR level such as A2 or B1.
          </p>
        </div>
      ) : null}

      {!query ? (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-card/60 px-6 py-12 text-center">
          <BookOpen className="mx-auto size-7 text-primary" />
          <h2 className="mt-4 font-semibold">What would you like to learn?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a topic above or use the search shortcut from anywhere with ⌘/Ctrl + K.
          </p>
        </div>
      ) : null}
    </div>
  );
}
