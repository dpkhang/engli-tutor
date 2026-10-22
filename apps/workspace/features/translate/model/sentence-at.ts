const BOUNDARY = /[.!?…。]/;
const LETTER = /\p{L}/u;
const DIGIT = /\d/;

/** Dotted words that end with "." without ending the sentence (compared lowercase, without the final dot). */
const ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "vs",
  "e.g",
  "i.e",
  "a.m",
  "p.m",
  "etc",
]);

export type SentenceRange = {
  start: number;
  end: number;
  sentence: string;
};

/** True when the character at `index` closes a sentence. */
function isBoundaryAt(text: string, index: number): boolean {
  const char = text[index] ?? "";
  if (!BOUNDARY.test(char)) return false;
  if (char !== ".") return true;

  const previous = text[index - 1] ?? "";
  const next = text[index + 1] ?? "";

  // 3.5, 1.200
  if (DIGIT.test(previous) && DIGIT.test(next)) return false;
  // Letters on both sides with no space: e.g, a.m, U.S
  if (LETTER.test(previous) && LETTER.test(next)) return false;

  const word = /([\p{L}.]+)$/u.exec(text.slice(Math.max(0, index - 12), index))?.[1]?.toLowerCase();
  if (!word || !ABBREVIATIONS.has(word)) return true;

  // "etc." often really ends the sentence: only treat it as one when a capital follows.
  if (word === "etc") {
    const following = /^\s*(\S)/.exec(text.slice(index + 1))?.[1];
    return !following || /\p{Lu}/u.test(following);
  }
  return false;
}

export function sentenceBounds(text: string, offset: number): SentenceRange | null {
  if (!text) return null;
  const pos = Math.min(Math.max(offset, 0), text.length);
  let start = pos;
  while (start > 0) {
    const previous = text[start - 1] ?? "";
    if (isBoundaryAt(text, start - 1) || previous === "\n") break;
    start -= 1;
  }
  while (start < pos && /[\s"'“”‘’]/.test(text[start] ?? "")) start += 1;

  let end = pos;
  while (end < text.length) {
    const current = text[end] ?? "";
    if (isBoundaryAt(text, end)) {
      end += 1;
      break;
    }
    if (current === "\n") break;
    end += 1;
  }

  const sentence = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (!sentence) return null;
  return { start, end, sentence };
}
