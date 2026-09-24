"use client";

import { memo, type MouseEvent, type RefObject } from "react";
import { cn } from "@engli-tutor/ui";
import { type TextToken } from "../../model/tokenize-words";
import { type TranslateActivePick } from "../../model/translate-session";

const ACTIVE_WORD =
  "rounded-[0.28rem] bg-primary px-[0.18em] py-[0.06em] font-semibold text-primary-foreground ring-1 ring-primary/50";
const MATCH_WORD = "rounded-[0.28rem] bg-primary/15 px-[0.12em] py-[0.04em] text-primary";

type WordToken = Extract<TextToken, { kind: "word" }>;

export type ClickableTranslateTextViewProps = {
  text: string;
  className?: string;
  open: boolean;
  hot: boolean;
  tokens: TextToken[];
  instanceId: string;
  rootRef: RefObject<HTMLSpanElement | null>;
  localPick: TranslateActivePick | null;
  query: string;
  onPlainClick: (event: MouseEvent<HTMLSpanElement>) => void;
  onWordClick: (token: WordToken, event: MouseEvent<HTMLSpanElement>) => void;
};

export const ClickableTranslateTextView = memo(function ClickableTranslateTextView({
  text,
  className,
  open,
  hot,
  tokens,
  instanceId,
  rootRef,
  localPick,
  query,
  onPlainClick,
  onWordClick,
}: ClickableTranslateTextViewProps) {
  if (!open) return <>{text}</>;

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
            onClick={(event) => onWordClick(token, event)}
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
});
