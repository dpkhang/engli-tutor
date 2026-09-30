import type { VocabProgressItem } from "../api/vocab-api";
import type { LearningGameRound } from "../api/types";
import { shuffleInPlace } from "./games";

export type VocabMode = "flip" | "picture" | "listen";

export const VOCAB_MODES: Array<{ id: VocabMode; label: string }> = [
  { id: "flip", label: "Flip" },
  { id: "picture", label: "Picture quiz" },
  { id: "listen", label: "Listen & pick" },
];

export const VOCAB_SESSION_SIZE = 10;
export const MASTERED_BOX = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Mirrors the backend Leitner intervals so optimistic updates match the server. */
const INTERVAL_DAYS = [0, 0, 1, 3, 7, 16];

export type VocabProgressMap = Map<string, VocabProgressItem>;

export function isMissed(item: VocabProgressItem | undefined) {
  return item?.lastCorrect === false;
}

export function isDue(item: VocabProgressItem | undefined, now = Date.now()) {
  return Boolean(item?.lastSeenAt) && new Date(item!.dueAt).getTime() <= now;
}

export function needsReview(item: VocabProgressItem | undefined, now = Date.now()) {
  return isMissed(item) || isDue(item, now);
}

export function isMastered(item: VocabProgressItem | undefined) {
  return (item?.box ?? 0) >= MASTERED_BOX && item?.lastCorrect === true;
}

export function applyReview(
  item: VocabProgressItem | undefined,
  wordId: string,
  correct: boolean,
  now = Date.now(),
): VocabProgressItem {
  const box = correct ? Math.min(MASTERED_BOX, (item?.box ?? 1) + 1) : 1;
  return {
    wordId,
    box,
    dueAt: new Date(now + (INTERVAL_DAYS[box] ?? 0) * DAY_MS).toISOString(),
    lastCorrect: correct,
    lastSeenAt: new Date(now).toISOString(),
    saved: item?.saved ?? false,
  };
}

export function supportsMode(round: LearningGameRound, mode: VocabMode) {
  return mode !== "picture" || Boolean(round.material?.imageUrl);
}

/** Missed words first, then due reviews, then new words, then the least-known of the rest. */
export function pickVocabSession(
  pool: LearningGameRound[],
  progress: VocabProgressMap,
  mode: VocabMode,
  size = VOCAB_SESSION_SIZE,
) {
  const now = Date.now();
  const usable = pool.filter((round) => supportsMode(round, mode));
  const missed: LearningGameRound[] = [];
  const due: LearningGameRound[] = [];
  const fresh: LearningGameRound[] = [];
  const rest: LearningGameRound[] = [];
  for (const round of usable) {
    const item = progress.get(round.id);
    if (isMissed(item)) missed.push(round);
    else if (isDue(item, now)) due.push(round);
    else if (!item?.lastSeenAt) fresh.push(round);
    else rest.push(round);
  }
  rest.sort((a, b) => (progress.get(a.id)?.box ?? 0) - (progress.get(b.id)?.box ?? 0));
  return [...shuffleInPlace(missed), ...shuffleInPlace(due), ...shuffleInPlace(fresh), ...rest].slice(0, size);
}

export function reviewRounds(pool: LearningGameRound[], progress: VocabProgressMap, mode: VocabMode) {
  const now = Date.now();
  return shuffleInPlace(
    pool.filter((round) => supportsMode(round, mode) && needsReview(progress.get(round.id), now)),
  );
}

function pickDistractors(round: LearningGameRound, all: LearningGameRound[], word: string) {
  const words = (rounds: LearningGameRound[]) =>
    rounds.flatMap((item) =>
      item.question.kind === "flash" && item.question.word.toLowerCase() !== word.toLowerCase()
        ? [item.question.word]
        : [],
    );
  const sameDeck = shuffleInPlace([...new Set(words(all.filter((item) => item.deck === round.deck)))]);
  const sameLevel = shuffleInPlace([...new Set(words(all.filter((item) => item.level === round.level)))]);
  return [...new Set([...sameDeck, ...sameLevel])].slice(0, 3);
}

/** Turns a flashcard into the question shape for the chosen mode; flip keeps the card as-is. */
export function toModeRound(round: LearningGameRound, mode: VocabMode, all: LearningGameRound[]): LearningGameRound {
  const card = round.question;
  if (mode === "flip" || card.kind !== "flash") return round;
  const options = shuffleInPlace([card.word, ...pickDistractors(round, all, card.word)]);
  const question = {
    id: `${card.id}-${mode}`,
    kind: "choice" as const,
    prompt: mode === "picture" ? "What is this? Choose the English word." : "Listen, then pick the word you heard.",
    options,
    correctIndex: options.indexOf(card.word),
    explanation: `${card.word} ${card.ipa} — ${card.meaningVi}. ${card.gloss}`,
  };
  return {
    ...round,
    seconds: 20,
    hearAgainMax: mode === "listen" ? 3 : undefined,
    material:
      mode === "picture"
        ? { title: "Picture", body: "", imageUrl: round.material?.imageUrl }
        : { title: "Listen", body: card.word, speakable: true },
    question,
  };
}
