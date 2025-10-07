"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

const defaultOptions = {
  queries: {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  },
};

type ReactQueryProviderProps = {
  readonly children: ReactNode;
};

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
