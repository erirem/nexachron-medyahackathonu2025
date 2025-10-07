"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  CategoryNewsDetailResponse,
  CategoriesOverviewResponse,
} from "@nexachron/shared-types";

import { fetchCategories } from "@/services/api";

type UseCategoriesOptions = {
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly enabled?: boolean;
  readonly initialOverview?: CategoriesOverviewResponse;
};

type CategoriesQueryResult = {
  readonly overview: CategoriesOverviewResponse;
  readonly detail?: CategoryNewsDetailResponse;
};

type UseCategoriesResult = {
  readonly categories: CategoriesOverviewResponse["categories"];
  readonly total: number;
  readonly detail?: CategoryNewsDetailResponse;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly error: Error | undefined;
  readonly refetch: () => Promise<CategoriesQueryResult | undefined>;
};

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesResult {
  const { categoryId, page, pageSize, enabled = true, initialOverview } = options;

  const queryKey = useMemo(
    () => [
      "news-categories",
      {
        categoryId: categoryId ?? null,
        page: page ?? null,
        pageSize: pageSize ?? null,
      },
    ],
    [categoryId, page, pageSize],
  );

  const initialData = useMemo<CategoriesQueryResult | undefined>(() => {
    if (!categoryId && initialOverview) {
      return {
        overview: initialOverview,
      };
    }

    return undefined;
  }, [categoryId, initialOverview]);

  const query = useQuery({
    queryKey,
    enabled,
    queryFn: async (): Promise<CategoriesQueryResult> => {
      const response = await fetchCategories({ categoryId, page, pageSize });

      if (categoryId && "categoryId" in response) {
        const detail = response as CategoryNewsDetailResponse;
        return {
          overview: {
            categories: detail.categories,
            total: detail.categories.length,
          },
          detail,
        };
      }

      return {
        overview: response as CategoriesOverviewResponse,
      };
    },
    initialData,
  });

  const overview = query.data?.overview;

  return {
    categories: overview?.categories ?? [],
    total: overview?.total ?? query.data?.detail?.categories.length ?? 0,
    detail: query.data?.detail,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error : undefined,
    refetch: async () =>
      (await query.refetch({ throwOnError: false })).data ?? query.data,
  };
}
