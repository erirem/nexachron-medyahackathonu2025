"use client";
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchExploreFeed } from '../../services/api';
import type { ExploreFeedResponse } from '../../services/api';

export function useReelFeed(options?: {
    category?: string;
    userId?: string;
}) {
    return useInfiniteQuery<ExploreFeedResponse>({
        queryKey: ['explore-feed', options?.category, options?.userId],
        queryFn: async ({ pageParam }) => {
            const response = await fetchExploreFeed({
                limit: 24,
                cursor: pageParam as string | undefined,
                category: options?.category,
                userId: options?.userId,
            });
            return response;
        },
        initialPageParam: '0',
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.nextCursor : undefined;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    });
}



