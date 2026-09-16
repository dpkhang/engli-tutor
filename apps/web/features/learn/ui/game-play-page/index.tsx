"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LESSON_PACKS } from "../../model/curriculum";
import { markLessonStarted } from "../../model/lesson-progress";
import { useGame } from "../../hooks/use-learning-catalog";
import { pickGameRounds } from "../../model/games";
import type { LearningGameRound } from "../../api/types";
import { GamePlayPageView, type GamePlayPhase } from "./game-play-page.view";

export function GamePlayPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson");
  const { game, loading } = useGame(slug, lesson);
  const lessonPack = useMemo(
    () => LESSON_PACKS.find((item) => item.id === lesson),
    [lesson],
  );
  const [phase, setPhase] = useState<GamePlayPhase>("intro");
  const [session, setSession] = useState<LearningGameRound[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [playId, setPlayId] = useState(0);

  useEffect(() => {
    if (lesson) markLessonStarted(lesson);
  }, [lesson]);

  const onStart = useCallback(() => {
    if (!game) return;
    if (lesson) markLessonStarted(lesson);
    setSession(pickGameRounds(game.rounds, lesson));
    setIndex(0);
    setScores([]);
    setPlayId((current) => current + 1);
    setPhase("playing");
  }, [game, lesson]);

  const onRoundSubmit = useCallback((_value: string, isCorrect: boolean) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = isCorrect;
      return next;
    });
  }, [index]);

  const onNextRound = useCallback(() => {
    if (index + 1 >= session.length) setPhase("results");
    else setIndex((current) => current + 1);
  }, [index, session.length]);

  const round = session[index];
  const correctCount = scores.filter(Boolean).length;

  return (
    <GamePlayPageView
      game={game}
      loading={loading}
      lessonPack={lessonPack}
      phase={phase}
      session={session}
      index={index}
      scores={scores}
      playId={playId}
      round={round}
      correctCount={correctCount}
      onStart={onStart}
      onRoundSubmit={onRoundSubmit}
      onNextRound={onNextRound}
    />
  );
}
