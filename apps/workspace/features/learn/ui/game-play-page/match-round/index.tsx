"use client";

import { useCallback, useState } from "react";
import { MatchRoundView } from "./match-round.view";

export function MatchRound({
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

  const onPickRight = useCallback(
    (rightIndex: number) => {
      if (locked || selectedLeft === null) return;
      const next = [...mapping];
      const previous = next.indexOf(rightIndex);
      if (previous >= 0) next[previous] = null;
      next[selectedLeft] = rightIndex;
      onChange(next);
      setSelectedLeft(null);
    },
    [locked, mapping, onChange, selectedLeft],
  );

  return (
    <MatchRoundView
      pairs={pairs}
      rights={rights}
      mapping={mapping}
      locked={locked}
      selectedLeft={selectedLeft}
      onSelectLeft={setSelectedLeft}
      onPickRight={onPickRight}
    />
  );
}
