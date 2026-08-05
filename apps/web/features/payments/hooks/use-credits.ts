"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creditsApi } from "../api/credits";
import type { TopupPack } from "../api/billing";
import { billingMeQueryKey } from "./use-billing";

export const creditsMeQueryKey = billingMeQueryKey;
export const creditPacksQueryKey = ["credits", "packs"] as const;

export function useCreditsMe(enabled = true) {
  return useQuery({
    queryKey: creditsMeQueryKey,
    queryFn: creditsApi.me,
    enabled,
  });
}

export function useCreditPacks() {
  return useQuery({
    queryKey: creditPacksQueryKey,
    queryFn: creditsApi.packs,
  });
}

export function useCreditsCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packId: TopupPack["id"]) => creditsApi.checkout(packId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: creditsMeQueryKey });
    },
  });
}
