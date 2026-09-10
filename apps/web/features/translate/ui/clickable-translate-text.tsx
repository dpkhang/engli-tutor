"use client";

import { startTransition, useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { cn } from "@landing-page-generator/ui";
import { textOffsetFromPoint, wordBounds } from "../model/pick-word";
import { sentenceBounds } from "../model/sentence-at";
import { scheduleIdle, tokenizeWords } from "../model/tokenize-words";
import { prefetchPassage } from "../model/translate-lookup";
import { useTranslateSession } from "../model/translate-session";

type ClickableTranslateTextProps = {
  text: string;
  className?: string;
};

const ACTIVE_WORD =
  "rounded-[0.28rem] bg-primary px-[0.18em] py-[0.06em] font-semibold text-primary-foreground ring-1 ring-primary/50";
const MATCH_WORD = "rounded-[0.28rem] bg-primary/15 px-[0.12em] py-[0.04em] text-primary";

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

  if (!open) return <>{text}</>;

  const localPick = activePick?.instanceId === instanceId ? activePick : null;
  const query = pickedWord?.toLowerCase() ?? "";

  if (!hot) {
    const sentenceStart = localPick?.sentenceStart ?? localPick?.start ?? 0;
    const sentenceEnd = localPick?.sentenceEnd ?? localPick?.end ?? 0;
    return (
      <span ref={rootRef} onClick={onPlainClick} className={cn("cursor-pointer", className)}>
        {localPick ? (
          <>
            {text.slice(0, sentenceStart)}
            <span className="rounded-sm bg-primary/8">
              {text.slice(sentenceStart, localPick.start)}
              <span className={ACTIVE_WORD}>{text.slice(localPick.start, localPick.end)}</span>
              {text.slice(localPick.end, sentenceEnd)}
            </span>
            {text.slice(sentenceEnd)}
          </>
        ) : (
          text
        )}
      </span>
    );
  }

  return (
    <span ref={rootRef} className={cn("cursor-pointer", className)}>
      {tokens.map((token, index) => {
        if (token.kind === "space") {
          return <span key={`${instanceId}-s-${index}`}>{token.value}</span>;
        }

        const tokenId = token.wordIndex;
        const active =
          localPick?.wordIndex === tokenId ||
          (localPick?.wordIndex == null &&
            localPick?.start === token.start &&
            localPick?.end === token.end);
        const sameWord = Boolean(query) && token.value.toLowerCase() === query;

        const inActiveSentence =
          localPick?.sentenceStart != null &&
          localPick.sentenceEnd != null &&
          token.start >= localPick.sentenceStart &&
          token.end <= localPick.sentenceEnd;

        return (
          <span
            key={`${instanceId}-w-${index}`}
            onClick={(event) => {
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
            }}
            className={cn(
              "inline cursor-pointer rounded-[0.28rem] px-[0.12em] py-[0.04em] transition-colors",
              "hover:bg-primary/15 hover:text-primary hover:underline hover:decoration-primary/70 hover:underline-offset-2",
              inActiveSentence && !active && "bg-primary/8",
              sameWord && !active && MATCH_WORD,
              active && ACTIVE_WORD,
            )}
          >
            {token.value}
          </span>
        );
      })}
    </span>
  );
}
