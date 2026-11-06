"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TIMES, queryKeys } from "@/lib/query";
import { vocabApi } from "../api/vocab-api";

/** Server-side daily review quota (used/limit/reset). Due counts come from useVocabProgress. */
export function useVocabToday(enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.learning.vocabToday,
    queryFn: vocabApi.today,
    enabled,
    staleTime: CACHE_TIMES.session,
  });
  return { today: query.data ?? null, loading: query.isLoading, error: query.isError };
}
