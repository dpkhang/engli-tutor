import type {
  LearningGame,
  LearningGameId,
  LearningGameRound,
  LearningLevel,
  LearningQuestion,
  LearningSkill,
} from "../api/types";
import { FALLBACK_GAMES } from "./games-fallback";

export type GameCatalogItem = {
  id: LearningGameId;
  title: string;
  body: string;
  skill: LearningSkill;
  durationMinutes: number;
  howToPlay: string;
  relatedSkill: LearningSkill;
};

export const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: "speed-reply",
    title: "Speed reply",
    body: "Answer in 15 seconds to build reflexes.",
    skill: "speaking",
    durationMinutes: 3,
    howToPlay:
      "Read the prompt, then type (or speak) a short answer before the timer ends.",
    relatedSkill: "speaking",
  },
  {
    id: "listen-order",
    title: "Listen & order",
    body: "Recall the order of the points you just heard.",
    skill: "listening",
    durationMinutes: 3,
    howToPlay:
      "Listen first (no transcript). Then tap the cards in the order you heard them.",
    relatedSkill: "listening",
  },
  {
    id: "keyword-hunt",
    title: "Keyword hunt",
    body: "Listen and catch the key words.",
    skill: "listening",
    durationMinutes: 2,
    howToPlay:
      "Listen once, then pick the 5 words that were actually in the audio.",
    relatedSkill: "listening",
  },
  {
    id: "flashcard",
    title: "Vocab trainer",
    body: "Pick your level and a topic deck. Words come back on a spaced-review schedule until you know them.",
    skill: "reading",
    durationMinutes: 4,
    howToPlay:
      "Choose a level, a topic, and a mode: flip cards, match pictures, or pick the word you hear.",
    relatedSkill: "reading",
  },
];

export const MINI_GAMES = GAMES_CATALOG.map((game) => ({
  title: game.title,
  body: game.body,
  href: `/games/${game.id}`,
}));

export const GAME_THEME: Record<
  LearningGameId,
  { wash: string; badge: string }
> = {
  "speed-reply": {
    wash: "from-rose-500/15",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  },
  "listen-order": {
    wash: "from-sky-500/15",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  },
  "keyword-hunt": {
    wash: "from-cyan-500/15",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300",
  },
  flashcard: {
    wash: "from-teal-500/15",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  },
};

export function isGameId(value: string): value is LearningGameId {
  return GAMES_CATALOG.some((game) => game.id === value);
}

export function getFallbackGame(
  id: string,
  lesson?: string | null,
): LearningGame | undefined {
  const game = FALLBACK_GAMES.find((item) => item.id === id);
  if (!game) return undefined;
  if (!lesson) return game;
  const tagged = game.rounds.filter((round) =>
    round.lessonIds?.includes(lesson),
  );
  return tagged.length ? { ...game, rounds: tagged } : game;
}

export function shuffleInPlace<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) continue;
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

const LEVEL_ORDER: LearningLevel[] = ["A2", "B1", "TOEIC", "IELTS"];
const SESSION_SIZE = 5;
const SAME_LEVEL_TARGET = 4;

/**
 * Picks a session. With `level`, most rounds match that level, one stretch round comes from a
 * higher level, and the rest fill in from whatever is left. The lesson filter still wins first.
 */
export function pickGameRounds(
  rounds: LearningGameRound[],
  lesson?: string | null,
  level?: LearningLevel | null,
): LearningGameRound[] {
  const tagged = lesson
    ? rounds.filter((round) => round.lessonIds?.includes(lesson))
    : [];
  const pool = shuffleInPlace(tagged.length ? tagged : rounds);
  const rank = level ? LEVEL_ORDER.indexOf(level) : -1;
  if (rank < 0) return pool.slice(0, SESSION_SIZE);

  const same = pool.filter((round) => round.level === level);
  const higher = pool.filter(
    (round) => LEVEL_ORDER.indexOf(round.level) > rank,
  );
  const lower = pool.filter((round) => LEVEL_ORDER.indexOf(round.level) < rank);
  const core = [...same.slice(0, SAME_LEVEL_TARGET), ...higher.slice(0, 1)];
  const rest = [...same.slice(SAME_LEVEL_TARGET), ...higher.slice(1), ...lower];
  return [...core, ...rest].slice(0, SESSION_SIZE);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return (
    value
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? []
  );
}

/** Inflected forms of a keyword so "start" also accepts "started" / "starting". */
function wordForms(key: string): Set<string> {
  const forms = new Set([key]);
  if (key.length < 3) return forms;
  const last = key[key.length - 1] ?? "";
  for (const suffix of ["s", "es", "ed", "d", "ing"]) forms.add(key + suffix);
  if (key.endsWith("e")) {
    forms.add(`${key.slice(0, -1)}ing`);
  }
  if (key.endsWith("y")) {
    forms.add(`${key.slice(0, -1)}ied`);
    forms.add(`${key.slice(0, -1)}ies`);
  }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(key)) {
    forms.add(`${key}${last}ed`);
    forms.add(`${key}${last}ing`);
  }
  return forms;
}

function phraseMatches(tokens: string[], phrase: string): boolean {
  const key = tokenize(phrase);
  if (key.length === 0) return false;
  for (let start = 0; start + key.length <= tokens.length; start += 1) {
    if (
      key.every((word, offset) =>
        wordForms(word).has(tokens[start + offset] ?? ""),
      )
    )
      return true;
  }
  return false;
}

export type OpenEvaluation = {
  correct: boolean;
  /** First phrase of each keyword group that the answer covered. */
  matched: string[];
  /** First phrase of each keyword group the answer missed. */
  missing: string[];
  wordCount: number;
  overLimit: boolean;
};

export function evaluateOpen(
  answer: string,
  question: Extract<LearningQuestion, { kind: "open" }>,
  extra?: { maxWords?: number },
): OpenEvaluation {
  const text = normalize(answer);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const overLimit =
    Boolean(extra?.maxWords) && wordCount > (extra?.maxWords ?? 0);
  const groups = question.keywordGroups?.length
    ? question.keywordGroups
    : (question.keywords ?? []).map((key) => [key]);
  if (!text) {
    return {
      correct: false,
      matched: [],
      missing: groups.map((group) => group[0] ?? ""),
      wordCount: 0,
      overLimit: false,
    };
  }
  if (groups.length === 0) {
    return {
      correct: text.length >= 12 && !overLimit,
      matched: [],
      missing: [],
      wordCount,
      overLimit,
    };
  }

  const tokens = tokenize(text);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const group of groups) {
    const label = group[0] ?? "";
    if (group.some((phrase) => phraseMatches(tokens, phrase)))
      matched.push(label);
    else missing.push(label);
  }
  return {
    correct: missing.length === 0 && !overLimit,
    matched,
    missing,
    wordCount,
    overLimit,
  };
}

const BASE_PROMPT_WORDS = 10;
const WORDS_PER_EXTRA_SECOND = 3;
const MAX_EXTRA_SECONDS = 10;

/** Open rounds get extra time when the prompt is long (more to read before answering). */
export function timeLimitFor(
  round: Pick<LearningGameRound, "seconds" | "question">,
): number {
  if (round.question.kind !== "open") return round.seconds;
  const promptWords = round.question.prompt.split(/\s+/).filter(Boolean).length;
  const extra = Math.ceil(
    Math.max(0, promptWords - BASE_PROMPT_WORDS) / WORDS_PER_EXTRA_SECOND,
  );
  return round.seconds + Math.min(MAX_EXTRA_SECONDS, extra);
}

export const POINTS_PER_CORRECT = 100;
export const MAX_SPEED_BONUS = 50;

/** 100 points for a correct round, plus up to 50 for the share of time left. */
export function roundPoints(
  correct: boolean,
  secondsLeft: number,
  totalSeconds: number,
): number {
  if (!correct) return 0;
  const ratio =
    totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
  return POINTS_PER_CORRECT + Math.round(MAX_SPEED_BONUS * ratio);
}

type HuntQuestion = Extract<LearningQuestion, { kind: "hunt" }>;

export type HuntEvaluation = {
  hits: string[];
  falsePicks: string[];
  missed: string[];
  ratio: number;
};

export const HUNT_PASS_RATIO = 0.8;
export const HUNT_MAX_FALSE_PICKS = 1;

function huntTargets(
  question: HuntQuestion,
): Array<{ word: string; accept?: string[] }> {
  return question.targets?.length
    ? question.targets
    : question.correctWords.map((word) => ({ word }));
}

export function evaluateHunt(
  question: HuntQuestion,
  picked: string[],
): HuntEvaluation {
  const targets = huntTargets(question);
  const keys = targets.map(
    (target) => new Set([target.word, ...(target.accept ?? [])].map(normalize)),
  );
  const seen = new Set<string>();
  const hitIndexes = new Set<number>();
  const falsePicks: string[] = [];
  for (const pick of picked) {
    const key = normalize(String(pick));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const index = keys.findIndex(
      (set, i) => !hitIndexes.has(i) && set.has(key),
    );
    if (index >= 0) hitIndexes.add(index);
    else if (!keys.some((set) => set.has(key))) falsePicks.push(pick);
  }
  const hits = targets
    .filter((_, i) => hitIndexes.has(i))
    .map((target) => target.word);
  const missed = targets
    .filter((_, i) => !hitIndexes.has(i))
    .map((target) => target.word);
  return {
    hits,
    falsePicks,
    missed,
    ratio: targets.length ? hits.length / targets.length : 0,
  };
}

function isHuntCorrect(evaluation: HuntEvaluation): boolean {
  return (
    evaluation.hits.length >= 1 &&
    evaluation.ratio >= HUNT_PASS_RATIO &&
    evaluation.falsePicks.length <= HUNT_MAX_FALSE_PICKS
  );
}

function speedBonus(secondsLeft: number, totalSeconds: number): number {
  const ratio =
    totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
  return Math.round(MAX_SPEED_BONUS * ratio);
}

export function huntPoints(
  evaluation: HuntEvaluation,
  targetCount: number,
  secondsLeft: number,
  totalSeconds: number,
): number {
  if (targetCount <= 0) return 0;
  const net = Math.max(
    0,
    evaluation.hits.length - evaluation.falsePicks.length,
  );
  const base = Math.round((net / targetCount) * POINTS_PER_CORRECT);
  return isHuntCorrect(evaluation)
    ? base + speedBonus(secondsLeft, totalSeconds)
    : base;
}

function parseHuntPicks(value: string): string[] | null {
  try {
    const picked = JSON.parse(value) as unknown;
    return Array.isArray(picked) ? picked.map(String) : null;
  } catch {
    return null;
  }
}

export function pointsForRound(
  question: LearningQuestion,
  value: string,
  correct: boolean,
  secondsLeft: number,
  totalSeconds: number,
): number {
  if (question.kind === "hunt") {
    const picked = parseHuntPicks(value);
    if (!picked) return 0;
    return huntPoints(
      evaluateHunt(question, picked),
      huntTargets(question).length,
      secondsLeft,
      totalSeconds,
    );
  }
  return roundPoints(correct, secondsLeft, totalSeconds);
}

export function longestStreak(scores: boolean[]): number {
  let best = 0;
  let run = 0;
  for (const score of scores) {
    run = score ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

function scoreOpen(
  answer: string,
  question: Extract<LearningQuestion, { kind: "open" }>,
  maxWords?: number,
) {
  return evaluateOpen(answer, question, { maxWords }).correct;
}

export function scoreGameRound(
  question: LearningQuestion,
  value: string,
  extra?: { maxWords?: number },
): boolean {
  if (question.kind === "choice" || question.kind === "fix") {
    return Number(value) === question.correctIndex;
  }
  if (question.kind === "open") {
    return scoreOpen(value, question, extra?.maxWords);
  }
  if (question.kind === "order") {
    try {
      const order = JSON.parse(value) as number[];
      return (
        Array.isArray(order) &&
        order.length === question.correctOrder.length &&
        order.every((item, index) => item === question.correctOrder[index])
      );
    } catch {
      return false;
    }
  }
  if (question.kind === "match") {
    try {
      const mapping = JSON.parse(value) as number[];
      return (
        Array.isArray(mapping) &&
        mapping.length === question.pairs.length &&
        mapping.every((rightIndex, leftIndex) => rightIndex === leftIndex)
      );
    } catch {
      return false;
    }
  }
  if (question.kind === "hunt") {
    const selected = parseHuntPicks(value);
    return selected ? isHuntCorrect(evaluateHunt(question, selected)) : false;
  }
  if (question.kind === "spell") {
    return (
      normalize(value).replace(/\s+/g, "") ===
      question.answer.trim().toLowerCase()
    );
  }
  if (question.kind === "flash") {
    return value === "know" || value === "good" || value === "hard";
  }
  return false;
}

export function sampleAnswerFor(
  question: LearningQuestion,
): string | undefined {
  if (question.kind === "open") return question.sampleAnswer;
  if (question.kind === "choice" || question.kind === "fix") {
    return question.options[question.correctIndex];
  }
  if (question.kind === "order") {
    return question.items.join(" → ");
  }
  if (question.kind === "match") {
    return question.pairs
      .map((pair) => `${pair.left} → ${pair.right}`)
      .join(" · ");
  }
  if (question.kind === "hunt") {
    return (
      question.targets?.length
        ? question.targets.map((target) => target.word)
        : question.correctWords
    ).join(", ");
  }
  if (question.kind === "spell") {
    return question.answer.toUpperCase();
  }
  if (question.kind === "flash") {
    return `${question.ipa} · ${question.meaningVi}`;
  }
  return undefined;
}
