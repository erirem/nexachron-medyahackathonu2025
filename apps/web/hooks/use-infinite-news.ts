'use client';

import { useState, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NewsListDataPayload } from '@nexachron/shared-types';
import { fetchNewsList } from '@/services/api';

type UseInfiniteNewsOptions = {
  readonly categoryId?: string;
  readonly city?: string;
  readonly isPopular?: boolean;
  readonly initialData?: NewsListDataPayload;
  // For mapping the filter categories to API parameters
  readonly filterCategory?: string;
};

export function useInfiniteNews(options: UseInfiniteNewsOptions = {}) {
  const { categoryId, city, isPopular, initialData, filterCategory } = options;

  // Map UI filter to backend parameters
  const resolveParams = useCallback(() => {
    let params = { 
      page: 1 as number, 
      pageSize: 10, 
      categoryId: undefined as string | undefined, 
      city: undefined as string | undefined, 
      isPopular: undefined as boolean | undefined,
      limit: 10 as number,
    };

    // If a specific category ID is provided, use it
    if (categoryId) {
      params.categoryId = categoryId;
    } 
    // If a filter category is provided, map it to backend category
    else if (filterCategory) {
      switch (filterCategory) {
        case 'gundem':
          params.categoryId = 'guncel';
          break;
        case 'finans':
          params.categoryId = 'ekonomi';
          break;
        case 'savunma':
          params.categoryId = 'dunya';
          break;
        case 'enerji':
          params.categoryId = 'dunya';
          break;
        case 'teknoloji':
          params.categoryId = 'teknoloji';
          break;
        default:
          params.limit = 20; // Default when no specific category
      }
    } 
    // Otherwise use general parameters
    else {
      params.limit = 20;
    }

    // Apply popularity filter if specified
    if (isPopular !== undefined) {
      params.isPopular = isPopular;
    }

    // Apply city filter if specified
    if (city) {
      params.city = city;
    }

    return params;
  }, [categoryId, city, isPopular, filterCategory]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['infinite-news', { categoryId, city, isPopular, filterCategory }],
    queryFn: ({ pageParam = 1 }) => {
      const params = resolveParams();
      return fetchNewsList({ 
        ...params,
        page: pageParam, 
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const hasMore = lastPage.pagination?.hasMore ?? false;
      const total = lastPage.pagination?.total ?? 0;
      const loadedCount = allPages.reduce((acc, page) => acc + page.items.length, 0);
      
      // If there are more items to load, return next page number
      if (hasMore || loadedCount < total) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialData: initialData ? { pages: [initialData], pageParams: [1] } : undefined,
  });

  // Flatten all pages into a single list
  const allNews = data?.pages.flatMap(page => page.items) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    news: allNews,
    loadMore,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
  };
}