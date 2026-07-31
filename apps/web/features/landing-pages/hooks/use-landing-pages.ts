"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLandingPage,
  deleteLandingPage,
  getLandingPage,
  getLandingPages,
  updateLandingPage,
} from "../api/landing-pages";
import type { CreateLandingPageInput, UpdateLandingPageInput } from "../model/types";

export const landingPagesQueryKey = ["landing-pages"] as const;

export function landingPageQueryKey(id: string) {
  return ["landing-page", id] as const;
}

export function useLandingPages() {
  return useQuery({
    queryKey: landingPagesQueryKey,
    queryFn: getLandingPages,
  });
}

export function useLandingPage(id: string) {
  return useQuery({
    queryKey: landingPageQueryKey(id),
    queryFn: () => getLandingPage(id),
    enabled: Boolean(id),
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

export function useUpdateLandingPage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLandingPageInput) => updateLandingPage(id, input),
    onSuccess: async (page) => {
      queryClient.setQueryData(landingPageQueryKey(id), page);
      await queryClient.invalidateQueries({ queryKey: landingPagesQueryKey });
    },
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLandingPage(id),
    onSuccess: async (_void, id) => {
      queryClient.removeQueries({ queryKey: landingPageQueryKey(id) });
      await queryClient.invalidateQueries({ queryKey: landingPagesQueryKey });
    },
  });
}
