"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLessonPacks } from "@/features/learn/hooks/use-learning-catalog";
import { LessonSearchView } from "./lesson-search.view";

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

  const onShow = useCallback(() => {
    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const onQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const onClearQuery = useCallback(() => {
    setQuery("");
  }, []);

  const onSelectLesson = useCallback(() => {
    setOpen(false);
  }, []);

  const onViewAll = useCallback(() => {
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
    setOpen(false);
  }, [query, router]);

  return (
    <LessonSearchView
      open={open}
      query={query}
      loading={loading}
      matches={matches}
      rootRef={rootRef}
      inputRef={inputRef}
      onShow={onShow}
      onQueryChange={onQueryChange}
      onClearQuery={onClearQuery}
      onSubmit={onViewAll}
      onSelectLesson={onSelectLesson}
      onViewAll={onViewAll}
    />
  );
}
