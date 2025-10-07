import { render, screen } from '@testing-library/react';
import type {
  CategoriesOverviewResponse,
  NewsListDataPayload,
  NewsWithMediaDto,
} from '@nexachron/shared-types';
import type { DashboardTopic } from './_components/types';
import { Dashboard } from './_components/dashboard';
import { describe, expect, it, vi } from 'vitest';

const sampleNewsItem: NewsWithMediaDto = {
  id: 'news-1',
  title: 'Test Haber',
  content: 'Test içeriği detaylı bilgiler içeriyor.',
  summary: 'Test içeriği detaylı bilgiler içeriyor.',
  categoryId: 'gundem',
  city: 'İstanbul',
  isPopular: false,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  publishedAt: null,
  media: [],
  primaryMedia: null,
};

const initialNews: NewsListDataPayload = {
  items: [sampleNewsItem],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 1,
    hasMore: false,
  },
};

const topics: DashboardTopic[] = [
  {
    id: 'topic-test',
    title: 'Test Başlığı',
    change: '+1.2%',
    sentiment: 'positive',
    description: 'Test açıklaması',
    icon: 'TT',
  },
];

const categoriesOverview: CategoriesOverviewResponse = {
  categories: [
    {
      id: 'gundem',
      label: 'Gündem',
      total: 1,
    },
  ],
  total: 1,
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/use-news', () => ({
  useNews: () => ({
    data: [sampleNewsItem],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 1,
      hasMore: false,
    },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-categories', () => ({
  useCategories: () => ({
    categories: [
      {
        id: 'gundem',
        label: 'Gündem',
        total: 1,
      },
    ],
    total: 1,
    detail: undefined,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

describe('Dashboard component', () => {
  it('renders news headline and section title', () => {
    render(
      <Dashboard
        initialNews={initialNews}
        topics={topics}
        categoriesOverview={categoriesOverview}
      />,
    );

    expect(screen.getByText('Test Haber')).toBeInTheDocument();
    expect(screen.getByText('Günün Öne Çıkan Haberleri')).toBeInTheDocument();
  });
});
