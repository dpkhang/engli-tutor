"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, Check, ChevronLeft, Gamepad2, House, Lightbulb, Mic2, RotateCcw, Volume2, X } from "lucide-react";
import { Button, SegmentedSwitch, cn } from "@engli-tutor/ui";
import { DataLoadingState, NotFoundPage } from "@/features/layout";
import { ClickableTranslateText } from "@/features/translate";
import { useAiSpeech } from "@/features/speaking-lab/hooks/use-ai-speech";
import { useVoiceInput } from "@/features/tutor-chat/hooks/use-voice-input";
import { sampleAnswerFor, scoreGameRound, shuffleInPlace } from "../../model/games";
import type {
  LearningGame,
  LearningGameDeck,
  LearningGameRound,
  LearningLevel,
  LearningQuestion,
} from "../../api/types";
import type { LessonPack } from "../../model/curriculum";
import { VOCAB_MODES, type VocabMode } from "../../model/vocab-trainer";

export type GamePlayPhase = "intro" | "playing" | "results";

export type FlashcardDeckOption = LearningGameDeck & {
  reviewCount: number;
  masteredCount: number;
  pictureCount: number;
};

function DeckPicker({
  levels,
  level,
  decks,
  deckId,
  mode,
  onPickLevel,
  onPickDeck,
  onPickMode,
  onReviewDeck,
}: {
  levels: LearningLevel[];
  level: LearningLevel | null;
  decks: FlashcardDeckOption[];
  deckId: string | null;
  mode: VocabMode;
  onPickLevel: (level: LearningLevel) => void;
  onPickDeck: (deckId: string) => void;
  onPickMode: (mode: VocabMode) => void;
  onReviewDeck: (deckId: string) => void;
}) {
  const activeDeck = decks.find((deck) => deck.id === deckId);
  return (
    <div className="space-y-4">
      {level ? (
        <SegmentedSwitch
          value={level}
          onChange={onPickLevel}
          ariaLabel="Flashcard level"
          className="max-w-md"
          options={levels.map((item) => ({ id: item, label: item }))}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {decks.map((deck) => {
          const active = deck.id === deckId;
          return (
            <div
              key={deck.id}
              className={cn(
                "flex flex-col rounded-2xl border transition-colors",
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/70 hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPickDeck(deck.id)}
                className="flex-1 px-4 py-3 text-left"
              >
                <span className="block text-sm font-semibold text-foreground">{deck.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {deck.cardCount} words
                  {deck.masteredCount > 0 ? ` · ${deck.masteredCount} mastered` : ""}
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.round((deck.masteredCount / Math.max(1, deck.cardCount)) * 100)}%` }}
                  />
                </span>
              </button>
              {deck.reviewCount > 0 ? (
                <button
                  type="button"
                  onClick={() => onReviewDeck(deck.id)}
                  className="mx-4 mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  <RotateCcw className="size-3.5" />
                  Review now ({deck.reviewCount})
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Mode</p>
        <SegmentedSwitch
          value={mode}
          onChange={onPickMode}
          ariaLabel="Practice mode"
          className="max-w-md"
          options={VOCAB_MODES.map((item) => ({ id: item.id, label: item.label }))}
        />
        {mode === "picture" && activeDeck && activeDeck.pictureCount < activeDeck.cardCount ? (
          <p className="text-xs text-muted-foreground">
            {activeDeck.pictureCount
              ? `${activeDeck.pictureCount} of ${activeDeck.cardCount} words have pictures yet.`
              : "No pictures in this deck yet — it will play as flip cards."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function explanationOf(question: LearningQuestion) {
  return question.explanation;
}

function TimerRing({ seconds, total }: { seconds: number; total: number }) {
  const ratio = total > 0 ? seconds / total : 0;
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
      <span
        className="size-2 rounded-full bg-amber-300"
        style={{ opacity: ratio < 0.2 ? 1 : 0.6 }}
      />
      {seconds}s
    </div>
  );
}

function ChoiceRound({
  question,
  value,
  locked,
  onChange,
}: {
  question: Extract<LearningQuestion, { kind: "choice" | "fix" }>;
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {question.options.map((option, optionIndex) => {
        const selected = value === String(optionIndex);
        const isCorrect = optionIndex === question.correctIndex;
        return (
          <button
            key={option}
            type="button"
            disabled={locked}
            onClick={() => onChange(String(optionIndex))}
            className={cn(
              "flex w-full rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
              selected && !locked && "border-primary bg-primary/8 ring-2 ring-primary/10",
              locked && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
              locked && selected && !isCorrect && "border-destructive/50 bg-destructive/5",
              !selected && !locked && "border-border hover:border-primary/50 hover:bg-primary/5",
              locked && "cursor-default",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function OpenRound({
  value,
  locked,
  placeholder,
  allowMic,
  onChange,
}: {
  value: string;
  locked: boolean;
  placeholder: string;
  allowMic: boolean;
  onChange: (value: string) => void;
}) {
  const voice = useVoiceInput((text) => onChange(text));
  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        value={value}
        disabled={locked}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/40 disabled:opacity-70"
      />
      {allowMic && !locked ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!voice.supported}
            onClick={() => void voice.toggle()}
          >
            <Mic2 className="size-4" />
            {voice.recording ? "Stop" : "Speak instead"}
          </Button>
          {voice.interim ? (
            <span className="text-xs text-muted-foreground">{voice.interim}</span>
          ) : null}
          {voice.error ? <span className="text-xs text-destructive">{voice.error}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function OrderRound({
  items,
  value,
  locked,
  onChange,
}: {
  items: Array<{ originalIndex: number; text: string }>;
  value: number[];
  locked: boolean;
  onChange: (value: number[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Tap in the order you heard. Tap again to undo.
      </p>
      <div className="space-y-2">
        {items.map((item) => {
          const position = value.indexOf(item.originalIndex);
          const picked = position >= 0;
          return (
            <button
              key={item.originalIndex}
              type="button"
              disabled={locked}
              onClick={() => {
                if (locked) return;
                if (picked) onChange(value.filter((entry) => entry !== item.originalIndex));
                else onChange([...value, item.originalIndex]);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                picked && !locked && "border-primary bg-primary/8",
                locked && picked && "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
                !picked && !locked && "border-border hover:border-primary/50 hover:bg-primary/5",
                locked && "cursor-default",
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
                {picked ? position + 1 : "·"}
              </span>
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchRound({
  pairs,
  rights,
  mapping,
  locked,
  onChange,
}: {
  pairs: Array<{ left: string; right: string }>;
  rights: Array<{ originalIndex: number; text: string }>;
  mapping: Array<number | null>;
  locked: boolean;
  onChange: (value: Array<number | null>) => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const usedRights = new Set(mapping.filter((item): item is number => item !== null));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        {pairs.map((pair, leftIndex) => {
          const matched = mapping[leftIndex];
          return (
            <button
              key={pair.left}
              type="button"
              disabled={locked}
              onClick={() => setSelectedLeft(leftIndex)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-sm",
                selectedLeft === leftIndex && "border-primary bg-primary/8 ring-2 ring-primary/10",
                matched !== null && matched !== undefined && "border-emerald-400/60",
                !locked && "hover:border-primary/50",
                locked && "cursor-default",
              )}
            >
              <span className="font-semibold">{pair.left}</span>
              {matched !== null && matched !== undefined ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {pairs[matched]?.right}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {rights.map((right) => (
          <button
            key={right.originalIndex}
            type="button"
            disabled={locked || usedRights.has(right.originalIndex)}
            onClick={() => {
              if (locked || selectedLeft === null) return;
              const next = [...mapping];
              const previous = next.indexOf(right.originalIndex);
              if (previous >= 0) next[previous] = null;
              next[selectedLeft] = right.originalIndex;
              onChange(next);
              setSelectedLeft(null);
            }}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-left text-sm",
              usedRights.has(right.originalIndex) && "opacity-40",
              !locked && "hover:border-primary/50 hover:bg-primary/5",
              locked && "cursor-default",
            )}
          >
            {right.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function PicturePrompt({ imageUrl, imageEmoji }: { imageUrl?: string; imageEmoji?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !failed;
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-border/60 bg-muted/30 px-4 py-6">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- game flashcards from /public SVGs
        <img
          src={imageUrl}
          alt=""
          className="h-44 w-44 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-7xl leading-none" aria-hidden>
          {imageEmoji || "🖼️"}
        </span>
      )}
    </div>
  );
}

function SpellRound({
  letters,
  answer,
  locked,
  onChange,
}: {
  letters: string[];
  answer: string;
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}) {
  const shuffled = useMemo(
    () => shuffleInPlace(letters.map((letter, originalIndex) => ({ originalIndex, letter }))),
    [letters],
  );
  const [picked, setPicked] = useState<number[]>([]);
  const used = new Set(picked);

  useEffect(() => {
    setPicked([]);
  }, [letters]);

  return (
    <div className="space-y-4">
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3">
        {answer.split("").map((_, slot) => {
          const letter = picked[slot];
          return (
            <button
              key={`slot-${slot}`}
              type="button"
              disabled={locked || letter === undefined}
              onClick={() => {
                if (locked || letter === undefined) return;
                setPicked((current) => {
                  const next = current.filter((_, index) => index !== slot);
                  onChange(next.map((index) => letters[index] ?? "").join(""));
                  return next;
                });
              }}
              className={cn(
                "grid size-10 place-items-center rounded-xl border text-lg font-semibold uppercase",
                letter === undefined
                  ? "border-dashed border-border bg-background text-muted-foreground"
                  : "border-primary bg-card text-foreground",
                locked && "cursor-default",
              )}
            >
              {letter !== undefined ? (letters[letter] ?? "") : ""}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Tap letters to spell. Tap a letter above to undo.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {shuffled.map((item) => {
          const taken = used.has(item.originalIndex);
          return (
            <button
              key={item.originalIndex}
              type="button"
              disabled={locked || taken || picked.length >= answer.length}
              onClick={() => {
                if (locked || taken || picked.length >= answer.length) return;
                setPicked((current) => {
                  const next = [...current, item.originalIndex];
                  onChange(next.map((index) => letters[index] ?? "").join(""));
                  return next;
                });
              }}
              className={cn(
                "grid size-12 place-items-center rounded-xl border text-lg font-semibold uppercase transition",
                taken
                  ? "border-transparent bg-muted text-muted-foreground/30"
                  : "border-border bg-card hover:border-primary hover:bg-primary/5",
                locked && "cursor-default",
              )}
            >
              {item.letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HuntRound({
  options,
  selected,
  locked,
  targetCount,
  onChange,
}: {
  options: string[];
  selected: string[];
  locked: boolean;
  targetCount: number;
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Pick {targetCount} words · {selected.length}/{targetCount}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((word) => {
          const on = selected.includes(word);
          return (
            <button
              key={word}
              type="button"
              disabled={locked || (!on && selected.length >= targetCount)}
              onClick={() => {
                if (locked) return;
                onChange(on ? selected.filter((item) => item !== word) : [...selected, word]);
              }}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm",
                on && !locked && "border-primary bg-primary text-primary-foreground",
                locked && on && "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
                !on && !locked && "border-border hover:border-primary/50",
                locked && "cursor-default",
              )}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ShortcutTip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 translate-y-1 opacity-0 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100">
      <kbd className="inline-flex min-w-6 items-center justify-center rounded-md border border-border bg-popover px-1.5 py-1 font-sans text-[11px] font-medium leading-none text-foreground shadow-[0_8px_18px_-12px_rgba(15,23,42,0.6)]">
        {label}
      </kbd>
    </span>
  );
}

function FlashRound({
  question,
  imageUrl,
  saved,
  locked,
  canGoBack,
  enter,
  onSpeak,
  onSave,
  onBack,
  onRate,
}: {
  question: Extract<LearningQuestion, { kind: "flash" }>;
  imageUrl?: string;
  saved: boolean;
  locked: boolean;
  canGoBack: boolean;
  enter: "next" | "back";
  onSpeak: () => void;
  onSave: () => void;
  onBack: () => void;
  onRate: (value: "xmart" | "check") => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const outline = "h-14 rounded-2xl border bg-transparent shadow-none";
  const mark = "h-14 w-full rounded-full border bg-card shadow-none";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (locked || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "x" || event.key === "X") {
        event.preventDefault();
        onRate("xmart");
      } else if (event.key === "Enter") {
        event.preventDefault();
        onRate("check");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, onRate]);

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="[perspective:1400px]">
        <button
          type="button"
          aria-label={flipped ? question.word : `Flip ${question.word}`}
          className={cn(
            "relative grid min-h-[28rem] w-full [transform-style:preserve-3d] transition-transform duration-500",
            !locked && !flipped && "hover:-translate-y-1",
            flipped && "[transform:rotateY(180deg)]",
            locked && "cursor-default",
          )}
          disabled={locked}
          onClick={() => setFlipped((open) => !open)}
        >
          <span className="col-start-1 row-start-1 flex flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-card dark:border-white/10 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.65)] dark:ring-white/10 [backface-visibility:hidden]">
            <span className="relative block aspect-square max-h-[50svh] w-full overflow-hidden border-b border-black/5 bg-muted/40 dark:border-white/10">
              {imageUrl && !imageFailed ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- blurred fill behind the contained art */}
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element -- flashcard art from R2 */}
                  <img
                    src={imageUrl}
                    alt=""
                    decoding="sync"
                    className="relative size-full object-contain"
                    onError={() => setImageFailed(true)}
                  />
                </>
              ) : (
                <span className="grid size-full place-items-center text-6xl" aria-hidden>
                  Aa
                </span>
              )}
            </span>
            <span className={cn("flex flex-1 flex-col items-center justify-center px-6 py-5 text-center", enter === "back" ? "flashcard-enter-back" : "flashcard-enter-next")}>
              <span className="text-4xl font-semibold tracking-[-0.04em] capitalize sm:text-5xl">{question.word}</span>
              <span className="mt-2 text-xs text-muted-foreground">Tap the card to reveal</span>
            </span>
          </span>

          <span className="col-start-1 row-start-1 flex flex-col justify-between overflow-hidden rounded-[2rem] border border-black/8 bg-card dark:border-white/10 p-7 text-left shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-black/5 dark:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.65)] dark:ring-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span>
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {question.word}
              </span>
              <span className="mt-4 block text-base text-primary">{question.ipa}</span>
              <span className="mt-2 block text-4xl font-semibold tracking-tight">{question.meaningVi}</span>
              <span className="mt-4 block text-sm leading-6 text-muted-foreground">{question.gloss}</span>
            </span>
            <span className="rounded-2xl bg-muted/70 px-4 py-3 text-sm leading-6 text-foreground">
              {question.example}
            </span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-5 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-label="Previous word"
          disabled={!canGoBack}
          className={cn(outline, "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800")}
          onClick={onBack}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Save word"
          aria-pressed={saved}
          className={cn(
            outline,
            saved
              ? "border-amber-600 bg-amber-500/15 text-amber-800 dark:text-amber-200"
              : "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-400/40 dark:text-amber-300 dark:hover:bg-amber-400/10",
          )}
          onClick={onSave}
        >
          <Bookmark className="size-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-label="Hear"
          className={cn(outline, "border-primary/40 text-primary hover:bg-primary/10")}
          onClick={onSpeak}
        >
          <Volume2 className="size-5" />
        </Button>
        <span className="group relative">
          <Button
            type="button"
            variant="outline"
            aria-label="Save to study again"
            aria-keyshortcuts="x"
            disabled={locked}
            className={cn(mark, "border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10")}
            onClick={() => onRate("xmart")}
          >
            <X className="size-5" strokeWidth={1.75} />
          </Button>
          <ShortcutTip label="X" />
        </span>
        <span className="group relative">
          <Button
            type="button"
            variant="outline"
            aria-label="Next word"
            aria-keyshortcuts="Enter"
            disabled={locked}
            className={cn(mark, "border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-400/30 dark:text-emerald-300 dark:hover:bg-emerald-400/10")}
            onClick={() => onRate("check")}
          >
            <Check className="size-5" strokeWidth={1.75} />
          </Button>
          <ShortcutTip label="Enter" />
        </span>
      </div>
    </div>
  );
}

function RoundPlay({
  round,
  gameId,
  canGoBack,
  enter,
  savedCards,
  onSaveCard,
  onBack,
  onSubmit,
}: {
  round: LearningGameRound;
  gameId: string;
  canGoBack: boolean;
  enter: "next" | "back";
  savedCards: Set<string>;
  onSaveCard: (cardId: string) => void;
  onBack: () => void;
  onSubmit: (value: string, correct: boolean) => void;
}) {
  const { speak, stop } = useAiSpeech();
  const [value, setValue] = useState("");
  const [seconds, setSeconds] = useState(round.seconds);
  const [hears, setHears] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const question = round.question;
  const timed = question.kind !== "flash";
  const waitsForAudio = timed && Boolean(round.material?.speakable);

  const valueRef = useRef(value);
  valueRef.current = value;
  const lockedRef = useRef(false);
  const finishRef = useRef<(raw: string) => void>(() => undefined);

  const shuffledOrder = useMemo(() => {
    if (question.kind !== "order") return [];
    return shuffleInPlace(question.items.map((text, originalIndex) => ({ originalIndex, text })));
  }, [question]);

  const shuffledRights = useMemo(() => {
    if (question.kind !== "match") return [];
    return shuffleInPlace(
      question.pairs.map((pair, originalIndex) => ({ originalIndex, text: pair.right })),
    );
  }, [question]);

  const shuffledHunt = useMemo(() => {
    if (question.kind !== "hunt") return [];
    return shuffleInPlace(question.options);
  }, [question]);

  useEffect(() => {
    setValue(
      question.kind === "order" || question.kind === "match" || question.kind === "hunt"
        ? question.kind === "match"
          ? JSON.stringify(question.pairs.map(() => null))
          : "[]"
        : "",
    );
    setSeconds(round.seconds);
    setHears(0);
    setAudioStarted(false);
    setLocked(false);
    setCorrect(null);
    lockedRef.current = false;
  }, [round.id, question]);

  useEffect(() => {
    if (!round.material?.speakable) return;
    let active = true;
    const markStarted = () => {
      if (active) setAudioStarted(true);
    };
    void speak(round.material.body, markStarted, markStarted);
    setHears(1);
    return () => {
      active = false;
      stop();
    };
  }, [round.id, round.material?.body, round.material?.speakable, speak, stop]);

  const finish = useCallback(
    (raw: string) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const scored = scoreGameRound(question, raw, { maxWords: round.maxWords });
      setLocked(true);
      setCorrect(scored);
      onSubmit(raw, scored);
    },
    [onSubmit, question, round.maxWords],
  );
  finishRef.current = finish;

  useEffect(() => {
    if (locked || !timed || (waitsForAudio && !audioStarted)) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [audioStarted, locked, round.id, timed, waitsForAudio]);

  useEffect(() => {
    if (!timed || seconds !== 0 || locked) return;
    finishRef.current(valueRef.current);
  }, [seconds, locked, timed]);

  const hearMax = round.hearAgainMax ?? 2;
  const canHear = Boolean(round.material?.speakable) && hears < hearMax && !locked;

  const ready =
    question.kind === "order"
      ? parseJson(value || "[]", [] as number[]).length === question.items.length
      : question.kind === "match"
        ? parseJson(value || "[]", [] as Array<number | null>).every((item) => item !== null)
        : question.kind === "hunt"
          ? parseJson(value || "[]", [] as string[]).length === question.correctWords.length
          : question.kind === "spell"
            ? value.trim().length === question.answer.length
            : value.trim().length > 0;

  return (
    <article
      className={cn(
        "space-y-5",
        question.kind === "flash"
          ? "bg-transparent"
          : "rounded-3xl border border-border/70 bg-card p-5 sm:p-6",
      )}
    >
      {question.kind === "flash" ? null : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {round.level} · {gameId.replaceAll("-", " ")}
          </p>
          {timed ? (
            waitsForAudio && !audioStarted ? (
              <span className="text-xs text-muted-foreground">Timer starts with the audio…</span>
            ) : (
              <TimerRing seconds={seconds} total={round.seconds} />
            )
          ) : null}
        </div>
      )}
      {question.kind === "flash" ? null : (
        <h3 className="text-lg font-semibold tracking-tight">{question.prompt}</h3>
      )}

      {question.kind !== "flash" && (round.material?.imageUrl || round.material?.imageEmoji) ? (
        <PicturePrompt imageUrl={round.material.imageUrl} imageEmoji={round.material.imageEmoji} />
      ) : question.kind !== "flash" && round.material ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
          {round.material.speakable ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={!canHear && hears >= hearMax}
                onClick={() => {
                  if (!round.material?.speakable) return;
                  const markStarted = () => setAudioStarted(true);
                  void speak(round.material.body, markStarted, markStarted);
                  setHears((count) => count + 1);
                }}
              >
                <Volume2 className="size-4" />
                {hears === 0 ? "Listen" : `Hear again (${Math.max(0, hearMax - hears)} left)`}
              </Button>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              <ClickableTranslateText text={round.material.body} />
            </pre>
          )}
        </div>
      ) : null}

      {question.kind === "choice" || question.kind === "fix" ? (
        <ChoiceRound question={question} value={value} locked={locked} onChange={setValue} />
      ) : null}
      {question.kind === "open" ? (
        <OpenRound
          value={value}
          locked={locked}
          allowMic={gameId === "speed-reply"}
          placeholder="Type your answer in English…"
          onChange={setValue}
        />
      ) : null}
      {question.kind === "order" ? (
        <OrderRound
          items={shuffledOrder}
          value={parseJson(value || "[]", [] as number[])}
          locked={locked}
          onChange={(next) => setValue(JSON.stringify(next))}
        />
      ) : null}
      {question.kind === "match" ? (
        <MatchRound
          pairs={question.pairs}
          rights={shuffledRights}
          mapping={parseJson(value || "[]", question.pairs.map(() => null) as Array<number | null>)}
          locked={locked}
          onChange={(next) => setValue(JSON.stringify(next))}
        />
      ) : null}
      {question.kind === "hunt" ? (
        <HuntRound
          options={shuffledHunt}
          selected={parseJson(value || "[]", [] as string[])}
          locked={locked}
          targetCount={question.correctWords.length}
          onChange={(next) => setValue(JSON.stringify(next))}
        />
      ) : null}
      {question.kind === "spell" ? (
        <SpellRound
          letters={question.letters}
          answer={question.answer}
          value={value}
          locked={locked}
          onChange={setValue}
        />
      ) : null}
      {question.kind === "flash" ? (
        <FlashRound
          question={question}
          imageUrl={round.material?.imageUrl}
          saved={savedCards.has(round.id)}
          locked={locked}
          canGoBack={canGoBack}
          enter={enter}
          onSpeak={() => void speak(question.word)}
          onSave={() => onSaveCard(round.id)}
          onBack={onBack}
          onRate={(rating) => finish(rating === "check" ? "know" : "again")}
        />
      ) : null}

      {locked && question.kind !== "flash" ? (
        <div className="space-y-2 rounded-xl border border-accent/25 bg-accent/8 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Check className="size-4 text-accent" />
            {correct ? "On track" : "Check the hint"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{explanationOf(question)}</p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Sample: </span>
            {sampleAnswerFor(question)}
          </p>
        </div>
      ) : question.kind === "flash" ? null : (
        <Button
          type="button"
          className="h-11 w-full rounded-full sm:w-auto"
          disabled={!ready}
          onClick={() => finish(value)}
        >
          Submit
        </Button>
      )}
    </article>
  );
}

export type GamePlayPageViewProps = {
  game: LearningGame | null;
  loading: boolean;
  lessonPack: LessonPack | undefined;
  phase: GamePlayPhase;
  session: LearningGameRound[];
  index: number;
  scores: boolean[];
  playId: number;
  enter: "next" | "back";
  round: LearningGameRound | undefined;
  correctCount: number;
  deckLevels: LearningLevel[];
  deckLevel: LearningLevel | null;
  decks: FlashcardDeckOption[];
  deckId: string | null;
  onPickLevel: (level: LearningLevel) => void;
  onPickDeck: (deckId: string) => void;
  mode: VocabMode;
  autoAdvance: boolean;
  onPickMode: (mode: VocabMode) => void;
  onReviewDeck: (deckId: string) => void;
  reviewRound: number;
  missedRounds: LearningGameRound[];
  onPracticeMissed: () => void;
  onStart: () => void;
  onRoundSubmit: (value: string, isCorrect: boolean) => void;
  onNextRound: () => void;
  onPreviousRound: () => void;
  onBackToDecks: () => void;
  savedCards: Set<string>;
  onSaveCard: (cardId: string) => void;
};

export const GamePlayPageView = memo(function GamePlayPageView({
  game,
  loading,
  lessonPack,
  phase,
  session,
  index,
  scores,
  playId,
  enter,
  round,
  correctCount,
  deckLevels,
  deckLevel,
  decks,
  deckId,
  onPickLevel,
  onPickDeck,
  mode,
  autoAdvance,
  onPickMode,
  onReviewDeck,
  reviewRound,
  missedRounds,
  onPracticeMissed,
  onStart,
  onRoundSubmit,
  onNextRound,
  onPreviousRound,
  onBackToDecks,
  savedCards,
  onSaveCard,
}: GamePlayPageViewProps) {
  const activeDeck = decks.find((deck) => deck.id === deckId);
  const inDeck = decks.length > 0 && phase !== "intro";
  useEffect(() => {
    if (game?.id !== "flashcard" || phase !== "playing") return;
    for (const item of session) {
      const url = item.material?.imageUrl;
      if (!url) continue;
      const loader = new Image();
      loader.decoding = "sync";
      loader.src = url;
    }
  }, [game?.id, phase, session]);

  if (loading) {
    return (
      <DataLoadingState
        title="Setting up the game"
        description="Loading short rounds and audio."
        cards={3}
      />
    );
  }

  if (!game) {
    return (
      <NotFoundPage
        title="This game isn’t in the catalog"
        description="It may have been removed or the link is outdated. Browse the games hub and pick another round."
        actions={[
          { href: "/games", label: "All games", icon: <Gamepad2 />, primary: true },
          { href: "/", label: "Back to Today", icon: <House /> },
        ]}
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-8 overflow-x-clip pb-10">
      {inDeck ? (
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onBackToDecks}>
          <ArrowLeft /> All levels
        </Button>
      ) : (
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/games">
            <ArrowLeft /> All games
          </Link>
        </Button>
      )}

      <header className="workspace-hero-accent relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 to-orange-400 px-5 py-6 text-white sm:rounded-[1.75rem] sm:px-9 sm:py-10">
        <p className="hidden text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase sm:block">
          {game.skill} · {game.durationMinutes} min
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">{game.title}</h1>
        <p className="mt-3 hidden max-w-2xl text-sm text-white/80 sm:block">{game.howToPlay}</p>
        {lessonPack ? (
          <p className="mt-4 hidden text-xs text-white/75 sm:block">
            From lesson: {lessonPack.title}
          </p>
        ) : null}
      </header>

      {phase === "intro" ? (
        <section className="space-y-5 rounded-3xl border border-border/70 bg-card p-6">
          <p className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            {game.body}{" "}
            {decks.length
              ? "Each session plays up to 10 words: missed and due words first, then new ones."
              : "You will play up to 5 short rounds, then see your score."}
          </p>
          {decks.length ? (
            <DeckPicker
              levels={deckLevels}
              level={deckLevel}
              decks={decks}
              deckId={deckId}
              onPickLevel={onPickLevel}
              onPickDeck={onPickDeck}
              mode={mode}
              onPickMode={onPickMode}
              onReviewDeck={onReviewDeck}
            />
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button className="h-11 rounded-full px-6" onClick={onStart}>
              {activeDeck ? `Start ${activeDeck.title}` : "Start playing"}
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/skills/${game.relatedSkill}`}>Related skill drill</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {phase === "playing" && round ? (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {reviewRound > 0 ? (
              <span className="mr-2 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-300">
                Review round {reviewRound}
              </span>
            ) : null}
            Round {index + 1} of {session.length}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{
                width: `${((index + (scores[index] !== undefined ? 1 : 0)) / session.length) * 100}%`,
              }}
            />
          </div>
          <RoundPlay
            key={`${playId}-${round.id}-${index}`}
            round={round}
            gameId={game.id}
            canGoBack={index > 0}
            enter={enter}
            savedCards={savedCards}
            onSaveCard={onSaveCard}
            onBack={onPreviousRound}
            onSubmit={onRoundSubmit}
          />
          {!autoAdvance && scores[index] !== undefined ? (
            <Button className="h-11 rounded-full px-6" onClick={onNextRound}>
              {index + 1 >= session.length ? "See results" : "Next round"}
            </Button>
          ) : null}
        </section>
      ) : null}

      {phase === "results" && game.id === "flashcard" ? (
        <div className="space-y-5 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
              {missedRounds.length ? "Keep going" : "All learned"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {missedRounds.length
                ? `You know ${correctCount}/${session.length} words`
                : "You know every word in this set!"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
              {missedRounds.length
                ? `Practice the ${missedRounds.length} word${missedRounds.length > 1 ? "s" : ""} you marked ✗ until none are left.`
                : "Pick another deck or play this one again."}
            </p>
          </div>
          {missedRounds.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {missedRounds.map((item) =>
                item.question.kind === "flash" ? (
                  <li key={item.id} className="rounded-2xl bg-white/10 px-4 py-2.5">
                    <span className="block text-sm font-semibold capitalize">{item.question.word}</span>
                    <span className="block text-xs text-primary-foreground/75">{item.question.meaningVi}</span>
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {missedRounds.length ? (
              <Button
                type="button"
                className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
                onClick={onPracticeMissed}
              >
                <RotateCcw className="size-4" />
                Practice {missedRounds.length} word{missedRounds.length > 1 ? "s" : ""} again
              </Button>
            ) : decks.length ? (
              <Button
                type="button"
                className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
                onClick={onBackToDecks}
              >
                <ArrowLeft className="size-4" />
                All levels
              </Button>
            ) : null}
            <Button
              type="button"
              className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
              onClick={onStart}
            >
              Play again
            </Button>
            {missedRounds.length && decks.length ? (
              <Button
                type="button"
                className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
                onClick={onBackToDecks}
              >
                <ArrowLeft className="size-4" />
                All levels
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/games">More games</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {phase === "results" && game.id !== "flashcard" ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-linear-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-primary-foreground/70 uppercase">
            Nice work
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            You got {correctCount}/{session.length} correct
          </h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/75">
            Play again, or open a related skill drill to see the same language in a longer exercise.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full border-0 bg-white text-[#0b1524] hover:bg-white/90"
              onClick={onStart}
            >
              <RotateCcw className="size-4" />
              Play again
            </Button>
            <Button
              asChild
              className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25"
            >
              <Link href={`/skills/${game.relatedSkill}`}>Related skill</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/games">More games</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
});
