"use client";

import { memo } from "react";
import { LocalizedLink as Link } from "@/features/i18n";
import { useUpgradeModal } from "@/features/payments";
import { ArrowRight, Gamepad2, Sparkles, Timer } from "lucide-react";
import { DataLoadingState } from "@/features/layout";
import { GAME_THEME } from "../../model/games";
import type { LearningGameId } from "../../api/types";
import { useWorkspaceI18n } from "@/features/i18n";
import { LocalizedLink } from "@/features/i18n";

export type GamesHubCard = {
  id: string;
  title: string;
  body: string;
  durationMinutes: number;
  roundCount: number;
  howToPlay: string;
};

export type GamesHubPageViewProps = {
  cards: GamesHubCard[];
  loading: boolean;
  source: "api" | "local";
  /** Free plays left today; null when plays are not capped. */
  playsLeft: number | null;
};

export const GamesHubPageView = memo(function GamesHubPageView({
  cards,
  loading,
  source,
  playsLeft,
}: GamesHubPageViewProps) {
  const t = useWorkspaceI18n();
  const { openUpgradeModal } = useUpgradeModal();
  return (
    <div className="space-y-10 pb-8">
      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-orange-400 px-5 py-6 text-white sm:rounded-4xl sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 hidden size-56 rounded-full border-28 border-white/10 sm:block"
        />
        <div className="relative">
          <span className="hidden items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium sm:inline-flex">
            <Sparkles className="size-3.5 text-amber-200" />
            {t("workspace.learnByPlaying")}
          </span>
          <h1 className="max-w-xl text-xl font-semibold tracking-[-0.035em] sm:mt-5 sm:text-4xl">
            {t("workspace.miniGamesTitle")}
          </h1>
          <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-white/80 sm:block sm:text-base">
            {t("workspace.miniGamesDescriptionLong")}{!loading && source === "api" ? t("workspace.freshRounds") : ""}
          </p>
          {playsLeft !== null ? (
            <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
              {playsLeft > 0
                ? `${playsLeft} ${playsLeft === 1 ? t("workspace.freePlayLeft") : t("workspace.freePlaysLeft")}`
                : t("workspace.freePlaysUsed")}
              <button type="button" className="underline underline-offset-2" onClick={openUpgradeModal}>
                {t("workspace.unlimitedStandard")}
              </button>
            </p>
          ) : null}
        </div>
      </header>

      {loading ? (
        <DataLoadingState
          title={t("workspace.loadingGames")}
          description={t("workspace.loadingGamesDescription")}
          cards={6}
        />
      ) : null}

      <section className={loading ? "hidden" : "grid gap-4 sm:grid-cols-2"}>
        {cards.map((game) => {
          const theme = GAME_THEME[game.id as LearningGameId] ?? GAME_THEME["speed-reply"];
          return (
            <LocalizedLink
              key={game.id}
              href={`/games/${game.id}`}
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br ${theme.wash} via-card to-card p-6 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-11 place-items-center rounded-2xl ${theme.badge}`}>
                  <Gamepad2 className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="size-3.5" />
                  {game.durationMinutes} min
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight group-hover:text-primary">
                {game.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{game.body}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {game.roundCount ? `${game.roundCount} ${t("workspace.rounds")}` : game.howToPlay}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-primary">
                {t("workspace.play")}{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </LocalizedLink>
          );
        })}
      </section>
    </div>
  );
});
