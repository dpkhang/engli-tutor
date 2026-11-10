import type { VocabGrade, VocabProgressItem, VocabReviewInput } from "../api/vocab-api";
import type { LearningGameRound } from "../api/types";
import { shuffleInPlace } from "./games";

export type VocabMode = "flip" | "picture" | "listen";

export const VOCAB_MODES: Array<{ id: VocabMode; labelKey: string }> = [
  { id: "flip", labelKey: "learn.vocabMode.flip" },
  { id: "picture", labelKey: "learn.vocabMode.picture" },
  { id: "listen", labelKey: "learn.vocabMode.listen" },
];

export const MASTERED_BOX = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_MS = 10 * 60 * 1000;
/** Optimistic-only approximation of the backend schedule; the server response replaces it. */
const INTERVAL_DAYS = [0, 1, 1, 3, 7, 16];

export type VocabProgressMap = Map<string, VocabProgressItem>;

export function isMissed(item: VocabProgressItem | undefined) {
  return item?.lastCorrect === false;
}

export function isDue(item: VocabProgressItem | undefined, now = Date.now()) {
  return Boolean(item?.lastSeenAt) && new Date(item!.dueAt).getTime() <= now;
}

/** Same definition as the server: lastSeenAt != null && dueAt <= now. */
export function needsReview(item: VocabProgressItem | undefined, now = Date.now()) {
  return isDue(item, now);
}

export function isMastered(item: VocabProgressItem | undefined) {
  return (item?.box ?? 0) >= MASTERED_BOX && item?.lastCorrect === true;
}

export function applyReview(
  item: VocabProgressItem | undefined,
  wordId: string,
  input: VocabReviewInput,
  now = Date.now(),
): VocabProgressItem {
  const grade = "grade" in input ? input.grade : input.correct ? "good" : "again";
  const current = item?.box ?? 1;
  const box = grade === "again" ? 1 : grade === "hard" ? current : Math.min(MASTERED_BOX, current + 1);
  const wait = grade === "again" ? AGAIN_MS : (INTERVAL_DAYS[box] ?? 0) * DAY_MS;
  return {
    ...item,
    wordId,
    box,
    dueAt: new Date(now + wait).toISOString(),
    lastCorrect: grade !== "again",
    lastSeenAt: new Date(now).toISOString(),
    saved: item?.saved ?? false,
    ...("grade" in input ? { lastGrade: grade } : {}),
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
) {
  const now = Date.now();
  const usable = pool.filter((round) => supportsMode(round, mode));
  const missed: LearningGameRound[] = [];
  const due: LearningGameRound[] = [];
  const fresh: LearningGameRound[] = [];
  const rest: LearningGameRound[] = [];
  for (const round of usable) {
    const item = progress.get(round.id);
    if (isMissed(item) && isDue(item, now)) missed.push(round);
    else if (isDue(item, now)) due.push(round);
    else if (!item?.lastSeenAt) fresh.push(round);
    else rest.push(round);
  }
  rest.sort((a, b) => (progress.get(a.id)?.box ?? 0) - (progress.get(b.id)?.box ?? 0));
  return [...shuffleInPlace(missed), ...shuffleInPlace(due), ...shuffleInPlace(fresh), ...rest];
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
    explanation: `${card.word} ${card.ipa}${card.partOfSpeech ? ` · ${card.partOfSpeech}` : ""} — ${card.meaningVi}. ${card.gloss}${card.exampleVi ? ` ${card.exampleVi}` : ""}`,
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

/** Entry point that starts a due-words flip session across all decks. */
export const REVIEW_TODAY_HREF = "/games/flashcard?review=today";

export const VOCAB_GRADES: VocabGrade[] = ["again", "hard", "good"];

export function isVocabGrade(value: string): value is VocabGrade {
  return (VOCAB_GRADES as string[]).includes(value);
}
