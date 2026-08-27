"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi, type BillingMe, type SubscriptionPlan, type TopupPack } from "../api/billing";

export const billingMeQueryKey = ["billing", "me"] as const;

export function useBillingMe(enabled = true) {
  return useQuery({
    queryKey: billingMeQueryKey,
    queryFn: billingApi.me,
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      period,
    }: {
      planId: SubscriptionPlan["id"];
      period?: "monthly" | "yearly";
    }) => billingApi.subscribe(planId, period),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["credits", "me"] });
    },
  });
}

export function useUpgradePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: SubscriptionPlan["id"]) => billingApi.upgrade(planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
    },
  });
}

export function useTopupCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packId: TopupPack["id"]) => billingApi.topup(packId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
    },
  });
}

export function useConfirmCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => billingApi.confirm(sessionId),
    onSuccess: async (result) => {
      if (typeof result.balanceAfter === "number") {
        queryClient.setQueryData(billingMeQueryKey, (current: BillingMe | undefined) => {
          if (!current) return current;
          return { ...current, balance: result.balanceAfter! };
        });
      }
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
      await queryClient.refetchQueries({ queryKey: billingMeQueryKey });
    },
  });
}
