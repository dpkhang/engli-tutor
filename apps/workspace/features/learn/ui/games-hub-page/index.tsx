"use client";

import { useMemo } from "react";
import { useGames } from "../../hooks/use-learning-catalog";
import { GAMES_CATALOG } from "../../model/games";
import { GamesHubPageView } from "./games-hub-page.view";

export function GamesHubPage() {
  const { games, loading, source } = useGames();
  const cards = useMemo(
    () => (games.length ? games : GAMES_CATALOG.map((game) => ({ ...game, roundCount: 0 }))),
    [games],
  );

  return <GamesHubPageView cards={cards} loading={loading} source={source} />;
}
