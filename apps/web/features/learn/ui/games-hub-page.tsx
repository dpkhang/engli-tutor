"use client";

import Link from "next/link";
import { ArrowRight, Gamepad2, Sparkles, Timer } from "lucide-react";
import { DataLoadingState } from "@/features/layout";
import { useGames } from "../hooks/use-learning-catalog";
import { GAME_THEME, GAMES_CATALOG } from "../model/games";
import type { LearningGameId } from "../api/types";

export function GamesHubPage() {
  const { games, loading, source } = useGames();
  const cards = games.length
    ? games
    : GAMES_CATALOG.map((game) => ({ ...game, roundCount: 0 }));

  return (
    <div className="space-y-10 pb-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 to-orange-400 px-6 py-9 text-white sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="absolute -right-12 -top-16 size-56 rounded-full border-[28px] border-white/10"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
            <Sparkles className="size-3.5 text-amber-200" />
            Learn by playing
          </span>
          <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Mini-games for everyday English
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            One to three minutes each. Hear, match, fix, then say it — the same language in a new
            shape.
            {!loading && source === "api" ? " Fresh rounds are ready." : ""}
          </p>
        </div>
      </header>

      {loading ? (
        <DataLoadingState
          title="Loading games"
          description="Preparing short rounds you can finish on a break."
          cards={6}
        />
      ) : null}

      <section className={loading ? "hidden" : "grid gap-4 sm:grid-cols-2"}>
        {cards.map((game) => {
          const theme = GAME_THEME[game.id as LearningGameId] ?? GAME_THEME["speed-reply"];
          return (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className={`group relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-gradient-to-br ${theme.wash} via-card to-card p-6 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-xl`}
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
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{game.body}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {game.roundCount ? `${game.roundCount} rounds` : game.howToPlay}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Play <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
