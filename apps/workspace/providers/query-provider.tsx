"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { subscribeAccountChanged } from "@/features/accounts";
import { createQueryClient, queryKeys } from "@/lib/query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient());

  useEffect(() => {
    return subscribeAccountChanged((profile) => {
      if (profile) {
        client.setQueryData(queryKeys.account, profile);
        return;
      }
      void client.invalidateQueries({ queryKey: queryKeys.account });
    });
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
