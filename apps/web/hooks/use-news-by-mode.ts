"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsListDataPayload } from "@nexachron/shared-types";

import { fetchNewsByMode } from "@/services/api";

type UseNewsByModeOptions = {
  readonly mode: string;
  readonly limit?: number;
  readonly enabled?: boolean;
  readonly initialData?: NewsListDataPayload;
};

type UseNewsByModeResult = {
  readonly data: readonly NewsListDataPayload["items"];
  readonly pagination: NewsListDataPayload["pagination"] | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
  readonly refetch: () => Promise<NewsListDataPayload | undefined>;
};

export function useNewsByMode(options: UseNewsByModeOptions): UseNewsByModeResult {
  const { mode, limit = 20, enabled = true, initialData } = options;

  const queryKey = useMemo(
    () => [
      "news-by-mode",
      {
        mode,
        limit,
      },
    ],
    [mode, limit],
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => fetchNewsByMode(mode, limit),
    enabled: !!mode && enabled,
    initialData,
  });

  return {
    data: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error : undefined,
    refetch: async () =>
      (await query.refetch({ throwOnError: false })).data ?? query.data,
  };
}