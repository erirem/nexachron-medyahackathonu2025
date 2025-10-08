"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchBookmarks } from '@/services/api';

export function useBookmarks() {
  const query = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      try {
        const rows = await fetchBookmarks();
        const ids = new Set(rows.map((i) => i.news_id));
        // Haber detayını varsa normalize edip döndür
        const items = rows
          .map((r) => r.news)
          .filter(Boolean) as Array<NonNullable<(typeof rows)[number]['news']>>;
        return { items, ids } as const;
      } catch (error) {
        // Unauthorized ise boş dön
        return { items: [], ids: new Set<string>() } as const;
      }
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return {
    bookmarks: query.data?.items ?? [],
    bookmarkedIds: query.data?.ids ?? new Set<string>(),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  } as const;
}


