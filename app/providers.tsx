"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { HttpFailure } from "@/services/http";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // phase 9: stale-while-revalidate — serve last-known data
            // immediately, refresh in the background. 60s staleTime keeps
            // the UI responsive during a lesson run without holding stale
            // routine/lesson data past a reasonable window.
            staleTime: 60_000,
            // keep in-memory cache for 10 minutes after unmount so moving
            // between /learn and /live doesn't force a refetch round-trip.
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            // auto-refetch when the browser reports reconnection — this
            // is what turns "offline → online" into a silent resync.
            refetchOnReconnect: "always",
            // retry is already handled inside services/http.ts; don't
            // double-up at the query layer. non-retriable http failures
            // (4xx) propagate immediately.
            retry: (failureCount, error) => {
              if (error instanceof HttpFailure) return false;
              return failureCount < 1;
            },
          },
          mutations: {
            // mutations are already queued offline via services/api.ts —
            // don't retry at this layer either.
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
