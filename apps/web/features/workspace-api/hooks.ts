"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "./api";

function resourceHooks<TItem, TCreate>(
  key: string,
  api: {
    list: () => Promise<TItem[]>;
    create: (input: TCreate) => Promise<TItem>;
    delete: (id: string) => Promise<void>;
  },
) {
  return {
    useList: () => useQuery({ queryKey: [key], queryFn: api.list }),
    useCreate: () => {
      const client = useQueryClient();
      return useMutation({
        mutationFn: api.create,
        onSuccess: () => client.invalidateQueries({ queryKey: [key] }),
      });
    },
    useDelete: () => {
      const client = useQueryClient();
      return useMutation({
        mutationFn: api.delete,
        onSuccess: () => client.invalidateQueries({ queryKey: [key] }),
      });
    },
  };
}

export const templateHooks = resourceHooks("templates", workspaceApi.templates);
export const mediaHooks = resourceHooks("media", workspaceApi.media);
export const leadHooks = resourceHooks("leads", workspaceApi.leads);
export const domainHooks = resourceHooks("domains", {
  list: workspaceApi.domains.list,
  create: (input: { hostname: string }) => workspaceApi.domains.create(input.hostname),
  delete: workspaceApi.domains.delete,
});

export function useUpdateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Parameters<typeof workspaceApi.leads.update>[1]["status"];
    }) => workspaceApi.leads.update(id, { status }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["leads"] }),
  });
}
export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: workspaceApi.settings.get });
}
export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: workspaceApi.settings.update,
    onSuccess: (data) => client.setQueryData(["settings"], data),
  });
}
