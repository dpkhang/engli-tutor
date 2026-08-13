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

export const templateHooks = {
  ...resourceHooks("templates", workspaceApi.templates),
  useGenerate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: workspaceApi.templates.generate,
      onSuccess: () => client.invalidateQueries({ queryKey: ["templates"] }),
    });
  },
};
export const mediaHooks = resourceHooks("media", workspaceApi.media);
export const leadHooks = resourceHooks("leads", workspaceApi.leads);
export const domainHooks = {
  ...resourceHooks("domains", {
    list: workspaceApi.domains.list,
    create: workspaceApi.domains.create,
    delete: workspaceApi.domains.delete,
  }),
  useUpdate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        ...input
      }: {
        id: string;
        landingPageId?: string | null;
        autoRenew?: boolean;
      }) => workspaceApi.domains.update(id, input),
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useSearch: () =>
    useMutation({
      mutationFn: ({ q, years }: { q: string; years?: number }) =>
        workspaceApi.domains.search(q, years ?? 1),
    }),
  usePurchase: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: workspaceApi.domains.purchase,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useVerify: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => workspaceApi.domains.verify(id),
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useVerification: (id: string | null) =>
    useQuery({
      queryKey: ["domains", "verification", id],
      queryFn: () => workspaceApi.domains.getVerification(id!),
      enabled: Boolean(id),
    }),
  useConfirmCheckout: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: (sessionId: string) => workspaceApi.domains.confirmCheckout(sessionId),
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
};

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
