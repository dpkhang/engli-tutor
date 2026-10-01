const WORD_CHAR = /[\p{L}\p{N}'’\-]/u;

export function rangeFromPoint(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof doc.caretRangeFromPoint === "function") {
    return doc.caretRangeFromPoint(x, y);
  }
  const position = doc.caretPositionFromPoint?.(x, y);
  if (!position?.offsetNode) return null;
  const range = document.createRange();
  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);
  return range;
}

export function wordBounds(text: string, offset: number): { word: string; start: number; end: number } | null {
  if (!text || offset < 0 || offset > text.length) return null;
  let start = Math.min(offset, text.length);
  if (start === text.length || !WORD_CHAR.test(text[start] ?? "")) {
    if (start > 0 && WORD_CHAR.test(text[start - 1] ?? "")) start -= 1;
    else return null;
  }
  let end = start;
  while (start > 0 && WORD_CHAR.test(text[start - 1] ?? "")) start -= 1;
  while (end < text.length && WORD_CHAR.test(text[end] ?? "")) end += 1;
  while (start < end && /^['’\-]$/.test(text[start] ?? "")) start += 1;
  while (end > start && /^['’\-]$/.test(text[end - 1] ?? "")) end -= 1;
  const word = text.slice(start, end);
  if (word.length < 1 || word.length > 80) return null;
  return { word, start, end };
}

export function textOffsetFromPoint(root: HTMLElement, x: number, y: number): number | null {
  const range = rangeFromPoint(x, y);
  if (!range) return null;

  let node: Node | null = range.startContainer;
  let offset = range.startOffset;

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const child = el.childNodes[Math.min(offset, Math.max(0, el.childNodes.length - 1))] ?? el;
    if (child.nodeType === Node.TEXT_NODE) {
      node = child;
      offset = Math.min(offset, child.textContent?.length ?? 0);
    } else {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      node = walker.nextNode();
      offset = 0;
    }
  }

  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  if (!root.contains(node) && node !== root) return null;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let current: Node | null = walker.nextNode();
  while (current) {
    const length = current.textContent?.length ?? 0;
    if (current === node) return total + Math.min(offset, length);
    total += length;
    current = walker.nextNode();
  }
  return null;
}
