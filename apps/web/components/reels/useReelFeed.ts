"use client";
import { useInfiniteQuery } from '@tanstack/react-query';
import { getProfileVector, serializeProfileVector } from '../../lib/recommend';
import type { ExplorePage } from '../../lib/types/reels';

export function useReelFeed() {
    return useInfiniteQuery<ExplorePage>({
        queryKey: ['explore', getProfileVector()],
        queryFn: async ({ pageParam }) => {
            const profile = serializeProfileVector();
            const url = `/api/explore?limit=24&profile=${profile}${pageParam ? `&cursor=${pageParam}` : ''}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        initialPageParam: '0',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}



