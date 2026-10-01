import type {
  LearningGame,
  LearningGameId,
  LearningGameRound,
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
    howToPlay: "Read the prompt, then type (or speak) a short answer before the timer ends.",
    relatedSkill: "speaking",
  },
  {
    id: "listen-order",
    title: "Listen & order",
    body: "Recall the order of the points you just heard.",
    skill: "listening",
    durationMinutes: 3,
    howToPlay: "Listen first (no transcript). Then tap the cards in the order you heard them.",
    relatedSkill: "listening",
  },
  {
    id: "keyword-hunt",
    title: "Keyword hunt",
    body: "Listen and catch the key words.",
    skill: "listening",
    durationMinutes: 2,
    howToPlay: "Listen once, then pick the 5 words that were actually in the audio.",
    relatedSkill: "listening",
  },
  {
    id: "flashcard",
    title: "Vocab trainer",
    body: "Pick your level and a topic deck. Words come back on a spaced-review schedule until you know them.",
    skill: "reading",
    durationMinutes: 4,
    howToPlay: "Choose a level, a topic, and a mode: flip cards, match pictures, or pick the word you hear.",
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

export function getFallbackGame(id: string, lesson?: string | null): LearningGame | undefined {
  const game = FALLBACK_GAMES.find((item) => item.id === id);
  if (!game) return undefined;
  if (!lesson) return game;
  const tagged = game.rounds.filter((round) => round.lessonIds?.includes(lesson));
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

export function pickGameRounds(rounds: LearningGameRound[], lesson?: string | null): LearningGameRound[] {
  const tagged = lesson ? rounds.filter((round) => round.lessonIds?.includes(lesson)) : [];
  const pool = tagged.length ? tagged : rounds;
  return shuffleInPlace(pool).slice(0, 5);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreOpen(answer: string, question: Extract<LearningQuestion, { kind: "open" }>, maxWords?: number) {
  const text = normalize(answer);
  if (!text) return false;
  const keys = question.keywords ?? [];
  const keysOk = keys.length === 0 ? text.length >= 12 : keys.every((key) => text.includes(key.toLowerCase()));
  if (!keysOk) return false;
  if (!maxWords) return true;
  return text.split(/\s+/).filter(Boolean).length <= maxWords;
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
    try {
      const selected = JSON.parse(value) as string[];
      if (!Array.isArray(selected) || selected.length !== question.correctWords.length) return false;
      const wanted = new Set(question.correctWords.map((word) => word.toLowerCase()));
      return selected.every((word) => wanted.has(word.toLowerCase()));
    } catch {
      return false;
    }
  }
  if (question.kind === "spell") {
    return normalize(value).replace(/\s+/g, "") === question.answer.trim().toLowerCase();
  }
  if (question.kind === "flash") {
    return value === "know";
  }
  return false;
}

export function sampleAnswerFor(question: LearningQuestion): string | undefined {
  if (question.kind === "open") return question.sampleAnswer;
  if (question.kind === "choice" || question.kind === "fix") {
    return question.options[question.correctIndex];
  }
  if (question.kind === "order") {
    return question.items.join(" → ");
  }
  if (question.kind === "match") {
    return question.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(" · ");
  }
  if (question.kind === "hunt") {
    return question.correctWords.join(", ");
  }
  if (question.kind === "spell") {
    return question.answer.toUpperCase();
  }
  if (question.kind === "flash") {
    return `${question.ipa} · ${question.meaningVi}`;
  }
  return undefined;
}
