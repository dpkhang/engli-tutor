"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeftRight,
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
import { Button, cn } from "@landing-page-generator/ui";
import { ApiError } from "@landing-page-generator/api-client";
import { translateApi, type TranslateDirection, type TranslateResult } from "../api";

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Translation is unavailable right now. Please try again.";
}

const DIRECTION_LABEL: Record<
  TranslateDirection,
  { from: string; to: string; placeholder: string }
> = {
  "en-vi": {
    from: "English",
    to: "Vietnamese",
    placeholder: "Enter an English word, phrase, or sentence…",
  },
  "vi-en": {
    from: "Vietnamese",
    to: "English",
    placeholder: "Enter Vietnamese text to translate…",
  },
};

type FloatingTranslateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FloatingTranslate({ open, onOpenChange }: FloatingTranslateProps) {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [direction, setDirection] = useState<TranslateDirection>("en-vi");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onOpenChange, open]);

  const swapDirection = () => {
    setDirection((current) => (current === "en-vi" ? "vi-en" : "en-vi"));
    if (result?.translation) setText(result.translation);
    setResult(null);
    setError(null);
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  const copyTranslation = async () => {
    if (!result?.translation) return;
    await navigator.clipboard.writeText(result.translation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  };

  const speak = (value: string) => {
    if (!("speechSynthesis" in window) || !value.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const submit = async () => {
    const query = text.trim();
    if (!query || pending) return;
    setPending(true);
    setError(null);
    setCopied(false);
    try {
      setResult(await translateApi.lookup({ text: query, direction }));
    } catch (lookupError) {
      setError(errorMessage(lookupError));
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const labels = DIRECTION_LABEL[direction];
  const englishAudio = direction === "vi-en" ? result?.translation : result?.query;

  return (
    <div className="pointer-events-none relative">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="translate-drawer"
            className="pointer-events-auto fixed top-16 right-0 bottom-0 z-[60] flex w-full transform-gpu flex-col overflow-hidden overscroll-contain border-t border-l border-border/80 bg-card shadow-[-16px_0_40px_-28px_rgba(15,23,42,0.28)] lg:max-w-[30rem]"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: reduceMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => {
              if (open) inputRef.current?.focus({ preventScroll: true });
            }}
            role="dialog"
            aria-label="Professional English and Vietnamese translator"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Languages className="size-4" />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                    Translate{" "}
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary">
                      AI
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Context-aware translation · Usage guidance
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onOpenChange(false)}
                aria-label="Close translate"
              >
                <X className="size-4" />
              </button>
            </div>

            <form className="space-y-3 p-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl bg-muted/60 p-1">
                <span className="px-2 text-center text-xs font-semibold text-foreground">
                  {labels.from}
                </span>
                <button
                  type="button"
                  onClick={swapDirection}
                  className="grid size-8 place-items-center rounded-lg bg-card text-primary shadow-sm transition-transform hover:rotate-180"
                  aria-label="Swap translation direction"
                  title="Swap languages"
                >
                  <ArrowLeftRight className="size-3.5" />
                </button>
                <span className="px-2 text-center text-xs font-semibold text-foreground">
                  {labels.to}
                </span>
              </div>

              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setResult(null);
                    setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      void submit();
                    }
                  }}
                  rows={4}
                  maxLength={2000}
                  placeholder={labels.placeholder}
                  className="w-full resize-none rounded-xl border border-input bg-background/60 px-3 py-3 pb-8 text-sm leading-6 shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20"
                />
                <div className="absolute right-2.5 bottom-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{text.length}/2000</span>
                  {text ? (
                    <button
                      type="button"
                      onClick={clear}
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
                Press ⌘/Ctrl + Enter to translate
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
                        onClick={() => speak(englishAudio ?? "")}
                        className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-card hover:text-primary"
                        aria-label="Listen to English"
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyTranslation()}
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
                  <p className="mt-2 text-base leading-7 font-semibold text-foreground">
                    {result.translation}
                  </p>
                  {result.usageNote ? (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {result.usageNote}
                    </p>
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
                              onClick={() => void navigator.clipboard.writeText(item.text)}
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

                {result.sentence ? (
                  <section className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                        Understand the sentence
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
                      {result.word.headword}{" "}
                      <span className="font-normal text-muted-foreground">
                        {result.word.phonetic}{" "}
                        {result.word.partOfSpeech ? `· ${result.word.partOfSpeech}` : ""}
                      </span>
                    </p>
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
                        <li
                          key={tip}
                          className="flex gap-2 text-xs leading-5 text-muted-foreground"
                        >
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-[10px] text-muted-foreground">
                    {result.demo
                      ? "Demo mode · configure OpenAI for live translations"
                      : "AI can make mistakes · verify important content"}
                  </p>
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    <RotateCcw className="size-3" />
                    Translate something else
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => onOpenChange(!open)}
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
        title="Translate"
      >
        {open ? <X className="size-4" /> : <Languages className="size-4" />}
      </motion.button>
    </div>
  );
}
