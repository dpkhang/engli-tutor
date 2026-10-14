import { translateApi, type TranslateDirection, type TranslateResult } from "../api/translate-api";
import {
  cacheKey,
  getCachedLookup,
  putCachedLookup,
  setInflight,
  takeInflight,
} from "./translate-cache";
import { uniquePassageWords } from "./prefetch-words";

function resultFromBatch(results: Record<string, TranslateResult>, word: string) {
  return results[word] ?? results[word.toLowerCase()] ?? null;
}

export async function lookupTranslation(input: {
  text: string;
  direction: TranslateDirection;
  focusWord?: string;
}): Promise<TranslateResult> {
  const query = input.text.trim();
  const focusWord = input.focusWord?.trim() ?? "";
  const cached = getCachedLookup(input.direction, query, focusWord);
  if (cached) return cached;

  const key = cacheKey(input.direction, query, focusWord);
  const pending = takeInflight(key);
  if (pending) {
    const fromPending = await pending;
    if (fromPending) return fromPending;
  }

  const request = translateApi
    .lookup({ text: query, direction: input.direction, focusWord: focusWord || undefined })
    .then((result) => {
      putCachedLookup(input.direction, query, result, focusWord);
      return result;
    });
  setInflight(key, request);
  return request;
}

export async function prefetchPassage(text: string, direction: TranslateDirection) {
  const words = uniquePassageWords(text).filter((word) => !getCachedLookup(direction, word));
  if (words.length === 0) return;

  const batch = translateApi
    .prefetch({ direction, words })
    .then(({ results }) => results)
    .catch(() => ({}) as Record<string, TranslateResult>);

  for (const word of words) {
    const request = batch.then((results) => {
      const result = resultFromBatch(results, word);
      if (result) putCachedLookup(direction, word, result);
      return result;
    });
    setInflight(cacheKey(direction, word), request);
  }

  await batch;
}
