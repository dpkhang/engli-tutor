"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import { vocabApi, type VocabProgressItem, type VocabProgressList } from "../api/vocab-api";
import { clearLegacyFlashcardMarks, readLegacyFlashcardMarks } from "../model/flashcard-review";
import { applyReview, type VocabProgressMap } from "../model/vocab-trainer";

async function loadVocabProgress() {
  const legacy = readLegacyFlashcardMarks();
  if (!legacy) return vocabApi.progress();
  const list = await vocabApi.import(legacy);
  clearLegacyFlashcardMarks();
  return list;
}

function upsertItem(list: VocabProgressList | undefined, item: VocabProgressItem): VocabProgressList {
  const items = (list?.items ?? []).filter((current) => current.wordId !== item.wordId);
  return { items: [...items, item] };
}

export function useVocabProgress(enabled = true) {
  const queryClient = useQueryClient();
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
    mutationFn: ({ wordId, correct }: { wordId: string; correct: boolean }) => vocabApi.review(wordId, correct),
    onMutate: async ({ wordId, correct }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<VocabProgressList>(queryKey, (list) => {
        const current = list?.items.find((item) => item.wordId === wordId);
        return upsertItem(list, applyReview(current, wordId, correct));
      });
    },
    onSuccess: onSaved,
    onError,
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
    (wordId: string, correct: boolean) => sendReview({ wordId, correct }),
    [sendReview],
  );
  const saveCard = useCallback(
    (wordId: string) => {
      if (!saved.has(wordId)) sendSaved(wordId);
    },
    [saved, sendSaved],
  );

  return { progress, saved, loading: query.isLoading, review, saveCard };
}
