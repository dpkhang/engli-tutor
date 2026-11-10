"use client";

import { useCallback, useEffect, useState } from "react";
import { type LearningQuestion } from "../../../api/types";
import { type VocabGrade } from "../../../api/vocab-api";
import { flashGradeForKey } from "../game-play-page.model";
import { FlashRoundView } from "./flash-round.view";

export function FlashRound({
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
  onRate: (value: VocabGrade) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const onFlip = useCallback(() => setFlipped((open) => !open), []);
  const onImageError = useCallback(() => setImageFailed(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (locked) return;
      const grade = flashGradeForKey(event);
      if (grade) {
        event.preventDefault();
        onRate(grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, onRate]);

  return (
    <FlashRoundView
      question={question}
      imageUrl={imageUrl}
      saved={saved}
      locked={locked}
      canGoBack={canGoBack}
      enter={enter}
      flipped={flipped}
      imageFailed={imageFailed}
      onFlip={onFlip}
      onImageError={onImageError}
      onSpeak={onSpeak}
      onSave={onSave}
      onBack={onBack}
      onRate={onRate}
    />
  );
}
