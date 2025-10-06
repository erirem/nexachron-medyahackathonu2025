"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsWithMediaDto } from "@nexachron/shared-types";

import { fetchNewsById } from "@/services/api";

type UseNewsByIdOptions = {
  readonly id: string;
  readonly enabled?: boolean;
};

type UseNewsByIdResult = {
  readonly data: NewsWithMediaDto | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
  readonly refetch: () => Promise<NewsWithMediaDto | undefined>;
};

export function useNewsById(options: UseNewsByIdOptions): UseNewsByIdResult {
  const { id, enabled = true } = options;

  const queryKey = useMemo(
    () => [
      "news-by-id",
      {
        id,
      },
    ],
    [id],
  );

  const query = useQuery({
    queryKey,
    queryFn: async () => fetchNewsById(id),
    enabled: !!id && enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error : undefined,
    refetch: async () =>
      (await query.refetch({ throwOnError: false })) ?? query.data,
  };
}