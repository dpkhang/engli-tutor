"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Search, X } from "lucide-react";
import { useLessonPacks } from "@/features/learn/hooks/use-learning-catalog";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function LessonSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { packs, loading } = useLessonPacks();

  const matches = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return packs.slice(0, 5);
    return packs
      .filter((lesson) =>
        normalize(
          [lesson.title, lesson.focus, lesson.tip, lesson.level, ...lesson.skills].join(" "),
        ).includes(term),
      )
      .slice(0, 6);
  }, [packs, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const show = () => {
    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const viewAll = () => {
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={show}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:border-primary/35 hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Search lessons"
      >
        <Search className="size-4" />
        <span className="hidden xl:inline">Search lessons</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium xl:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+0.65rem)] right-0 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
          <form
            className="flex items-center gap-2 border-b border-border px-3"
            onSubmit={(event) => {
              event.preventDefault();
              viewAll();
            }}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by topic, skill, or level…"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-controls="lesson-search-results"
              aria-expanded={open}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </form>

          <div id="lesson-search-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <p className="px-3 py-5 text-center text-sm text-muted-foreground">
                Finding lessons…
              </p>
            ) : matches.length ? (
              matches.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                  role="option"
                  aria-selected="false"
                  onClick={() => setOpen(false)}
                  className="group flex gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold group-hover:text-primary">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {lesson.level} · {lesson.duration} · {lesson.skills.join(" · ")}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm font-medium">No lessons found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a topic, skill, or level.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={viewAll}
            className="w-full border-t border-border px-4 py-3 text-left text-xs font-semibold text-primary hover:bg-muted"
          >
            {query.trim() ? `View all results for “${query.trim()}”` : "Browse all lessons"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
