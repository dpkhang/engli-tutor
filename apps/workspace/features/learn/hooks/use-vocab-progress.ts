"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import {
  vocabApi,
  type VocabProgressItem,
  type VocabProgressList,
  type VocabReviewInput,
} from "../api/vocab-api";
import { upgradeReasonFromError, type UpgradeReason } from "@/features/payments/model/upgrade";
import { clearLegacyFlashcardMarks, readLegacyFlashcardMarks } from "../model/flashcard-review";
import { applyReview, needsReview, type VocabProgressMap } from "../model/vocab-trainer";

async function loadVocabProgress() {
  const legacy = readLegacyFlashcardMarks();
  if (!legacy) return vocabApi.progress();
  const list = await vocabApi.import(legacy);
  clearLegacyFlashcardMarks();
  return list;
}

function upsertItem(list: VocabProgressList | undefined, item: VocabProgressItem): VocabProgressList {
  const items = (list?.items ?? []).filter((current) => current.wordId !== item.wordId);
  return { ...list, items: [...items, item] };
}

export function useVocabProgress(enabled = true) {
  const queryClient = useQueryClient();
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const queryKey = queryKeys.learning.vocabProgress;
  const query = useQuery({
    queryKey,
    queryFn: loadVocabProgress,
    enabled,
    staleTime: CACHE_TIMES.session,
  });

  const progress = useMemo<VocabProgressMap>(
    () => new Map((query.data?.items ?? []).map((item) => [item.wordId, item])),
    [query.data],
  );
  const saved = useMemo(
    () => new Set((query.data?.items ?? []).filter((item) => item.saved).map((item) => item.wordId)),
    [query.data],
  );

  const onError = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);
  const onSaved = useCallback(
    (item: VocabProgressItem) => queryClient.setQueryData<VocabProgressList>(queryKey, (list) => upsertItem(list, item)),
    [queryClient, queryKey],
  );

  const { mutate: sendReview } = useMutation({
    mutationFn: ({ wordId, input }: { wordId: string; input: VocabReviewInput }) => vocabApi.review(wordId, input),
    onMutate: async ({ wordId, input }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<VocabProgressList>(queryKey, (list) => {
        const current = list?.items.find((item) => item.wordId === wordId);
        return upsertItem(list, applyReview(current, wordId, input));
      });
    },
    onSuccess: (item) => {
      onSaved(item);
      void queryClient.invalidateQueries({ queryKey: queryKeys.learning.vocabToday });
    },
    onError: (error) => {
      // Rolls back the optimistic update by refetching server truth.
      void onError();
      const reason = upgradeReasonFromError(error);
      if (reason) setUpgradeReason(reason);
    },
  });

  const { mutate: sendSaved } = useMutation({
    mutationFn: (wordId: string) => vocabApi.setSaved(wordId, true),
    onMutate: async (wordId) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<VocabProgressList>(queryKey, (list) => {
        const current = list?.items.find((item) => item.wordId === wordId);
        return upsertItem(list, {
          wordId,
          box: current?.box ?? 1,
          dueAt: current?.dueAt ?? new Date().toISOString(),
          lastCorrect: current?.lastCorrect ?? null,
          lastSeenAt: current?.lastSeenAt ?? null,
          saved: true,
        });
      });
    },
    onSuccess: onSaved,
    onError,
  });

  const review = useCallback(
    (wordId: string, result: boolean | VocabReviewInput) =>
      sendReview({ wordId, input: typeof result === "boolean" ? { correct: result } : result }),
    [sendReview],
  );
  const saveCard = useCallback(
    (wordId: string) => {
      if (!saved.has(wordId)) sendSaved(wordId);
    },
    [saved, sendSaved],
  );

  const dueCount = useMemo(() => {
    const now = Date.now();
    return (query.data?.items ?? []).filter((item) => needsReview(item, now)).length;
  }, [query.data]);
  const clearUpgrade = useCallback(() => setUpgradeReason(null), []);

  return { progress, saved, loading: query.isLoading, review, saveCard, dueCount, upgradeReason, clearUpgrade };
}
