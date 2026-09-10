const BOUNDARY = /[.!?…。]/;

export type SentenceRange = {
  start: number;
  end: number;
  sentence: string;
};

export function sentenceBounds(text: string, offset: number): SentenceRange | null {
  if (!text) return null;
  const pos = Math.min(Math.max(offset, 0), text.length);
  let start = pos;
  while (start > 0) {
    const previous = text[start - 1] ?? "";
    if (BOUNDARY.test(previous) || previous === "\n") break;
    start -= 1;
  }
  while (start < pos && /[\s"'“”‘’]/.test(text[start] ?? "")) start += 1;

  let end = pos;
  while (end < text.length) {
    const current = text[end] ?? "";
    if (BOUNDARY.test(current)) {
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
