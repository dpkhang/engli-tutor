"use client";

import { memo } from "react";
import { LocalizedLink as Link, useWorkspaceI18n } from "@/features/i18n";
import { useUpgradeModal, type UpgradeReason } from "@/features/payments";
import { ArrowLeft, Gamepad2, House, Lightbulb } from "lucide-react";
import { Button } from "@engli-tutor/ui";
import { DataLoadingState, NotFoundPage } from "@/features/layout";
import { type LearningGame, type LearningGameRound, type LearningLevel } from "../../api/types";
import { type LessonPack } from "../../model/curriculum";
import { type VocabMode } from "../../model/vocab-trainer";
import { FlashResultsView } from "./flash-results";
import { GameResultsView } from "./game-results";
import {
  type RoundTiming,
  type RoundAnswer,
  type FlashcardDeckOption,
  type GamePlayPhase,
} from "./types";
import { DeckPicker } from "./deck-picker";
import { RoundPlay } from "./round-play";

export type { GamePlayPhase, RoundTiming, RoundAnswer, FlashcardDeckOption } from "./types";

export type GamePlayPageViewProps = {
  game: LearningGame | null;
  loading: boolean;
  lessonPack: LessonPack | undefined;
  phase: GamePlayPhase;
  session: LearningGameRound[];
  index: number;
  scores: boolean[];
  playId: number;
  enter: "next" | "back";
  round: LearningGameRound | undefined;
  correctCount: number;
  deckLevels: LearningLevel[];
  deckLevel: LearningLevel | null;
  decks: FlashcardDeckOption[];
  deckId: string | null;
  onPickLevel: (level: LearningLevel) => void;
  onPickDeck: (deckId: string) => void;
  mode: VocabMode;
  lockedModes: VocabMode[];
  /** Free plays left today; null when plays are not capped. */
  playsLeft: number | null;
  autoAdvance: boolean;
  onPickMode: (mode: VocabMode) => void;
  onReviewDeck: (deckId: string) => void;
  reviewRound: number;
  missedRounds: LearningGameRound[];
  onPracticeMissed: () => void;
  onStart: () => void;
  onRoundSubmit: (value: string, isCorrect: boolean, timing: RoundTiming) => void;
  /** Per-round answers, used by the speed-reply results screen. */
  answers: Array<RoundAnswer | undefined>;
  totalPoints: number;
  /** Retry only the rounds answered wrong (non-flashcard games). */
  onRetryMissedRounds: () => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onBackToDecks: () => void;
  savedCards: Set<string>;
  onSaveCard: (cardId: string) => void;
  upgradeReason: UpgradeReason | null;
  onDismissUpgrade: () => void;
};

export const GamePlayPageView = memo(function GamePlayPageView({
  game,
  loading,
  lessonPack,
  phase,
  session,
  index,
  scores,
  playId,
  enter,
  round,
  correctCount,
  deckLevels,
  deckLevel,
  decks,
  deckId,
  onPickLevel,
  onPickDeck,
  mode,
  lockedModes,
  playsLeft,
  autoAdvance,
  onPickMode,
  onReviewDeck,
  reviewRound,
  missedRounds,
  onPracticeMissed,
  onStart,
  onRoundSubmit,
  answers,
  totalPoints,
  onRetryMissedRounds,
  onNextRound,
  onPreviousRound,
  onBackToDecks,
  savedCards,
  onSaveCard,
  upgradeReason,
  onDismissUpgrade,
}: GamePlayPageViewProps) {
  const t = useWorkspaceI18n();
  const { openUpgradeModal } = useUpgradeModal();
  const activeDeck = decks.find((deck) => deck.id === deckId);
  const inDeck = decks.length > 0 && phase !== "intro";
  const playsBlocked = playsLeft === 0;
  const modeLocked = game?.id === "flashcard" && lockedModes.includes(mode);
  if (loading) {
    return (
      <DataLoadingState
        title={t("workspace.settingUpGame")}
        description={t("workspace.loadingShortRounds")}
        cards={3}
      />
    );
  }

  if (!game) {
    return (
      <NotFoundPage
        title={t("workspace.gameUnavailable")}
        description={t("workspace.gameUnavailableDescription")}
        actions={[
          {
            href: "/games",
            label: t("workspace.allGames"),
            icon: <Gamepad2 />,
            primary: true,
          },
          { href: "/", label: t("workspace.backToToday"), icon: <House /> },
        ]}
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8 overflow-x-clip pb-10">
      {inDeck ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={onBackToDecks}
        >
          <ArrowLeft /> {t("workspace.allLevelsGame")}
        </Button>
      ) : (
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/games">
            <ArrowLeft /> {t("workspace.allGames")}
          </Link>
        </Button>
      )}

      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-orange-400 px-5 py-6 text-white sm:rounded-[1.75rem] sm:px-9 sm:py-10">
        <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase sm:block">
          {game.skill} · {t("learn.game.minutes", { count: game.durationMinutes })}
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">{game.title}</h1>
        <p className="mt-3 hidden max-w-2xl text-sm text-white/80 sm:block">{game.howToPlay}</p>
        {lessonPack ? (
          <p className="mt-4 hidden text-xs text-white/75 sm:block">
            {t("workspace.fromLesson")}
            {lessonPack.title}
          </p>
        ) : null}
      </header>

      {upgradeReason && game.id === "flashcard" ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100"
        >
          <p className="min-w-0 flex-1">{t("billing.upgrade.quotaVocabReview")}</p>
          <Button type="button" size="sm" className="rounded-full" onClick={openUpgradeModal}>
            {t("workspace.seePlans")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={onDismissUpgrade}
          >
            {t("learn.review.dismiss")}
          </Button>
        </div>
      ) : null}

      {phase === "intro" ? (
        <section className="space-y-5 rounded-3xl border border-border/70 bg-card p-6">
          <p className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            {game.body}{" "}
            {decks.length ? t("workspace.playFullDeck") : t("workspace.shortRoundsDescription")}
          </p>
          {decks.length ? (
            <DeckPicker
              levels={deckLevels}
              level={deckLevel}
              decks={decks}
              deckId={deckId}
              onPickLevel={onPickLevel}
              onPickDeck={onPickDeck}
              mode={mode}
              lockedModes={lockedModes}
              canReview={!playsBlocked}
              onPickMode={onPickMode}
              onReviewDeck={onReviewDeck}
            />
          ) : null}
          {playsBlocked ? (
            <p
              className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
              role="status"
            >
              {t("workspace.freePlaysUsedGame")}
            </p>
          ) : playsLeft !== null ? (
            <p className="text-xs text-muted-foreground">
              {t(playsLeft === 1 ? "learn.game.playsLeftOne" : "learn.game.playsLeftOther", {
                count: playsLeft,
              })}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {playsBlocked || modeLocked ? (
              <Button type="button" className="h-11 rounded-full px-6" onClick={openUpgradeModal}>
                {playsBlocked ? t("workspace.seePlans") : t("workspace.unlockStandard")}
              </Button>
            ) : (
              <Button className="h-11 rounded-full px-6" onClick={onStart}>
                {activeDeck
                  ? t("learn.game.startDeck", {
                      deck: activeDeck.title,
                      count:
                        mode === "picture" && activeDeck.pictureCount > 0
                          ? activeDeck.pictureCount
                          : activeDeck.cardCount,
                    })
                  : t("workspace.startPlaying")}
              </Button>
            )}
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/skills/${game.relatedSkill}`}>{t("workspace.relatedSkillDrill")}</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {phase === "playing" && round ? (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {reviewRound > 0 ? (
              <span className="mr-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-300">
                {t("learn.game.reviewRound", { count: reviewRound })}
              </span>
            ) : null}
            {t("workspace.roundOf", {
              current: index + 1,
              total: session.length,
            })}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{
                width: `${((index + (scores[index] !== undefined ? 1 : 0)) / session.length) * 100}%`,
              }}
            />
          </div>
          <RoundPlay
            key={`${playId}-${round.id}-${index}`}
            round={round}
            gameId={game.id}
            canGoBack={index > 0}
            enter={enter}
            savedCards={savedCards}
            onSaveCard={onSaveCard}
            onBack={onPreviousRound}
            onSubmit={onRoundSubmit}
          />
          {!autoAdvance && scores[index] !== undefined ? (
            <Button className="h-11 rounded-full px-6" onClick={onNextRound}>
              {index + 1 >= session.length ? t("workspace.seeResults") : t("workspace.nextRound")}
            </Button>
          ) : null}
        </section>
      ) : null}

      {phase === "results" && game.id === "flashcard" ? (
        <FlashResultsView
          missedRounds={missedRounds}
          correctCount={correctCount}
          total={session.length}
          hasDecks={decks.length > 0}
          playsBlocked={playsBlocked}
          onPracticeMissed={onPracticeMissed}
          onBackToDecks={onBackToDecks}
          onStart={onStart}
          onUpgrade={openUpgradeModal}
        />
      ) : null}

      {phase === "results" && game.id !== "flashcard" ? (
        <GameResultsView
          game={game}
          session={session}
          scores={scores}
          answers={answers}
          correctCount={correctCount}
          totalPoints={totalPoints}
          playsBlocked={playsBlocked}
          onStart={onStart}
          onRetryMissedRounds={onRetryMissedRounds}
          onUpgrade={openUpgradeModal}
        />
      ) : null}
    </div>
  );
});
