import type {
  ApiResponseEnvelope,
  CategoryNewsDetailResponse,
  CategoriesOverviewResponse,
  DashboardNewsDataPayload,
  NewsListDataPayload,
  SearchNewsDataPayload,
  TrendingNewsDataPayload,
  NewsWithMediaDto,
} from '@nexachron/shared-types';

type QueryValue = string | number | boolean | undefined | null;

type QueryRecord = Record<string, QueryValue>;

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  readonly query?: QueryRecord;
  readonly signal?: AbortSignal;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

function assertApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('API URL is not configured. Set NEXT_PUBLIC_API_URL.');
  }
  return API_BASE_URL;
}

function buildUrl(path: string, query?: QueryRecord): string {
  const baseUrl = assertApiUrl();
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, `${baseUrl}/`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { query, signal, headers, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...rest,
    method: rest.method ?? 'GET',
    signal,
    headers: {
      Accept: 'application/json',
      ...(headers ?? {}),
    },
    cache: rest.cache ?? 'no-store',
  });

  if (!response.ok) {
    const message = `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function ensureSuccess<T>(envelope: ApiResponseEnvelope<T>): T {
  if (!envelope.success) {
    throw new Error(envelope.error ?? 'Unexpected API error');
  }
  return envelope.data;
}

type GetNewsListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly limit?: number;
  readonly categoryId?: string;
  readonly city?: string;
  readonly isPopular?: boolean;
};

type GetCategoryNewsParams = {
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

type SearchNewsParams = {
  readonly query: string;
  readonly limit?: number;
};

type RequestConfig = {
  readonly signal?: AbortSignal;
};

export async function fetchNewsList(
  params: GetNewsListParams = {},
  config: RequestConfig = {},
) {
  const query: QueryRecord = {
    page: params.page,
    pageSize: params.pageSize,
    limit: params.limit,
    categoryId: params.categoryId,
    city: params.city,
    isPopular:
      typeof params.isPopular === 'boolean' ? String(params.isPopular) : undefined,
  };

  const envelope = await apiFetch<ApiResponseEnvelope<NewsListDataPayload>>(
    '/api/news',
    {
      query,
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function fetchDashboardNews(config: RequestConfig = {}) {
  const envelope = await apiFetch<ApiResponseEnvelope<DashboardNewsDataPayload>>(
    '/api/news/dashboard',
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchCategories(
  params: GetCategoryNewsParams = {},
  config: RequestConfig = {},
): Promise<CategoriesOverviewResponse | CategoryNewsDetailResponse> {
  const query: QueryRecord = {
    categoryId: params.categoryId,
    page: params.page,
    pageSize: params.pageSize,
  };

  const envelope = await apiFetch<
    ApiResponseEnvelope<CategoriesOverviewResponse | CategoryNewsDetailResponse>
  >('/api/news/categories', {
    query,
    signal: config.signal,
  });

  return ensureSuccess(envelope);
}

export async function fetchTrendingNews(
  limit = 20,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<TrendingNewsDataPayload>>(
    '/api/news/trending',
    {
      query: { limit },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function searchNews(
  params: SearchNewsParams,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<SearchNewsDataPayload>>(
    '/api/news/search',
    {
      query: {
        q: params.query,
        limit: params.limit,
      },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function fetchPopularNews(
  limit = 10,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<DashboardNewsDataPayload>>(
    '/api/news/popular',
    {
      query: { limit },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsByMode(
  mode: string,
  limit = 20,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<NewsListDataPayload>>(
    `/api/news/mode/${mode}`,
    {
      query: { limit },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsById(
  id: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<NewsWithMediaDto>>(
    `/api/news/${id}`,
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

// Bookmarks API
export async function fetchBookmarks(config: RequestConfig = {}) {
  const envelope = await apiFetch<
    ApiResponseEnvelope<
      Array<{
        news_id: string;
        created_at: string;
        news?: {
          id: string;
          title: string;
          content: string;
          summary: string | null;
          category: string | null;
          city: string | null;
          is_popular: boolean;
          created_at: string;
          updated_at: string | null;
          media_summary: string | null;
        } | null;
      }>
    >
  >('/api/bookmarks', {
    headers: await buildAuthHeader(),
    signal: config.signal,
  });
  return ensureSuccess(envelope);
}

export async function addBookmark(newsId: string, config: RequestConfig = {}) {
  const envelope = await apiFetch<ApiResponseEnvelope<{ newsId: string }>>(
    `/api/bookmarks/${newsId}`,
    {
      method: 'POST',
      headers: await buildAuthHeader(),
      signal: config.signal,
    },
  );
  return ensureSuccess(envelope);
}

export async function removeBookmark(newsId: string, config: RequestConfig = {}) {
  const envelope = await apiFetch<ApiResponseEnvelope<{ newsId: string }>>(
    `/api/bookmarks/${newsId}`,
    {
      method: 'DELETE',
      headers: await buildAuthHeader(),
      signal: config.signal,
    },
  );
  return ensureSuccess(envelope);
}

async function buildAuthHeader(): Promise<Record<string, string>> {
  try {
    const { getAccessToken } = await import('../lib/supabase/client');
    const token = await getAccessToken(true);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function addCommentToNews(
  id: string,
  userId: string,
  comment: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<NewsWithMediaDto>>(
    `/api/news/${id}/comment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, comment }),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function addReactionToNews(
  id: string,
  userId: string,
  emoji: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<NewsWithMediaDto>>(
    `/api/news/${id}/reaction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, emoji }),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestStats(
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    totalNews: number;
    todayNews: number;
    lastIngestion: Date | null;
    categoryCounts: Record<string, number>;
  }>>(
    '/api/news-ingest/stats',
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestCategories(
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    categories: Array<{
      key: string;
      name: string;
      description: string;
    }>;
  }>>(
    '/api/news-ingest/categories',
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestAIUsage(
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    totalRequests: number;
    dailyLimit: number;
    remainingDailyRequests: number;
    budgetStatus: string;
    timestamp: string;
  }>>(
    '/api/news-ingest/ai-usage',
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestMediaStats(
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    totalMediaItems: number;
    imagesCount: number;
    videosCount: number;
    averageMediaPerArticle: number;
    timestamp: string;
  }>>(
    '/api/news-ingest/media-stats',
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestRecentMedia(
  limit = 10,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    articles: Array<{
      id: string;
      title: string;
      mediaCount: number;
      imagesCount: number;
      videosCount: number;
      hasGallery: boolean;
    }>;
    timestamp: string;
  }>>(
    `/api/news-ingest/recent-media/${limit}`,
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function fetchNewsIngestTestCategory(
  category: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    category: string;
    rssUrl: string;
    itemCount: number;
    sample: any[];
  }>>(
    `/api/news-ingest/test/${category}`,
    { signal: config.signal },
  );

  return ensureSuccess(envelope);
}

export async function processSingleNewsUrl(
  url: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    success: boolean;
    result?: any;
    error?: string;
  }>>(
    '/api/news-ingest/single',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function triggerManualNewsIngest(
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    success: boolean;
    processed: number;
    errors: number;
  }>>(
    '/api/news-ingest/manual',
    {
      method: 'POST',
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function triggerCategoryNewsIngest(
  category: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
    category: string;
    processed: number;
    items: any[];
  }>>(
    `/api/news-ingest/category/${category}`,
    {
      method: 'POST',
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}
