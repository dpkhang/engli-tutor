"use client";

import { useCallback, useEffect, useState } from "react";
import { billingApi, type BillingMe } from "../api/billing";

export function useBillingMe(enabled = true) {
  const [data, setData] = useState<BillingMe | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await billingApi.me();
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err : new Error("Could not load plan details"));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
