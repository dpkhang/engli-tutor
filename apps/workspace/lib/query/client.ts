import { QueryClient, replaceEqualDeep } from "@tanstack/react-query";
import { CACHE_TIMES } from "./keys";

/** Keep the previous cache reference when the new response is deeply equal. */
export function keepIfUnchanged<T>(previous: T | undefined, incoming: T): T {
  if (previous === undefined) return incoming;
  return replaceEqualDeep(previous, incoming);
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: CACHE_TIMES.gc,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        retry: 1,
        structuralSharing: keepIfUnchanged,
      },
    },
  });
}
