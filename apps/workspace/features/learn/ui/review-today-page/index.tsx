"use client";

import { useVocabProgress } from "../../hooks/use-vocab-progress";
import { useVocabToday } from "../../hooks/use-vocab-today";
import { ReviewTodayPageView } from "./review-today-page.view";

export function ReviewTodayPage() {
  const { dueCount, loading } = useVocabProgress();
  const { today } = useVocabToday();
  return (
    <ReviewTodayPageView
      loading={loading}
      dueCount={dueCount}
      reviewsUsed={today?.reviewsUsed ?? null}
      reviewsLimit={today?.reviewsLimit ?? null}
    />
  );
}
