"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLandingPage,
  deleteLandingPage,
  generateLandingPage,
  getLandingPage,
  getLandingPageBySlug,
  getLandingPages,
  getWorkspaceIntegrations,
  updateLandingPage,
} from "../api/landing-pages";
import type {
  CreateLandingPageInput,
  GenerateLandingPageInput,
  UpdateLandingPageInput,
} from "../model/types";

export const landingPagesQueryKey = ["landing-pages"] as const;
export const workspaceIntegrationsQueryKey = ["workspace-integrations"] as const;

export function landingPageQueryKey(id: string) {
  return ["landing-page", id] as const;
}

export function landingPageBySlugQueryKey(slug: string) {
  return ["landing-page-by-slug", slug] as const;
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

export function useLandingPageBySlug(slug: string) {
  return useQuery({
    queryKey: landingPageBySlugQueryKey(slug),
    queryFn: () => getLandingPageBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useWorkspaceIntegrations() {
  return useQuery({
    queryKey: workspaceIntegrationsQueryKey,
    queryFn: getWorkspaceIntegrations,
    staleTime: 60_000,
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

export function useGenerateLandingPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateLandingPageInput) => generateLandingPage(input),
    onSuccess: async (page) => {
      queryClient.setQueryData(landingPageQueryKey(page.id), page);
      queryClient.setQueryData(landingPageBySlugQueryKey(page.slug), page);
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
