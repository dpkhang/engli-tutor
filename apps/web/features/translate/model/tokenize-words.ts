export type TextToken =
  | { kind: "word"; value: string; wordIndex: number; start: number; end: number }
  | { kind: "space"; value: string };

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?(?:-[\p{L}\p{N}]+)*/gu;

export function tokenizeWords(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  let last = 0;
  let wordIndex = 0;
  for (const match of text.matchAll(WORD)) {
    const index = match.index ?? 0;
    if (index > last) {
      tokens.push({ kind: "space", value: text.slice(last, index) });
    }
    tokens.push({
      kind: "word",
      value: match[0],
      wordIndex,
      start: index,
      end: index + match[0].length,
    });
    wordIndex += 1;
    last = index + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ kind: "space", value: text.slice(last) });
  }
  return tokens;
}

export function scheduleIdle(fn: () => void): () => void {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(fn, { timeout: 220 });
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 180);
  return () => window.clearTimeout(id);
}
