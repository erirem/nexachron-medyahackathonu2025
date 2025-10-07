"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsListDataPayload } from "@nexachron/shared-types";

import { fetchNewsList } from "@/services/api";

type UseNewsFilters = {
  readonly categoryId?: string;
  readonly city?: string;
  readonly isPopular?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly limit?: number;
};

type UseNewsOptions = UseNewsFilters & {
  readonly enabled?: boolean;
  readonly initialData?: NewsListDataPayload;
};

type UseNewsResult = {
  readonly data: readonly NewsListDataPayload["items"];
  readonly pagination: NewsListDataPayload["pagination"] | undefined;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
  readonly refetch: () => Promise<NewsListDataPayload | undefined>;
};

export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const {
    categoryId,
    city,
    isPopular,
    page,
    pageSize,
    limit,
    enabled = true,
    initialData,
  } = options;

  const queryKey = useMemo(
    () => [
      "news",
      {
        categoryId: categoryId ?? null,
        city: city ?? null,
        isPopular: typeof isPopular === "boolean" ? isPopular : null,
        page: page ?? null,
        pageSize: pageSize ?? null,
        limit: limit ?? null,
      },
    ],
    [categoryId, city, isPopular, page, pageSize, limit],
  );

  const query = useQuery({
    queryKey,
    queryFn: async () =>
      fetchNewsList({ categoryId, city, isPopular, page, pageSize, limit }),
    enabled,
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
