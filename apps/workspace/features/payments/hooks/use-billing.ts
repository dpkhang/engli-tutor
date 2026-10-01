"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi, type BillingPeriod, type SubscriptionPlan } from "../api/billing";
import { queryKeys } from "@/lib/query";

export const billingMeQueryKey = queryKeys.billing.me;

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
      period?: BillingPeriod;
    }) => billingApi.subscribe(planId, period),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
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

export function useStartTrial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: billingApi.startTrial,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
    },
  });
}

export function useConfirmCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { sessionId?: string; planId?: string }) => billingApi.confirm(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingMeQueryKey });
      await queryClient.refetchQueries({ queryKey: billingMeQueryKey });
    },
  });
}
