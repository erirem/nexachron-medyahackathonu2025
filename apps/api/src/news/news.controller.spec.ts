import { InternalServerErrorException } from '@nestjs/common';
import type {
  CategoriesOverviewResponse,
  CategoryNewsDetailResponse,
  DashboardNewsDataPayload,
  FindNewsResult,
  NewsWithMediaDto,
} from '@nexachron/shared-types';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;
  let newsService: jest.Mocked<NewsService>;

  const sampleNewsItem: NewsWithMediaDto = {
    id: 'news-1',
    title: 'Test Haber',
    content: 'Test içeriği özet bilgilerle birlikte yer alıyor.',
    summary: 'Test içeriği özet bilgilerle birlikte yer alıyor.',
    categoryId: 'gundem',
    city: 'Ankara',
    isPopular: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    publishedAt: null,
    media: [
      {
        id: 'media-1',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60',
        type: 'image',
        order: 1,
      },
    ],
    primaryMedia: {
      id: 'media-1',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60',
      type: 'image',
      order: 1,
    },
  };

  beforeEach(() => {
    newsService = {
      findAll: jest.fn(),
      getDashboardNews: jest.fn(),
      getTrendingNews: jest.fn(),
      getNewsByCategory: jest.fn(),
      searchNews: jest.fn(),
      getCategories: jest.fn(),
    } as unknown as jest.Mocked<NewsService>;

    controller = new NewsController(newsService);
  });

  describe('getDashboard', () => {
    it('returns dashboard news payload', async () => {
      const dashboardData: DashboardNewsDataPayload = {
        items: [sampleNewsItem],
        total: 1,
      };
      newsService.getDashboardNews.mockResolvedValue(dashboardData.items);

      const response = await controller.getDashboard('tr');

      expect(response.success).toBe(true);
      expect(response.data.items).toHaveLength(1);
      expect(response.data.total).toBe(1);
    });

    it('throws when service fails', async () => {
      newsService.getDashboardNews.mockRejectedValue(new Error('boom'));

      await expect(controller.getDashboard('tr')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findNews', () => {
    it('returns items with pagination', async () => {
      const result: FindNewsResult = {
        items: [sampleNewsItem],
        total: 5,
      };
      newsService.findAll.mockResolvedValue(result);

      const response = await controller.findNews(
        undefined,
        undefined,
        '5',
        undefined,
        undefined,
        undefined,
        'tr',
      );

      expect(response.success).toBe(true);
      expect(response.data.items).toHaveLength(1);
      expect(response.data.pagination.total).toBe(5);
      expect(response.data.pagination.pageSize).toBe(5);
    });
  });

  describe('getCategories', () => {
    it('returns overview when categoryId missing', async () => {
      const overview: CategoriesOverviewResponse = {
        categories: [
          {
            id: 'gundem',
            label: 'Gündem',
            total: 4,
          },
        ],
        total: 1,
      };
      newsService.getCategories.mockResolvedValue(overview);

      const response = await controller.getCategories(
        undefined,
        undefined,
        undefined,
        'tr',
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(overview);
    });

    it('returns detail when categoryId provided', async () => {
      const detail: CategoryNewsDetailResponse = {
        categoryId: 'gundem',
        categories: [
          {
            id: 'gundem',
            label: 'Gündem',
            total: 2,
          },
        ],
        items: [sampleNewsItem],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 1,
          hasMore: false,
        },
      };
      newsService.getCategories.mockResolvedValue({
        categories: detail.categories,
        total: detail.categories.length,
      });
      newsService.getNewsByCategory.mockResolvedValue({
        items: detail.items,
        total: 1,
      });

      const response = await controller.getCategories(
        'gundem',
        undefined,
        undefined,
        'tr',
      );

      expect(response.success).toBe(true);
      expect(response.data.categoryId).toBe('gundem');
      expect(response.data.items).toHaveLength(1);
    });
  });

  describe('getTrending', () => {
    it('returns trending news', async () => {
      newsService.getTrendingNews.mockResolvedValue({
        items: [sampleNewsItem],
        total: 1,
      });

      const response = await controller.getTrending('tr');

      expect(response.success).toBe(true);
      expect(response.data.items).toHaveLength(1);
      expect(response.data.total).toBe(1);
    });
  });

  describe('search', () => {
    it('returns empty result when query missing', async () => {
      const response = await controller.search('', undefined, 'tr');

      expect(response.success).toBe(true);
      expect(response.data.total).toBe(0);
    });

    it('returns results for query', async () => {
      newsService.searchNews.mockResolvedValue({
        items: [sampleNewsItem],
        total: 1,
      });

      const response = await controller.search('Test', undefined, 'tr');

      expect(response.success).toBe(true);
      expect(response.data.items).toHaveLength(1);
      expect(response.data.total).toBe(1);
    });
  });
});
