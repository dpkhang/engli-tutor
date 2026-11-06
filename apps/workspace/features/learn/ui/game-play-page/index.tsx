"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/features/accounts";
import {
  billingMeQueryKey,
  dailyRemaining,
  planAllows,
  useBillingMe,
} from "@/features/payments";
import { queryKeys } from "@/lib/query";
import { LESSON_PACKS } from "../../model/curriculum";
import { markLessonStarted } from "../../model/lesson-progress";
import { useGame } from "../../hooks/use-learning-catalog";
import { useVocabProgress } from "../../hooks/use-vocab-progress";
import { gameSessionsApi } from "../../api/vocab-api";
import {
  pickGameRounds,
  pointsForRound,
  roundPoints,
  shuffleInPlace,
} from "../../model/games";
import {
  isMastered,
  isVocabGrade,
  needsReview,
  pickVocabSession,
  reviewRounds,
  supportsMode,
  toModeRound,
  type VocabMode,
} from "../../model/vocab-trainer";
import type { LearningGameRound, LearningLevel } from "../../api/types";
import {
  GamePlayPageView,
  type FlashcardDeckOption,
  type GamePlayPhase,
  type RoundAnswer,
  type RoundTiming,
} from "./game-play-page.view";

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
  const [answers, setAnswers] = useState<Array<RoundAnswer | undefined>>([]);
  const [playId, setPlayId] = useState(0);
  const [enter, setEnter] = useState<"next" | "back">("next");
  const isVocab = game?.id === "flashcard";
  const allDecks = useMemo(
    () => (isVocab ? (game?.decks ?? []) : []),
    [game, isVocab],
  );
  const profileQuery = useQuery({
    queryKey: queryKeys.account,
    queryFn: accountApi.get,
    enabled: allDecks.length > 0 || game?.id === "speed-reply",
  });
  const [pickedLevel, setPickedLevel] = useState<LearningLevel | null>(null);
  const [pickedDeckId, setPickedDeckId] = useState<string | null>(null);
  const [mode, setMode] = useState<VocabMode>("flip");
  const [sessionMode, setSessionMode] = useState<VocabMode>("flip");
  const [reviewRound, setReviewRound] = useState(0);
  const startedAt = useRef(0);
  const recordedPlayId = useRef(0);
  const {
    progress,
    saved,
    review,
    saveCard,
    loading: progressLoading,
    upgradeReason,
    clearUpgrade,
  } = useVocabProgress(isVocab);
  const queryClient = useQueryClient();
  const billing = useBillingMe();
  const playsLeft = dailyRemaining(billing.data, "game_session");
  const playsBlocked = playsLeft === 0;
  const lockedModes = useMemo<VocabMode[]>(
    () =>
      planAllows(billing.data, "fullVocabModes") ? [] : ["picture", "listen"],
    [billing.data],
  );
  const modeLocked = lockedModes.includes(mode);

  const deckLevels = useMemo(
    () => [...new Set(allDecks.map((deck) => deck.level))],
    [allDecks],
  );
  const profileLevel = profileQuery.data?.targetLevel ?? null;
  const level =
    pickedLevel ??
    (profileLevel && deckLevels.includes(profileLevel)
      ? profileLevel
      : (deckLevels[0] ?? null));
  const decks = useMemo<FlashcardDeckOption[]>(() => {
    const now = Date.now();
    return allDecks
      .filter((deck) => deck.level === level)
      .map((deck) => {
        const rounds =
          game?.rounds.filter((round) => round.deck === deck.id) ?? [];
        return {
          ...deck,
          reviewCount: rounds.filter((round) =>
            needsReview(progress.get(round.id), now),
          ).length,
          masteredCount: rounds.filter((round) =>
            isMastered(progress.get(round.id)),
          ).length,
          pictureCount: rounds.filter((round) => supportsMode(round, "picture"))
            .length,
        };
      });
  }, [allDecks, game, level, progress]);
  const deckId = decks.some((deck) => deck.id === pickedDeckId)
    ? pickedDeckId
    : (decks[0]?.id ?? null);

  useEffect(() => {
    if (lesson) markLessonStarted(lesson);
  }, [lesson]);

  const onPickLevel = useCallback((next: LearningLevel) => {
    setPickedLevel(next);
    setPickedDeckId(null);
  }, []);

  const begin = useCallback(
    (
      rounds: LearningGameRound[],
      nextReviewRound: number,
      nextMode: VocabMode,
    ) => {
      setSession(rounds);
      setSessionMode(nextMode);
      setReviewRound(nextReviewRound);
      setEnter("next");
      setIndex(0);
      setScores([]);
      setAnswers([]);
      setPlayId((current) => current + 1);
      startedAt.current = Date.now();
      setPhase("playing");
    },
    [],
  );

  const vocabSession = useCallback(
    (
      cards: LearningGameRound[],
      nextReviewRound: number,
      requested: VocabMode,
    ) => {
      if (!game) return;
      const usable = cards.filter((round) => supportsMode(round, requested));
      const nextMode = usable.length ? requested : "flip";
      const picked = usable.length ? usable : cards;
      begin(
        picked.map((round) => toModeRound(round, nextMode, game.rounds)),
        nextReviewRound,
        nextMode,
      );
    },
    [begin, game],
  );

  const onStart = useCallback(() => {
    if (!game || playsBlocked) return;
    if (isVocab && modeLocked) return;
    if (lesson) markLessonStarted(lesson);
    if (!isVocab) {
      begin(pickGameRounds(game.rounds, lesson, profileLevel), 0, "flip");
      return;
    }
    const tagged = lesson
      ? game.rounds.filter((round) => round.lessonIds?.includes(lesson))
      : [];
    const inDeck = deckId
      ? game.rounds.filter((round) => round.deck === deckId)
      : [];
    const pool = tagged.length ? tagged : inDeck.length ? inDeck : game.rounds;
    const picked = pickVocabSession(pool, progress, mode);
    vocabSession(
      picked.length ? picked : pickVocabSession(pool, progress, "flip"),
      0,
      mode,
    );
  }, [
    begin,
    deckId,
    game,
    isVocab,
    lesson,
    mode,
    modeLocked,
    playsBlocked,
    profileLevel,
    progress,
    vocabSession,
  ]);

  const cardsById = useMemo(
    () => new Map((game?.rounds ?? []).map((round) => [round.id, round])),
    [game],
  );

  const missedRounds = useMemo(
    () =>
      isVocab
        ? session.flatMap((round, i) => {
            const card = cardsById.get(round.id);
            return scores[i] === false && card ? [card] : [];
          })
        : [],
    [cardsById, isVocab, scores, session],
  );

  const onPracticeMissed = useCallback(() => {
    if (!missedRounds.length) return;
    vocabSession(
      shuffleInPlace([...missedRounds]),
      reviewRound + 1,
      sessionMode,
    );
  }, [missedRounds, reviewRound, sessionMode, vocabSession]);

  const onReviewDeck = useCallback(
    (id: string) => {
      if (!game || playsBlocked) return;
      const deckRounds = game.rounds.filter((round) => round.deck === id);
      const rounds = reviewRounds(deckRounds, progress, "flip");
      if (!rounds.length) return;
      setPickedDeckId(id);
      vocabSession(rounds, 1, modeLocked ? "flip" : mode);
    },
    [game, mode, modeLocked, playsBlocked, progress, vocabSession],
  );

  const startedToday = useRef(false);
  const wantsTodayReview = searchParams.get("review") === "today";
  useEffect(() => {
    if (
      !wantsTodayReview ||
      !game ||
      !isVocab ||
      progressLoading ||
      startedToday.current
    )
      return;
    startedToday.current = true;
    const due = reviewRounds(game.rounds, progress, "flip");
    if (due.length) vocabSession(due, 1, "flip");
  }, [
    game,
    isVocab,
    progress,
    progressLoading,
    vocabSession,
    wantsTodayReview,
  ]);

  // A 402 on vocab_review ends the session gracefully; the view shows the upgrade notice.
  useEffect(() => {
    if (upgradeReason && phase === "playing") setPhase("intro");
  }, [phase, upgradeReason]);

  const autoAdvance = isVocab && sessionMode === "flip";

  const onRoundSubmit = useCallback(
    (value: string, isCorrect: boolean, timing: RoundTiming) => {
      setScores((prev) => {
        const next = [...prev];
        next[index] = isCorrect;
        return next;
      });
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = {
          value,
          correct: isCorrect,
          points: roundPoints(
            isCorrect,
            timing.secondsLeft,
            timing.totalSeconds,
          ),
        };
        return next;
      });
      if (!isVocab) return;
      const cardId = session[index]?.id;
      if (cardId)
        review(
          cardId,
          sessionMode === "flip" && isVocabGrade(value)
            ? { grade: value }
            : isCorrect,
        );
      if (!autoAdvance) return;
      setEnter("next");
      if (index + 1 >= session.length) setPhase("results");
      else setIndex((current) => current + 1);
    },
    [autoAdvance, index, isVocab, review, session, sessionMode],
  );

  const onPreviousRound = useCallback(() => {
    setEnter("back");
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  const onNextRound = useCallback(() => {
    setEnter("next");
    if (index + 1 >= session.length) setPhase("results");
    else setIndex((current) => current + 1);
  }, [index, session.length]);

  const onBackToDecks = useCallback(() => {
    setPhase("intro");
  }, []);

  const correctCount = scores.filter(Boolean).length;
  const totalPoints = answers.reduce(
    (sum, answer) => sum + (answer?.points ?? 0),
    0,
  );

  const onRetryMissedRounds = useCallback(() => {
    if (isVocab || playsBlocked) return;
    const missed = session.filter((_, i) => scores[i] === false);
    if (!missed.length) return;
    begin(shuffleInPlace(missed), 0, "flip");
  }, [begin, isVocab, playsBlocked, scores, session]);

  useEffect(() => {
    if (
      phase !== "results" ||
      !game ||
      recordedPlayId.current === playId ||
      !session.length
    )
      return;
    recordedPlayId.current = playId;
    gameSessionsApi
      .record({
        gameId: game.id,
        ...(isVocab ? { mode: sessionMode, deckId: deckId ?? undefined } : {}),
        correct: correctCount,
        total: session.length,
        durationMs: Math.min(3_600_000, Date.now() - startedAt.current),
      })
      .then(() =>
        queryClient.invalidateQueries({ queryKey: billingMeQueryKey }),
      )
      .catch(() => undefined);
  }, [
    correctCount,
    deckId,
    game,
    isVocab,
    phase,
    playId,
    queryClient,
    session.length,
    sessionMode,
  ]);

  const round = session[index];

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
      enter={enter}
      round={round}
      correctCount={correctCount}
      deckLevels={lesson ? [] : deckLevels}
      deckLevel={level}
      decks={lesson ? [] : decks}
      deckId={deckId}
      mode={mode}
      lockedModes={lockedModes}
      playsLeft={playsLeft}
      autoAdvance={autoAdvance}
      onPickLevel={onPickLevel}
      onPickDeck={setPickedDeckId}
      onPickMode={setMode}
      onReviewDeck={onReviewDeck}
      reviewRound={reviewRound}
      missedRounds={missedRounds}
      onPracticeMissed={onPracticeMissed}
      onStart={onStart}
      onRoundSubmit={onRoundSubmit}
      answers={answers}
      totalPoints={totalPoints}
      onRetryMissedRounds={onRetryMissedRounds}
      onNextRound={onNextRound}
      onPreviousRound={onPreviousRound}
      onBackToDecks={onBackToDecks}
      savedCards={saved}
      upgradeReason={upgradeReason}
      onDismissUpgrade={clearUpgrade}
      onSaveCard={saveCard}
    />
  );
}
