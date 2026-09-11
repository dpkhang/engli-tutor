import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GamePlayPage } from "@/features/learn/ui/game-play-page";
import { GAMES_CATALOG, isGameId } from "@/features/learn/model/games";

export function generateStaticParams() {
  return GAMES_CATALOG.map((game) => ({ slug: game.id }));
}

export const dynamicParams = false;

export default async function GamePlayRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isGameId(slug)) notFound();
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading game…</div>}>
      <GamePlayPage slug={slug} />
    </Suspense>
  );
}
