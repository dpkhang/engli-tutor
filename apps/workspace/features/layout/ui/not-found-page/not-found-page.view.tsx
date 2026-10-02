"use client";

import { memo } from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, House, Search } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { useWorkspaceI18n } from "@/features/i18n/workspace-i18n";

export type NotFoundAction = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
};

const DEFAULT_ACTIONS: NotFoundAction[] = [
  { href: "/", label: "Back to Today", icon: <House />, primary: true },
  { href: "/skills", label: "Practice", icon: <BookOpen /> },
  { href: "/games", label: "Games", icon: <Gamepad2 /> },
];

function LetterTile({
  letter,
  className,
  delay,
}: {
  letter: string;
  className?: string;
  delay: string;
}) {
  return (
    <span className={className}>
      <span
        className="not-found-tile grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/15 text-lg font-semibold shadow-sm backdrop-blur-sm sm:size-14 sm:text-xl"
        style={{ animationDelay: delay }}
      >
        {letter}
      </span>
    </span>
  );
}

export type NotFoundPageViewProps = {
  code?: string;
  title?: string;
  description?: string;
  actions?: NotFoundAction[];
};

export const NotFoundPageView = memo(function NotFoundPageView({
  code = "404",
  title,
  description,
  actions = DEFAULT_ACTIONS,
}: NotFoundPageViewProps) {
  const t = useWorkspaceI18n();
  const resolvedTitle = title ?? t("workspace.notFoundTitle");
  const resolvedDescription = description ?? t("workspace.notFoundDescription");
  const resolvedActions = actions ?? [
    { href: "/", label: t("workspace.backToToday"), icon: <House />, primary: true },
    { href: "/skills", label: t("workspace.practice"), icon: <BookOpen /> },
    { href: "/games", label: t("workspace.games"), icon: <Gamepad2 /> },
  ];
  return (
    <div
      data-not-found
      className="relative mx-auto flex min-h-[min(36rem,calc(100svh-10rem))] w-full max-w-2xl flex-col items-center justify-center px-1 py-6 text-center sm:py-10"
    >
      <div
        aria-hidden
        className="workspace-hero-accent relative mb-8 flex h-36 w-full max-w-md items-center justify-center overflow-hidden rounded-[1.75rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 sm:h-44 sm:rounded-4xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(129,140,248,.4),transparent_32%),radial-gradient(circle_at_8%_100%,rgba(14,165,233,.22),transparent_38%)]" />
        <div className="relative flex items-end gap-2.5 sm:gap-3">
          <LetterTile letter="A" className="-rotate-12" delay="0ms" />
          <LetterTile letter="?" className="scale-110" delay="80ms" />
          <LetterTile letter="Z" className="rotate-8" delay="160ms" />
        </div>
        <span className="absolute top-4 left-5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
          {t("workspace.missingPage")}
        </span>
      </div>

      <p className="font-display text-5xl font-semibold tracking-[-0.06em] text-primary sm:text-6xl">
        {code}
      </p>
      <h1 className="mt-3 max-w-lg text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {resolvedTitle}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        {resolvedDescription}
      </p>

      <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        {resolvedActions.map((action) => (
          <Button
            key={action.href + action.label}
            asChild
            variant={action.primary ? "default" : "outline"}
            className="h-11 rounded-full px-5"
          >
            <Link href={action.href}>
              {action.icon}
              {action.label}
            </Link>
          </Button>
        ))}
      </div>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Search className="size-3.5" />
        {t("workspace.notFoundHint")}
      </p>
    </div>
  );
});
