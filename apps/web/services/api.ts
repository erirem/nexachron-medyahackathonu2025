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

// Games API types
interface GameQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  source: 'manual' | 'news_ai' | 'news_manual';
  sourceNewsId?: string;
  gameType: 'quiz' | 'news_trivia' | 'memory' | 'wordle' | 'word_puzzle' | 'timeline' | 'spot_difference';
  createdAt: string;
}

interface Game {
  id: string;
  gameType: string;
  mode: 'single' | 'multiplayer';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  timeLimit?: number;
  startedAt?: string;
  completedAt?: string;
  questions: GameQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
}

interface StartGameRequest {
  gameType: string;
  mode: 'single' | 'multiplayer';
  filter?: {
    gameType?: string;
    category?: string;
    difficulty?: string;
    source?: string;
    limit?: number;
  };
}

interface AnswerQuestionRequest {
  questionId: string;
  answer: string;
  timeSpent: number;
}

type QueryValue = string | number | boolean | undefined | null;

type QueryRecord = Record<string, QueryValue>;

type ApiFetchOptions = RequestInit & {
  readonly query?: QueryRecord;
  readonly signal?: AbortSignal;
};

// Geliştirme ortamında .env tanımlı değilse API'yi localhost:4000'a sabitle
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

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
    let details = '';
    try {
      const text = await response.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          // Try common error shapes
          details = json?.error ?? json?.message ?? text;
        } catch {
          details = text;
        }
      }
    } catch {
      // ignore body read errors
    }

    const message = `API request failed with status ${response.status} ${response.statusText} at ${url}${details ? `: ${details}` : ''}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function ensureSuccess<T>(envelope: ApiResponseEnvelope<T>): T {
  if (!envelope.success) {
    console.error('API Error Details:', envelope);
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
    sample: unknown[];
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
    result?: unknown;
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

// Games API functions
export async function getAvailableGames(config: RequestConfig = {}) {
  const envelope = await apiFetch<{
    games: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      difficulty: string;
      xpReward: number;
      isAvailable: boolean;
      supportsMultiplayer: boolean;
    }>;
  }>('/api/games', { signal: config.signal });

  return envelope;
}

export async function startGame(
  request: StartGameRequest,
  config: RequestConfig = {},
) {
  const authHeaders = await buildAuthHeader();
  const envelope = await apiFetch<ApiResponseEnvelope<Game>>(
    '/api/games/start',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(request),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function answerQuestion(
  gameId: string,
  request: AnswerQuestionRequest,
  config: RequestConfig = {},
) {
  const authHeaders = await buildAuthHeader();
  const envelope = await apiFetch<ApiResponseEnvelope<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
    score: number;
    timeSpent: number;
  }>>(
    `/api/games/${gameId}/answer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(request),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function getGameHistory(
  gameType?: string,
  config: RequestConfig = {},
) {
  const authHeaders = await buildAuthHeader();
  const envelope = await apiFetch<ApiResponseEnvelope<{
    games: Array<{
      id: string;
      gameType: string;
      score: number;
      totalQuestions: number;
      completedAt: string;
    }>;
  }>>(
    '/api/games/history',
    {
      query: gameType ? { gameType } : undefined,
      headers: authHeaders,
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function generateNewsTriviaQuestions(config: RequestConfig = {}) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    success: boolean;
    message: string;
    questionsGenerated: number;
  }>>(
    '/api/games/questions/refresh',
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
    items: unknown[];
  }>>(
    `/api/news-ingest/category/${category}`,
    {
      method: 'POST',
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

// Recommendations API
export async function postRecommendations(limit = 20, config: RequestConfig = {}) {
  const url = buildUrl('/api/v1/recommendations');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // inline body because ApiFetchOptions in this file omits 'body'
    // and we are using native fetch directly here
    body: JSON.stringify({ type: 'news', limit }) as any,
    signal: config.signal,
    cache: 'no-store',
  } as RequestInit);

  if (!response.ok) {
    let details = '';
    try {
      const text = await response.text();
      if (text) {
        try { details = (JSON.parse(text)?.error) ?? text; } catch { details = text; }
      }
    } catch {}
    throw new Error(`Recommendations failed: ${response.status} ${response.statusText}${details ? `: ${details}` : ''}`);
  }

  const data = await response.json();
  return data as { ok: boolean; items: any[] };
}

// TTS API types
interface TTSGenerateRequest {
  newsId: string;
  contentType: 'summary' | 'full';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
}

interface TTSAudioResponse {
  id: string;
  newsId: string;
  contentType: string;
  voice: string;
  speed: number;
  audioUrl: string;
  fileSizeBytes: number;
  durationSeconds: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// TTS API functions
export async function generateTTS(
  request: TTSGenerateRequest,
  config: RequestConfig = {},
): Promise<TTSAudioResponse> {
  const envelope = await apiFetch<TTSAudioResponse>(
    '/api/tts/generate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: config.signal,
    },
  );

  return envelope;
}

export async function getTTSAudio(
  id: string,
  config: RequestConfig = {},
): Promise<TTSAudioResponse> {
  const envelope = await apiFetch<TTSAudioResponse>(
    `/api/tts/${id}`,
    { signal: config.signal },
  );

  return envelope;
}