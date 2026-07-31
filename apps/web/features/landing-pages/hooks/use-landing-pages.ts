"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLandingPage, getLandingPages } from "../api/landing-pages";
import type { CreateLandingPageInput } from "../model/types";

export const landingPagesQueryKey = ["landing-pages"] as const;

export function useLandingPages() {
  return useQuery({
    queryKey: landingPagesQueryKey,
    queryFn: getLandingPages,
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLandingPageInput) => createLandingPage(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: landingPagesQueryKey });
    },
  });
}
