"use client";

import { useMemo } from "react";
import { dailyRemaining, useBillingMe } from "@/features/payments";
import { useGames } from "../../hooks/use-learning-catalog";
import { GAMES_CATALOG } from "../../model/games";
import { GamesHubPageView } from "./games-hub-page.view";

export function GamesHubPage() {
  const { games, loading, source } = useGames();
  const billing = useBillingMe();
  const cards = useMemo(
    () => (games.length ? games : GAMES_CATALOG.map((game) => ({ ...game, roundCount: 0 }))),
    [games],
  );

  return (
    <GamesHubPageView
      cards={cards}
      loading={loading}
      source={source}
      playsLeft={dailyRemaining(billing.data, "game_session")}
    />
  );
}
