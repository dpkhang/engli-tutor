"use client";

import { useCallback, useMemo, useState } from "react";
import type { LearningGameRound } from "../../../api/types";
import { evaluateHunt } from "../../../model/games";
import {
  getHuntTargets,
  splitTranscript,
  summarizeHuntResults,
  type HuntQuestion,
  type HuntTarget,
} from "../game-play-page.model";
import { HuntResultsSummaryView, HuntRevealView } from "./hunt-reveal.view";

export function HuntReveal({
  question,
  picked,
  transcript,
  correct,
  onSpeak,
}: {
  question: HuntQuestion;
  picked: string[];
  transcript?: string;
  correct: boolean | null;
  onSpeak: (word: string) => void;
}) {
  const targets = useMemo(() => getHuntTargets(question), [question]);
  const evaluation = useMemo(() => evaluateHunt(question, picked), [question, picked]);
  const segments = useMemo(
    () => (transcript ? splitTranscript(transcript, targets) : []),
    [transcript, targets],
  );
  const [active, setActive] = useState<HuntTarget | null>(null);
  const onToggleActive = useCallback(
    (target: HuntTarget) => setActive((current) => (current?.word === target.word ? null : target)),
    [],
  );

  return (
    <HuntRevealView
      question={question}
      targets={targets}
      evaluation={evaluation}
      segments={segments}
      active={active}
      correct={correct}
      onToggleActive={onToggleActive}
      onSpeak={onSpeak}
    />
  );
}

/** Results-screen section: hits/total per round + most frequently missed words. */
export function HuntResultsSummary({
  session,
  answers,
}: {
  session: LearningGameRound[];
  answers: Array<{ value: string } | undefined>;
}) {
  const { rows, frequent } = useMemo(
    () => summarizeHuntResults(session, answers),
    [session, answers],
  );
  if (!rows.length) return null;
  return <HuntResultsSummaryView rows={rows} frequent={frequent} />;
}
