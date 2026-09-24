"use client";

import { useEffect, useState } from "react";
import { billingApi, type BillingCatalog } from "../api/billing";

export function useBillingCatalog() {
  const [data, setData] = useState<BillingCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    billingApi.catalog().then(
      (result) => {
        if (!cancelled) setData(result);
      },
      (reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason : new Error("Could not load plans"));
      },
    ).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { data, isLoading, error };
}
