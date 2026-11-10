import type { LearningGameDeck } from "../../api/types";

export type GamePlayPhase = "intro" | "playing" | "results";

/** Seconds of timer freeze allowed per round while the mic is recording. */
export const MAX_MIC_PAUSE_SECONDS = 20;

export type RoundTiming = { secondsLeft: number; totalSeconds: number };

export type RoundAnswer = {
  value: string;
  correct: boolean;
  points: number;
};

export type FlashcardDeckOption = LearningGameDeck & {
  reviewCount: number;
  masteredCount: number;
  pictureCount: number;
};
