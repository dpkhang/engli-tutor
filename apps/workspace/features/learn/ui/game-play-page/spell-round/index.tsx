"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { shuffleInPlace } from "../../../model/games";
import { SpellRoundView } from "./spell-round.view";

export function SpellRound({
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

  useEffect(() => {
    setPicked([]);
  }, [letters]);

  const onRemove = useCallback(
    (slot: number, letter: number | undefined) => {
      if (locked || letter === undefined) return;
      setPicked((current) => {
        const next = current.filter((_, index) => index !== slot);
        onChange(next.map((index) => letters[index] ?? "").join(""));
        return next;
      });
    },
    [letters, locked, onChange],
  );

  const onPick = useCallback(
    (originalIndex: number, taken: boolean) => {
      if (locked || taken || picked.length >= answer.length) return;
      setPicked((current) => {
        const next = [...current, originalIndex];
        onChange(next.map((index) => letters[index] ?? "").join(""));
        return next;
      });
    },
    [answer.length, letters, locked, onChange, picked.length],
  );

  return (
    <SpellRoundView
      letters={letters}
      answer={answer}
      locked={locked}
      shuffled={shuffled}
      picked={picked}
      onRemove={onRemove}
      onPick={onPick}
    />
  );
}
