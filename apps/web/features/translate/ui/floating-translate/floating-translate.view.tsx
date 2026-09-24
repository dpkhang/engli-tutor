"use client";

import { memo, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { motion } from "motion/react";
import {
  Check,
  Copy,
  Languages,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { Button, cn } from "@engli-tutor/ui";
import { type TranslateResult } from "../../api";

function highlightWordInSentence(sentence: string, word: string) {
  const index = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (index < 0) return sentence;
  return (
    <>
      {sentence.slice(0, index)}
      <span className="rounded-sm bg-primary px-[0.15em] font-semibold text-primary-foreground">
        {sentence.slice(index, index + word.length)}
      </span>
      {sentence.slice(index + word.length)}
    </>
  );
}

export type FloatingTranslateViewProps = {
  open: boolean;
  reduceMotion: boolean;
  text: string;
  pending: boolean;
  error: string | null;
  result: TranslateResult | null;
  copied: boolean;
  contextPending: boolean;
  pickedWord: string | null;
  activeSentence: string | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onToggle: () => void;
  onSubmit: (event: FormEvent) => void;
  onTextChange: (value: string) => void;
  onComposerKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  onSpeakEnglish: () => void;
  onCopyTranslation: () => void;
  onCopyText: (value: string) => void;
};

export const FloatingTranslateView = memo(function FloatingTranslateView({
  open,
  reduceMotion,
  text,
  pending,
  error,
  result,
  copied,
  contextPending,
  pickedWord,
  activeSentence,
  inputRef,
  onClose,
  onToggle,
  onSubmit,
  onTextChange,
  onComposerKeyDown,
  onClear,
  onSpeakEnglish,
  onCopyTranslation,
  onCopyText,
}: FloatingTranslateViewProps) {
  return (
    <div className="pointer-events-none relative">
      <div
        className={cn(
          "fixed right-0 bottom-0 z-60 flex h-[58dvh] w-full flex-col overflow-hidden overscroll-contain border-t border-border/80 bg-card shadow-[0_-16px_40px_-28px_rgba(15,23,42,0.32)] lg:top-16 lg:h-auto lg:max-w-120 lg:border-l lg:shadow-[-16px_0_40px_-28px_rgba(15,23,42,0.28)]",
          "transform-gpu will-change-transform",
          reduceMotion
            ? ""
            : "transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open
            ? "pointer-events-auto translate-y-0 lg:translate-x-0"
            : "pointer-events-none translate-y-full lg:translate-x-full lg:translate-y-0",
        )}
        role="dialog"
        aria-hidden={!open}
        aria-label="Professional English and Vietnamese translator"
        inert={!open ? true : undefined}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-linear-to-r from-primary/10 to-transparent px-3 py-2.5 sm:px-4 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:size-9">
              <Languages className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                Translate{" "}
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary">
                  AI
                </span>
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Context-aware translation · Usage guidance
              </p>
            </div>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
            aria-label="Close translate"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="shrink-0 space-y-2.5 p-3 sm:space-y-3 sm:p-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 items-center gap-2 rounded-xl bg-muted/60 p-1">
            <span className="px-2 text-center text-xs font-semibold text-foreground">English</span>
            <span className="px-2 text-center text-xs font-semibold text-foreground">
              Vietnamese
            </span>
          </div>

          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              onKeyDown={onComposerKeyDown}
              rows={3}
              maxLength={2000}
              placeholder="Enter an English word, phrase, or sentence…"
              className="max-h-28 w-full resize-none rounded-xl border border-input bg-background/60 px-3 py-2.5 pb-7 text-sm leading-5 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20 sm:max-h-none sm:py-3 sm:pb-8 sm:leading-6"
            />
            <div className="absolute right-2.5 bottom-2 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{text.length}/2000</span>
              {text ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded px-1.5 py-0.5 font-medium hover:bg-muted hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          {error ? (
            <p
              className="rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending || !text.trim()}
            className="h-10 w-full rounded-full"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Analysing context…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Translate with context
              </>
            )}
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            Click a word in the passage to look it up · ⌘/Ctrl + Enter
          </p>
        </form>

        {pending ? (
          <div className="space-y-3 border-t border-border/70 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-14 animate-pulse rounded-xl bg-muted/70" />
          </div>
        ) : null}

        {result && !pending ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-border/70 px-4 py-4">
            <section className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
                  Suggested translation
                </p>
                <div className="flex">
                  <button
                    type="button"
                    onClick={onSpeakEnglish}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                    aria-label="Listen to English"
                  >
                    <Volume2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onCopyTranslation}
                    className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                    aria-label="Copy translation"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold tracking-tight text-foreground">
                {result.word?.headword || result.query}
              </p>
              {result.word?.phonetic ? (
                <p className="mt-1 font-mono text-[13px] leading-5 text-muted-foreground">
                  {result.word.phonetic}
                </p>
              ) : null}
              <p className="mt-2 text-base leading-7 font-semibold text-foreground">
                {result.translation}
              </p>
              {result.usageNote ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{result.usageNote}</p>
              ) : null}
            </section>

            {result.alternatives.length ? (
              <section>
                <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  Alternative expressions
                </p>
                <div className="mt-2 space-y-2">
                  {result.alternatives.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-xl border border-border/70 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-primary uppercase">
                            {item.label}
                          </span>
                          <p className="mt-0.5 text-sm font-medium leading-5">{item.text}</p>
                          {item.note ? (
                            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => onCopyText(item.text)}
                          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSentence &&
            pickedWord &&
            activeSentence.trim().toLowerCase() !== pickedWord.trim().toLowerCase() ? (
              <section className="space-y-2">
                <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                  In this sentence
                </p>
                <p className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-xs leading-5 text-foreground">
                  “{highlightWordInSentence(activeSentence.trim(), pickedWord.trim())}”
                </p>
                {contextPending ? (
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-12 animate-pulse rounded-xl bg-muted/70" />
                  </div>
                ) : null}
              </section>
            ) : null}

            {result.sentence ? (
              <section className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Meaning in this sentence
                  </p>
                  <p className="mt-1.5 text-xs leading-5">{result.sentence.meaningVi}</p>
                </div>
                {result.sentence.breakdown ? (
                  <p className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                    {result.sentence.breakdown}
                  </p>
                ) : null}
                {result.sentence.chunks.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.sentence.chunks.map((chunk, index) => (
                      <span
                        key={`${chunk.phrase}-${index}`}
                        className="group relative rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
                      >
                        <span className="font-medium">{chunk.phrase}</span>
                        <span className="text-muted-foreground"> · {chunk.meaningVi}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                {result.sentence.moreNatural &&
                result.sentence.moreNatural !== result.translation ? (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/8 px-3 py-2.5">
                    <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                      More natural phrasing
                    </p>
                    <p className="mt-1 text-xs leading-5">{result.sentence.moreNatural}</p>
                  </div>
                ) : null}
                {result.sentence.tone ? (
                  <p className="text-[11px] text-muted-foreground">
                    Tone:{" "}
                    <span className="font-medium text-foreground">{result.sentence.tone}</span>
                  </p>
                ) : null}
              </section>
            ) : null}

            {result.word ? (
              <section>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Keyword in context
                  </p>
                  {result.word.level ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {result.word.level}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {result.word.headword}
                  {result.word.partOfSpeech ? (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · {result.word.partOfSpeech}
                    </span>
                  ) : null}
                </p>
                {result.word.phonetic ? (
                  <p className="mt-1 font-mono text-[13px] leading-5 text-muted-foreground">
                    {result.word.phonetic}
                  </p>
                ) : null}
                <div className="mt-2 space-y-2">
                  {result.word.senses.map((sense, index) => (
                    <div key={index} className="text-xs leading-5">
                      <p>
                        <span className="mr-1 font-semibold text-primary">{index + 1}.</span>
                        {sense.meaningVi}
                      </p>
                      {sense.example ? (
                        <p className="pl-4 text-muted-foreground">“{sense.example}”</p>
                      ) : null}
                    </div>
                  ))}
                </div>
                {result.word.collocations.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.word.collocations.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {result.tips.length ? (
              <section className="rounded-xl bg-amber-500/8 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
                  <Lightbulb className="size-3.5" />
                  Remember
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.tips.map((tip) => (
                    <li key={tip} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                      <span className="text-amber-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground">
                {result.source === "dictionary"
                  ? "From dictionary · no AI used"
                  : result.demo
                    ? "Demo mode · configure OpenAI for live translations"
                    : "Saved or AI result · verify important content"}
              </p>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Translate something else
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <motion.button
        type="button"
        onClick={onToggle}
        className={cn(
          "pointer-events-auto grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors",
          open
            ? "border-primary/50 bg-primary/10 text-primary"
            : "hover:border-primary/40 hover:text-primary",
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label={open ? "Close translate" : "Open translate"}
        title="Translate (⌘E)"
      >
        {open ? <X className="size-4" /> : <Languages className="size-4" />}
      </motion.button>
    </div>
  );
});
