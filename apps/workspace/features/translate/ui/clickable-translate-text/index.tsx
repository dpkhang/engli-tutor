"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { compoundCandidates, detectExpression, locatePhrase } from "../../model/detect-expression";
import { textOffsetFromPoint, wordBounds } from "../../model/pick-word";
import { sentenceBounds } from "../../model/sentence-at";
import { scheduleIdle, tokenizeWords, type TextToken } from "../../model/tokenize-words";
import { prefetchPassage } from "../../model/translate-lookup";
import { useTranslateSession, type TranslateActivePick } from "../../model/translate-session";
import { ClickableTranslateTextView } from "./clickable-translate-text.view";

type ClickableTranslateTextProps = {
  text: string;
  className?: string;
};

type WordToken = Extract<TextToken, { kind: "word" }>;

export function ClickableTranslateText({ text, className }: ClickableTranslateTextProps) {
  const instanceId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const { open, pushWord, activePick, pickedWord } = useTranslateSession();
  const [hot, setHot] = useState(false);
  const tokens = useMemo(() => tokenizeWords(text), [text]);

  useEffect(() => {
    if (!open) {
      setHot(false);
      return;
    }
    void prefetchPassage(text, "en-vi");
    return scheduleIdle(() => startTransition(() => setHot(true)));
  }, [open, text]);

  const pushPick = useCallback(
    (word: string, start: number, end: number, wordIndex: number | null) => {
      const sentence = sentenceBounds(text, start);
      const pick: TranslateActivePick = {
        instanceId,
        start,
        end,
        wordIndex,
        sentence: sentence?.sentence ?? null,
        sentenceStart: sentence?.start,
        sentenceEnd: sentence?.end,
      };
      if (wordIndex != null) {
        pick.expression = detectExpression(text, tokens, wordIndex, sentence);
        if (!pick.expression) {
          pick.compoundCandidates = compoundCandidates(text, tokens, wordIndex, sentence);
        }
      }
      pushWord(word, pick);
    },
    [instanceId, pushWord, text, tokens],
  );

  const pickAtOffset = useCallback(
    (offset: number) => {
      const bounds = wordBounds(text, offset);
      if (!bounds) return;
      const token = tokens.find(
        (item) => item.kind === "word" && item.start === bounds.start && item.end === bounds.end,
      );
      pushPick(
        bounds.word,
        bounds.start,
        bounds.end,
        token && token.kind === "word" ? token.wordIndex : null,
      );
    },
    [pushPick, text, tokens],
  );

  const onPlainClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      const root = rootRef.current;
      if (!root) return;
      const offset = textOffsetFromPoint(root, event.clientX, event.clientY);
      if (offset == null) return;
      event.preventDefault();
      event.stopPropagation();
      pickAtOffset(offset);
    },
    [pickAtOffset],
  );

  const onWordClick = useCallback(
    (token: WordToken, event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      pushPick(token.value, token.start, token.end, token.wordIndex);
    },
    [pushPick],
  );

  const localPick = activePick?.instanceId === instanceId ? activePick : null;
  const query = pickedWord?.toLowerCase() ?? "";

  // Expressions from the AI only carry the phrase; find where it sits around the clicked word.
  const expressionRange = useMemo(() => {
    const expression = localPick?.expression;
    if (!localPick || !expression) return null;
    if (expression.start != null && expression.end != null) {
      return { start: expression.start, end: expression.end };
    }
    const sentence =
      localPick.sentenceStart != null && localPick.sentenceEnd != null
        ? { start: localPick.sentenceStart, end: localPick.sentenceEnd }
        : null;
    return locatePhrase(text, expression.phrase, localPick, sentence);
  }, [localPick, text]);

  return (
    <ClickableTranslateTextView
      text={text}
      className={className}
      open={open}
      hot={hot}
      tokens={tokens}
      instanceId={instanceId}
      rootRef={rootRef}
      localPick={localPick}
      expressionRange={expressionRange}
      query={query}
      onPlainClick={onPlainClick}
      onWordClick={onWordClick}
    />
  );
}
