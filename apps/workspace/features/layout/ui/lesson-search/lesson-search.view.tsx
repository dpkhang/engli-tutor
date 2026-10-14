"use client";

import { memo, type FormEvent, type RefObject } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { BookOpen, Search, X } from "lucide-react";
import type { LessonPack } from "@/features/learn";
import { useWorkspaceI18n } from "@/features/i18n";

export type LessonSearchViewProps = {
  open: boolean;
  query: string;
  loading: boolean;
  matches: LessonPack[];
  rootRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  onShow: () => void;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
  onSubmit: () => void;
  onSelectLesson: () => void;
  onViewAll: () => void;
};

export const LessonSearchView = memo(function LessonSearchView({
  open,
  query,
  loading,
  matches,
  rootRef,
  inputRef,
  onShow,
  onQueryChange,
  onClearQuery,
  onSubmit,
  onSelectLesson,
  onViewAll,
}: LessonSearchViewProps) {
  const t = useWorkspaceI18n();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onShow}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:border-primary/35 hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("workspace.searchLessons")}
      >
        <Search className="size-4" />
        <span className="hidden xl:inline">{t("workspace.searchLessons")}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium xl:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div className="fixed top-18 right-4 left-4 z-70 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl sm:absolute sm:top-[calc(100%+0.65rem)] sm:right-0 sm:left-auto sm:w-[min(24rem,calc(100vw-2rem))]">
          <form className="flex items-center gap-2 border-b border-border px-3" onSubmit={handleSubmit}>
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t("workspace.searchLessonsPlaceholder")}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-controls="lesson-search-results"
              aria-expanded={open}
            />
            {query ? (
              <button
                type="button"
                onClick={onClearQuery}
                className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("workspace.clearSearch")}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </form>

          <div id="lesson-search-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <p className="px-3 py-5 text-center text-sm text-muted-foreground">
                {t("workspace.findingLessons")}
              </p>
            ) : matches.length ? (
              matches.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/practice?scenario=${lesson.scenario}&lesson=${lesson.id}`}
                  role="option"
                  aria-selected="false"
                  onClick={onSelectLesson}
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
                      {lesson.level} · {lesson.duration} · {lesson.skills.map((skill) => t(`workspace.${skill.toLowerCase()}`)).join(" · ")}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm font-medium">{t("workspace.noLessonsFound")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("workspace.tryLessonSearch")}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="w-full border-t border-border px-4 py-3 text-left text-xs font-semibold text-primary hover:bg-muted"
          >
            {query.trim()
              ? t("workspace.viewAllResultsFor").replace("{query}", query.trim())
              : t("workspace.browseAllLessons")}
          </button>
        </div>
      ) : null}
    </div>
  );
});
