"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { domainApi } from "./api";
import { queryKeys } from "@/lib/query";

export const domainHooks = {
  useList: () => useQuery({ queryKey: queryKeys.domains.all, queryFn: domainApi.list }),
  useCreate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.create,
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
    });
  },
  useDelete: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.delete,
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
    });
  },
  useUpdate: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...input }: { id: string; landingPageId?: string | null; autoRenew?: boolean }) =>
        domainApi.update(id, input),
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
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
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
    });
  },
  useVerify: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.verify,
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
    });
  },
  useVerification: (id: string | null) =>
    useQuery({
      queryKey: queryKeys.domains.verification(id ?? ""),
      queryFn: () => domainApi.getVerification(id!),
      enabled: Boolean(id),
    }),
  useConfirmCheckout: () => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: domainApi.confirmCheckout,
      onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.domains.all }),
    });
  },
};
