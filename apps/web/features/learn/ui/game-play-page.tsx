"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Lightbulb,
  Mic2,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Button, cn } from "@landing-page-generator/ui";
import { DataLoadingState } from "@/features/layout";
import { useAiSpeech } from "@/features/speaking-lab/hooks/use-ai-speech";
import { useVoiceInput } from "@/features/tutor-chat/hooks/use-voice-input";
import { LESSON_PACKS } from "../model/curriculum";
import { useGame } from "../hooks/use-learning-catalog";
import {
  pickGameRounds,
  sampleAnswerFor,
  scoreGameRound,
  shuffleInPlace,
} from "../model/games";
import type { LearningGameRound, LearningQuestion } from "../api/types";

type Phase = "intro" | "playing" | "results";

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
      <p className="text-xs text-muted-foreground">Tap in the order you heard. Tap again to undo.</p>
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

function RoundPlay({
  round,
  gameId,
  onSubmit,
}: {
  round: LearningGameRound;
  gameId: string;
  onSubmit: (value: string, correct: boolean) => void;
}) {
  const { speak, stop } = useAiSpeech();
  const [value, setValue] = useState("");
  const [seconds, setSeconds] = useState(round.seconds);
  const [hears, setHears] = useState(0);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const question = round.question;

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
    setLocked(false);
    setCorrect(null);
    lockedRef.current = false;
  }, [round.id, question]);

  useEffect(() => {
    if (!round.material?.speakable) return;
    void speak(round.material.body);
    setHears(1);
    return () => stop();
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
    if (locked) return;
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
  }, [locked, round.id]);

  useEffect(() => {
    if (seconds === 0 && !locked) {
      finishRef.current(valueRef.current);
    }
  }, [seconds, locked]);

  const hearMax = round.hearAgainMax ?? 2;
  const canHear = Boolean(round.material?.speakable) && hears < hearMax && !locked;

  const ready =
    question.kind === "order"
      ? parseJson(value || "[]", [] as number[]).length === question.items.length
      : question.kind === "match"
        ? parseJson(value || "[]", [] as Array<number | null>).every((item) => item !== null)
        : question.kind === "hunt"
          ? parseJson(value || "[]", [] as string[]).length === question.correctWords.length
          : value.trim().length > 0;

  return (
    <article className="space-y-5 rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {round.level} · {gameId.replaceAll("-", " ")}
        </p>
        <TimerRing seconds={seconds} total={round.seconds} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{question.prompt}</h3>

      {round.material ? (
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
                  void speak(round.material.body);
                  setHears((count) => count + 1);
                }}
              >
                <Volume2 className="size-4" />
                {hears === 0 ? "Listen" : `Hear again (${Math.max(0, hearMax - hears)} left)`}
              </Button>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {round.material.body}
            </pre>
          )}
        </div>
      ) : null}

      {question.kind === "choice" || question.kind === "fix" ? (
        <ChoiceRound
          question={question}
          value={value}
          locked={locked}
          onChange={setValue}
        />
      ) : null}
      {question.kind === "open" ? (
        <OpenRound
          value={value}
          locked={locked}
          allowMic={gameId === "speed-reply"}
          placeholder={gameId === "rewrite-race" ? "Type a shorter version…" : "Type your answer in English…"}
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
          mapping={parseJson(
            value || "[]",
            question.pairs.map(() => null) as Array<number | null>,
          )}
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

      {locked ? (
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
      ) : (
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

export function GamePlayPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const lesson = searchParams.get("lesson");
  const { game, loading } = useGame(slug, lesson);
  const lessonPack = LESSON_PACKS.find((item) => item.id === lesson);
  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<LearningGameRound[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [playId, setPlayId] = useState(0);

  const start = () => {
    if (!game) return;
    setSession(pickGameRounds(game.rounds, lesson));
    setIndex(0);
    setScores([]);
    setPlayId((current) => current + 1);
    setPhase("playing");
  };

  const round = session[index];

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
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Game not found.</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/games">All games</Link>
        </Button>
      </div>
    );
  }

  const correctCount = scores.filter(Boolean).length;

  return (
    <div className="w-full min-w-0 space-y-8 overflow-x-clip pb-10">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href="/games">
          <ArrowLeft /> All games
        </Link>
      </Button>

      <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-rose-500 to-orange-400 px-6 py-8 text-white sm:px-9 sm:py-10">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
          {game.skill} · {game.durationMinutes} min
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{game.title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">{game.howToPlay}</p>
        {lessonPack ? (
          <p className="mt-4 text-xs text-white/75">From lesson: {lessonPack.title}</p>
        ) : null}
      </header>

      {phase === "intro" ? (
        <section className="space-y-5 rounded-[1.5rem] border border-border/70 bg-card p-6">
          <p className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            {game.body} You will play up to 5 short rounds, then see your score.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="h-11 rounded-full px-6" onClick={start}>
              Start playing
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
            Round {index + 1} of {session.length}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${((index + (scores[index] !== undefined ? 1 : 0)) / session.length) * 100}%` }}
            />
          </div>
          <RoundPlay
            key={`${playId}-${round.id}-${index}`}
            round={round}
            gameId={game.id}
            onSubmit={(_value, isCorrect) => {
              setScores((prev) => {
                const next = [...prev];
                next[index] = isCorrect;
                return next;
              });
            }}
          />
          {scores[index] !== undefined ? (
            <Button
              className="h-11 rounded-full px-6"
              onClick={() => {
                if (index + 1 >= session.length) setPhase("results");
                else setIndex((current) => current + 1);
              }}
            >
              {index + 1 >= session.length ? "See results" : "Next round"}
            </Button>
          ) : null}
        </section>
      ) : null}

      {phase === "results" ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground">
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
              onClick={start}
            >
              <RotateCcw className="size-4" />
              Play again
            </Button>
            <Button asChild className="rounded-full border-0 bg-white/15 text-white hover:bg-white/25">
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
}
