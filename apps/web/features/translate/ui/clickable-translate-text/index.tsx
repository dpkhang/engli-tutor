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
import { textOffsetFromPoint, wordBounds } from "../../model/pick-word";
import { sentenceBounds } from "../../model/sentence-at";
import { scheduleIdle, tokenizeWords, type TextToken } from "../../model/tokenize-words";
import { prefetchPassage } from "../../model/translate-lookup";
import { useTranslateSession } from "../../model/translate-session";
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

  const pickAtOffset = useCallback(
    (offset: number) => {
      const bounds = wordBounds(text, offset);
      if (!bounds) return;
      const token = tokens.find(
        (item) => item.kind === "word" && item.start === bounds.start && item.end === bounds.end,
      );
      const sentence = sentenceBounds(text, bounds.start);
      pushWord(bounds.word, {
        instanceId,
        start: bounds.start,
        end: bounds.end,
        wordIndex: token && token.kind === "word" ? token.wordIndex : null,
        sentence: sentence?.sentence ?? null,
        sentenceStart: sentence?.start,
        sentenceEnd: sentence?.end,
      });
    },
    [instanceId, pushWord, text, tokens],
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
      const sentence = sentenceBounds(text, token.start);
      pushWord(token.value, {
        instanceId,
        start: token.start,
        end: token.end,
        wordIndex: token.wordIndex,
        sentence: sentence?.sentence ?? null,
        sentenceStart: sentence?.start,
        sentenceEnd: sentence?.end,
      });
    },
    [instanceId, pushWord, text],
  );

  const localPick = activePick?.instanceId === instanceId ? activePick : null;
  const query = pickedWord?.toLowerCase() ?? "";

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
      query={query}
      onPlainClick={onPlainClick}
      onWordClick={onWordClick}
    />
  );
}
