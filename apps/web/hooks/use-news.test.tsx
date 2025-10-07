import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NewsListDataPayload, NewsWithMediaDto } from '@nexachron/shared-types';

vi.mock('@/services/api', () => ({
  fetchNewsList: vi.fn(),
}));

import { fetchNewsList } from '@/services/api';
import { useNews } from './use-news';

const sampleNews: NewsWithMediaDto = {
  id: 'news-1',
  title: 'Test Haber',
  content: 'Test içeriği, hızlı okuma özeti ve detaylarla birlikte.',
  summary: 'Test içeriği, hızlı OKuma özeti ve detaylarla birlikte.',
  categoryId: 'gundem',
  city: 'İstanbul',
  isPopular: false,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  publishedAt: null,
  media: [],
  primaryMedia: null,
};

const samplePayload: NewsListDataPayload = {
  items: [sampleNews],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 1,
    hasMore: false,
  },
};

describe('useNews', () => {
  const mockedFetch = fetchNewsList as unknown as Mock;

  afterEach(() => {
    mockedFetch.mockReset();
  });

  it('returns news items from the API', async () => {
    mockedFetch.mockResolvedValue(samplePayload);

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const client = new QueryClient();
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };

    const { result } = renderHook(() => useNews({ limit: 10 }), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('news-1');
    });
  });

  it('uses initial data when provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const client = new QueryClient();
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };

    const { result } = renderHook(
      () => useNews({ initialData: samplePayload, limit: 10 }),
      { wrapper },
    );

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('news-1');
  });
});
