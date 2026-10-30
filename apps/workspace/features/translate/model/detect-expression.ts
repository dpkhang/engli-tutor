import { lemmaCandidates } from "./lemmatize";
import { LEXICON_BY_FIRST_WORD, type ExpressionType, type LexiconEntry } from "./phrase-lexicon";
import type { TextToken } from "./tokenize-words";

export type ExpressionSource = "lexicon" | "hyphen" | "dictionary" | "ai";

export type DetectedExpression = {
  /** Offsets in the full text. */
  start: number;
  end: number;
  /** As written, e.g. "looked up" or "turn the light off". */
  phrase: string;
  /** Dictionary form, e.g. "look up". */
  base: string;
  type: ExpressionType;
  separable: boolean;
  source: ExpressionSource;
};

export type CompoundCandidate = { start: number; end: number; phrase: string };

type WordToken = Extract<TextToken, { kind: "word" }>;
type Range = { start: number; end: number };

/** Longest lexicon entry is 6 words ("at the end of the day"); a separable object adds up to 3. */
const LOOK_BEHIND = 6;
const MAX_OBJECT_WORDS = 3;

const PRONOUN_OBJECTS = new Set([
  "it", "them", "him", "her", "me", "us", "you", "this", "that", "these", "those",
  "something", "someone", "somebody", "everything", "everyone", "anything", "anyone",
]);
const DETERMINERS = new Set([
  "the", "a", "an", "my", "your", "his", "her", "its", "our", "their", "this", "that",
  "these", "those", "some", "any", "every", "each", "all", "no",
]);
/** Words that start a new phrase, so they cannot sit inside a short object noun phrase. */
const PHRASE_BREAKERS = new Set([
  "about", "above", "across", "after", "against", "along", "around", "at", "away", "back",
  "before", "behind", "below", "between", "by", "down", "for", "from", "in", "into", "of",
  "off", "on", "onto", "out", "over", "through", "to", "toward", "towards", "under", "up",
  "with", "without", "and", "or", "but", "so", "if", "because", "while", "when", "than",
  "is", "are", "was", "were", "be", "been", "am", "will", "would", "can", "could", "should",
  "must", "may", "might", "do", "does", "did", "have", "has", "had", "not", "i", "we", "they",
  "he", "she", "it", "you", "me", "us", "them", "him", "who", "which", "what", "where",
]);

function joinedBySpace(text: string, left: WordToken, right: WordToken): boolean {
  return /^[^\S\n]+$/.test(text.slice(left.end, right.start));
}

function sentenceWords(tokens: TextToken[], range: Range | null | undefined): WordToken[] {
  return tokens.filter(
    (token): token is WordToken =>
      token.kind === "word" && (!range || (token.start >= range.start && token.end <= range.end)),
  );
}

type Match = { entry: LexiconEntry; from: number; to: number; gap: number };

/** Entry words matched contiguously starting at `from`. */
function matchContiguous(
  text: string,
  words: WordToken[],
  lemmas: Set<string>[],
  entry: LexiconEntry,
  from: number,
): Match | null {
  const to = from + entry.words.length - 1;
  if (to >= words.length) return null;
  for (let offset = 0; offset < entry.words.length; offset += 1) {
    const index = from + offset;
    if (!lemmas[index]?.has(entry.words[offset] ?? "")) return null;
    if (offset > 0 && !joinedBySpace(text, words[index - 1]!, words[index]!)) return null;
  }
  return { entry, from, to, gap: 0 };
}

function isShortObject(words: WordToken[]): boolean {
  const lower = words.map((word) => word.value.toLowerCase());
  if (lower.length === 1) {
    const only = lower[0] ?? "";
    return PRONOUN_OBJECTS.has(only) || (!PHRASE_BREAKERS.has(only) && !DETERMINERS.has(only));
  }
  const [head, ...rest] = lower;
  return (
    DETERMINERS.has(head ?? "") &&
    rest.every((word) => !PHRASE_BREAKERS.has(word) && !DETERMINERS.has(word))
  );
}

/** Two-word separable verb with a short object in between: "turn the light off". */
function matchSeparated(
  text: string,
  words: WordToken[],
  lemmas: Set<string>[],
  entry: LexiconEntry,
  from: number,
): Match | null {
  if (!entry.separable || entry.words.length !== 2) return null;
  if (!lemmas[from]?.has(entry.words[0] ?? "")) return null;
  for (let gap = 1; gap <= MAX_OBJECT_WORDS; gap += 1) {
    const to = from + gap + 1;
    if (to >= words.length) return null;
    for (let index = from + 1; index <= to; index += 1) {
      if (!joinedBySpace(text, words[index - 1]!, words[index]!)) return null;
    }
    if (!lemmas[to]?.has(entry.words[1] ?? "")) continue;
    if (isShortObject(words.slice(from + 1, to))) return { entry, from, to, gap };
  }
  return null;
}

/** More lexicon words wins ("come up with" over "come up"), then the tighter span. */
function better(a: Match, b: Match | null): boolean {
  if (!b) return true;
  if (a.entry.words.length !== b.entry.words.length) return a.entry.words.length > b.entry.words.length;
  return a.to - a.from < b.to - b.from;
}

/** Last part of nouns made from phrasal verbs: check-in, follow-up, kick-off. */
const NOUN_PARTICLES = new Set(["in", "up", "out", "off", "down", "over", "on", "back", "away"]);

function hyphenType(text: string, words: WordToken[], index: number): ExpressionType {
  const next = words[index + 1];
  const current = words[index];
  const parts = current?.value.toLowerCase().split("-") ?? [];
  if (NOUN_PARTICLES.has(parts[parts.length - 1] ?? "")) {
    return "compound_noun";
  }
  // "a well-known author" (modifies the next word) vs "send an e-mail to" (stands alone).
  if (
    current &&
    next &&
    joinedBySpace(text, current, next) &&
    !PHRASE_BREAKERS.has(next.value.toLowerCase()) &&
    !DETERMINERS.has(next.value.toLowerCase())
  ) {
    return "compound_adj";
  }
  return "compound_noun";
}

/**
 * Multi-word expression that contains the clicked word, from the hand-written lexicon or a
 * hyphenated compound. Pure and synchronous; returns null when nothing is recognised.
 */
export function detectExpression(
  text: string,
  tokens: TextToken[],
  wordIndex: number,
  sentence?: Range | null,
): DetectedExpression | null {
  const words = sentenceWords(tokens, sentence);
  const clicked = words.findIndex((word) => word.wordIndex === wordIndex);
  if (clicked < 0) return null;

  const first = Math.max(0, clicked - LOOK_BEHIND - MAX_OBJECT_WORDS);
  const last = Math.min(words.length - 1, clicked + LOOK_BEHIND + MAX_OBJECT_WORDS);
  const lemmas: Set<string>[] = [];
  for (let index = first; index <= last; index += 1) {
    lemmas[index] = lemmaCandidates(words[index]!.value);
  }

  let best: Match | null = null;
  for (let from = first; from <= clicked; from += 1) {
    for (const lemma of lemmas[from] ?? []) {
      for (const entry of LEXICON_BY_FIRST_WORD.get(lemma) ?? []) {
        for (const match of [
          matchContiguous(text, words, lemmas, entry, from),
          matchSeparated(text, words, lemmas, entry, from),
        ]) {
          if (match && match.to >= clicked && better(match, best)) best = match;
        }
      }
    }
  }

  if (best) {
    const start = words[best.from]!.start;
    const end = words[best.to]!.end;
    return {
      start,
      end,
      phrase: text.slice(start, end),
      base: best.entry.base,
      type: best.entry.type,
      separable: best.entry.separable,
      source: "lexicon",
    };
  }

  const word = words[clicked]!;
  if (word.value.includes("-")) {
    return {
      start: word.start,
      end: word.end,
      phrase: word.value,
      base: word.value.toLowerCase(),
      type: hyphenType(text, words, clicked),
      separable: false,
      source: "hyphen",
    };
  }
  return null;
}

function isCompoundPart(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    /^\p{L}{3,}$/u.test(value) &&
    !PHRASE_BREAKERS.has(lower) &&
    !DETERMINERS.has(lower) &&
    !PRONOUN_OBJECTS.has(lower)
  );
}

/**
 * Two-word neighbours of the clicked word that could be an open compound ("ice cream").
 * The caller checks them against the dictionary; nothing here is a confirmed match.
 */
export function compoundCandidates(
  text: string,
  tokens: TextToken[],
  wordIndex: number,
  sentence?: Range | null,
): CompoundCandidate[] {
  const words = sentenceWords(tokens, sentence);
  const clicked = words.findIndex((word) => word.wordIndex === wordIndex);
  const current = words[clicked];
  if (!current || !isCompoundPart(current.value)) return [];
  const out: CompoundCandidate[] = [];
  for (const [left, right] of [
    [words[clicked - 1], current],
    [current, words[clicked + 1]],
  ] as const) {
    if (!left || !right || !isCompoundPart(left.value) || !isCompoundPart(right.value)) continue;
    if (!joinedBySpace(text, left, right)) continue;
    out.push({ start: left.start, end: right.end, phrase: text.slice(left.start, right.end) });
  }
  return out;
}

function phrasePattern(phrase: string): RegExp | null {
  const parts = phrase.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const body = parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "giu");
}

/** Offsets of `phrase` inside `range` of `text` that cover the clicked word, or null. */
export function locatePhrase(
  text: string,
  phrase: string,
  clicked: Range,
  range?: Range | null,
): Range | null {
  const pattern = phrasePattern(phrase);
  if (!pattern) return null;
  const from = range?.start ?? 0;
  const scope = text.slice(from, range?.end ?? text.length);
  for (const match of scope.matchAll(pattern)) {
    const start = from + (match.index ?? 0);
    const end = start + match[0].length;
    if (start <= clicked.start && end >= clicked.end) return { start, end };
  }
  return null;
}

/**
 * The AI expression (from the sentence analysis) that contains the clicked word.
 * `sentence` is the normalised sentence text; ties go to the longest phrase.
 */
export function pickExpressionForWord<T extends { phrase: string }>(
  sentence: string,
  word: string,
  expressions: readonly T[],
): T | null {
  const wordPattern = phrasePattern(word);
  if (!wordPattern) return null;
  let best: T | null = null;
  for (const expression of expressions) {
    const pattern = phrasePattern(expression.phrase);
    if (!pattern) continue;
    const covers = [...sentence.matchAll(pattern)].some((match) => {
      wordPattern.lastIndex = 0;
      return wordPattern.test(match[0]);
    });
    if (covers && (!best || expression.phrase.length > best.phrase.length)) best = expression;
  }
  return best;
}
