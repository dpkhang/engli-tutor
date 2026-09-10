import { tokenizeWords } from "./tokenize-words";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "he",
  "her",
  "his",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "she",
  "that",
  "the",
  "this",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
]);

export function uniquePassageWords(text: string, limit = 20): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const token of tokenizeWords(text)) {
    if (token.kind !== "word") continue;
    const value = token.value.trim();
    const key = value.toLowerCase();
    if (value.length < 2 || STOP_WORDS.has(key) || /^\d+$/.test(value) || seen.has(key)) continue;
    seen.add(key);
    words.push(value);
  }
  return words
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, limit);
}
