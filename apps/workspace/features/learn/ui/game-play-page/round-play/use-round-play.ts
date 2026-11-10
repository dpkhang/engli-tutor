"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAiSpeech } from "@/features/speaking-lab";
import {
  evaluateOpen,
  scoreGameRound,
  shuffleInPlace,
  timeLimitFor,
  type OpenEvaluation,
} from "../../../model/games";
import { type LearningGameRound } from "../../../api/types";
import { type RoundTiming, MAX_MIC_PAUSE_SECONDS } from "../types";
import {
  initialRoundValue,
  isRoundReady,
  parseHuntValue,
  parseMatchValue,
  parseOrderValue,
} from "../game-play-page.model";

export type UseRoundPlayArgs = {
  round: LearningGameRound;
  onSaveCard: (cardId: string) => void;
  onSubmit: (value: string, correct: boolean, timing: RoundTiming) => void;
};

/** State, timer, audio and submit logic for one round. */
export function useRoundPlay({ round, onSaveCard, onSubmit }: UseRoundPlayArgs) {
  const { speak, stop } = useAiSpeech();
  const [value, setValue] = useState("");
  const totalSeconds = useMemo(() => timeLimitFor(round), [round]);
  const [seconds, setSeconds] = useState(totalSeconds);
  const [hears, setHears] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [evaluation, setEvaluation] = useState<OpenEvaluation | null>(null);
  const [micPaused, setMicPaused] = useState(false);
  const question = round.question;
  const timed = question.kind !== "flash";
  const waitsForAudio = timed && Boolean(round.material?.speakable);

  const valueRef = useRef(value);
  valueRef.current = value;
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;
  const recordingRef = useRef(false);
  const micPausedSecondsRef = useRef(0);
  const handleRecordingChange = useCallback((recording: boolean) => {
    recordingRef.current = recording;
  }, []);
  const lockedRef = useRef(false);
  const finishRef = useRef<(raw: string) => void>(() => undefined);

  const shuffledOrder = useMemo(() => {
    if (question.kind !== "order") return [];
    return shuffleInPlace(question.items.map((text, originalIndex) => ({ originalIndex, text })));
  }, [question]);

  const shuffledRights = useMemo(() => {
    if (question.kind !== "match") return [];
    return shuffleInPlace(
      question.pairs.map((pair, originalIndex) => ({
        originalIndex,
        text: pair.right,
      })),
    );
  }, [question]);

  const shuffledHunt = useMemo(() => {
    if (question.kind !== "hunt") return [];
    return shuffleInPlace(question.options);
  }, [question]);

  useEffect(() => {
    setValue(initialRoundValue(question));
    setSeconds(totalSeconds);
    setHears(0);
    setAudioStarted(false);
    setLocked(false);
    setCorrect(null);
    setEvaluation(null);
    setMicPaused(false);
    micPausedSecondsRef.current = 0;
    lockedRef.current = false;
  }, [round.id, question, totalSeconds]);

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
      const detail =
        question.kind === "open" ? evaluateOpen(raw, question, { maxWords: round.maxWords }) : null;
      const scored = detail
        ? detail.correct
        : scoreGameRound(question, raw, { maxWords: round.maxWords });
      setLocked(true);
      setCorrect(scored);
      setEvaluation(detail);
      setMicPaused(false);
      onSubmit(raw, scored, { secondsLeft: secondsRef.current, totalSeconds });
    },
    [onSubmit, question, round.maxWords, totalSeconds],
  );
  finishRef.current = finish;

  useEffect(() => {
    if (locked || !timed || (waitsForAudio && !audioStarted)) return;
    const timer = window.setInterval(() => {
      if (recordingRef.current && micPausedSecondsRef.current < MAX_MIC_PAUSE_SECONDS) {
        micPausedSecondsRef.current += 1;
        setMicPaused(true);
        return;
      }
      setMicPaused(false);
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
  const ready = isRoundReady(question, value);

  const orderValue = useMemo(() => parseOrderValue(value), [value]);
  const matchMapping = useMemo(() => parseMatchValue(value, question), [value, question]);
  const huntPicked = useMemo(() => parseHuntValue(value), [value]);

  const onChangeJson = useCallback((next: unknown) => setValue(JSON.stringify(next)), []);

  const onHear = useCallback(() => {
    if (!round.material?.speakable) return;
    const markStarted = () => setAudioStarted(true);
    void speak(round.material.body, markStarted, markStarted);
    setHears((count) => count + 1);
  }, [round.material, speak]);

  const onSpeakWord = useCallback((word: string) => void speak(word), [speak]);
  const onSpeakFlash = useCallback(() => {
    if (question.kind === "flash") void speak(question.word);
  }, [question, speak]);
  const onSave = useCallback(() => onSaveCard(round.id), [onSaveCard, round.id]);
  const onSubmitCurrent = useCallback(() => finish(value), [finish, value]);

  return {
    value,
    seconds,
    totalSeconds,
    hears,
    hearMax,
    canHear,
    audioStarted,
    locked,
    correct,
    evaluation,
    micPaused,
    timed,
    waitsForAudio,
    ready,
    shuffledOrder,
    shuffledRights,
    shuffledHunt,
    orderValue,
    matchMapping,
    huntPicked,
    handleRecordingChange,
    onChangeText: setValue,
    onChangeJson,
    onHear,
    onSpeakWord,
    onSpeakFlash,
    onSave,
    onRate: finish,
    onSubmitCurrent,
  };
}

export type RoundPlayState = ReturnType<typeof useRoundPlay>;
