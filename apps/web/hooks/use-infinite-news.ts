'use client';

import { useState, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NewsListDataPayload } from '@nexachron/shared-types';
import { fetchNewsList } from '@/services/api';

type UseInfiniteNewsOptions = {
  readonly categoryId?: string;
  readonly categoryIds?: string[]; // Çoklu kategori desteği
  readonly city?: string;
  readonly isPopular?: boolean;
  readonly initialData?: NewsListDataPayload;
  // For mapping the filter categories to API parameters
  readonly filterCategory?: string;
};

export function useInfiniteNews(options: UseInfiniteNewsOptions = {}) {
  const { categoryId, categoryIds, city, isPopular, initialData, filterCategory } = options;

  // Map UI filter to backend parameters
  const resolveParams = useCallback(() => {
    const params = { 
      page: 1 as number, 
      pageSize: 10, 
      categoryId: undefined as string | undefined, 
      categoryIds: undefined as string[] | undefined, // Çoklu kategori desteği
      city: undefined as string | undefined, 
      isPopular: undefined as boolean | undefined,
      limit: 10 as number,
    };

    // If multiple category IDs are provided, use them
    if (categoryIds && categoryIds.length > 0) {
      params.categoryIds = categoryIds;
      params.limit = undefined; // Use pagination when filtering by categories
    }
    // If a specific category ID is provided, use it directly
    else if (categoryId) {
      params.categoryId = categoryId;
      params.limit = undefined; // Use pagination when filtering by category
    } 
    // If a filter category is provided, map it to backend category
    else if (filterCategory) {
      switch (filterCategory) {
        case 'gundem':
          params.categoryId = 'gundem';
          break;
        case 'finans':
          params.categoryId = 'finans';
          break;
        case 'savunma':
          params.categoryId = 'savunma';
          break;
        case 'enerji':
          params.categoryId = 'enerji';
          break;
        case 'teknoloji':
          params.categoryId = 'teknoloji';
          break;
        case 'spor':
          params.categoryId = 'spor';
          break;
        case 'ekonomi':
          params.categoryId = 'ekonomi';
          break;
        case 'saglik':
          params.categoryId = 'saglik';
          break;
        case 'dunya':
          params.categoryId = 'dunya';
          break;
        case 'politika':
          params.categoryId = 'politika';
          break;
        case 'diplomasi':
          params.categoryId = 'diplomasi';
          break;
        case 'cevre':
          params.categoryId = 'cevre';
          break;
        case 'turizm':
          params.categoryId = 'turizm';
          break;
        case 'tarim':
          params.categoryId = 'tarim';
          break;
        case 'kultur':
          params.categoryId = 'kultur';
          break;
        case 'sanat':
          params.categoryId = 'sanat';
          break;
        case 'egitim':
          params.categoryId = 'egitim';
          break;
        case 'bilim':
          params.categoryId = 'bilim';
          break;
        case 'yasam':
          params.categoryId = 'yasam';
          break;
        case 'magazin':
          params.categoryId = 'magazin';
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
  }, [categoryId, categoryIds, city, isPopular, filterCategory]);

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
    queryKey: ['infinite-news', { categoryId, categoryIds, city, isPopular, filterCategory }],
    queryFn: ({ pageParam = 1 }) => {
      const params = resolveParams();
      return fetchNewsList({ 
        ...params,
        page: pageParam,
        pageSize: params.pageSize || 10,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more pages based on the pagination response
      const hasMore = lastPage.pagination?.hasMore ?? false;

      if (hasMore) {
        // Use the current page from pagination response, or fallback to allPages.length + 1
        const currentPage = lastPage.pagination?.page ?? allPages.length;
        return currentPage + 1;
      }

      // If no pagination info or no more items, return undefined to stop loading
      return undefined;
    },
    initialData: initialData ? { pages: [initialData], pageParams: [1] } : undefined,
  });

  // Flatten all pages into a single list
  const allNews = data?.pages.flatMap(page => page.items) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      return fetchNextPage();
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