"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardNewsDataPayload } from "@nexachron/shared-types";

import { fetchPopularNews } from "@/services/api";

type UsePopularNewsOptions = {
  readonly limit?: number;
  readonly enabled?: boolean;
  readonly initialData?: DashboardNewsDataPayload;
};

type UsePopularNewsResult = {
  readonly data: readonly DashboardNewsDataPayload["items"];
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
  readonly refetch: () => Promise<DashboardNewsDataPayload | undefined>;
};

export function usePopularNews(options: UsePopularNewsOptions = {}): UsePopularNewsResult {
  const { limit = 10, enabled = true, initialData } = options;

  const queryKey = useMemo(
    () => [
      "popular-news",
      {
        limit,
      },
    ],
    [limit],
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => fetchPopularNews(limit),
    enabled,
    initialData,
  });

  return {
    data: query.data?.items ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error : undefined,
    refetch: async () =>
      (await query.refetch({ throwOnError: false })).data ?? query.data,
  };
}