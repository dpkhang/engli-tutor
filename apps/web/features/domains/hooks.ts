"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { domainApi } from "./api";

export const domainHooks = {
  useList: () => useQuery({ queryKey: ["domains"], queryFn: domainApi.list }),
  useCreate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.create,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useDelete: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.delete,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useUpdate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...input }: { id: string; landingPageId?: string | null; autoRenew?: boolean }) =>
        domainApi.update(id, input),
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useSearch: () =>
    useMutation({
      mutationFn: ({ q, years }: { q: string; years?: number }) =>
        domainApi.search(q, years ?? 1),
    }),
  usePurchase: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.purchase,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useVerify: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.verify,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
  useVerification: (id: string | null) =>
    useQuery({
      queryKey: ["domains", "verification", id],
      queryFn: () => domainApi.getVerification(id!),
      enabled: Boolean(id),
    }),
  useConfirmCheckout: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.confirmCheckout,
      onSuccess: () => client.invalidateQueries({ queryKey: ["domains"] }),
    });
  },
};
