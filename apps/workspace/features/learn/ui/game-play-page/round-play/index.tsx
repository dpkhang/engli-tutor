"use client";

import { type LearningGameRound } from "../../../api/types";
import { type RoundTiming } from "../types";
import { useRoundPlay } from "./use-round-play";
import { RoundPlayView } from "./round-play.view";

export function RoundPlay({
  round,
  gameId,
  canGoBack,
  enter,
  savedCards,
  onSaveCard,
  onBack,
  onSubmit,
}: {
  round: LearningGameRound;
  gameId: string;
  canGoBack: boolean;
  enter: "next" | "back";
  savedCards: Set<string>;
  onSaveCard: (cardId: string) => void;
  onBack: () => void;
  onSubmit: (value: string, correct: boolean, timing: RoundTiming) => void;
}) {
  const state = useRoundPlay({ round, onSaveCard, onSubmit });
  return (
    <RoundPlayView
      round={round}
      gameId={gameId}
      canGoBack={canGoBack}
      enter={enter}
      saved={savedCards.has(round.id)}
      s={state}
      onBack={onBack}
    />
  );
}
