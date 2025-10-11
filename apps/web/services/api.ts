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

/**
 * Unified API client
 * - Combines News, Bookmarks, Ingest, Games (single & multiplayer), Reels/Explore, Recommendations, and TTS endpoints
 * - Deduplicates helpers and types
 * - Provides resilient `apiFetch` that tolerates empty responses and non-JSON error bodies
 */

// =========================
// Shared types & utilities
// =========================

// Games API types
export interface GameQuestion {
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

export interface Game {
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

export interface StartGameRequest {
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

export interface AnswerQuestionRequest {
  questionId: string;
  answer: string;
  timeSpent: number;
}

export type QueryValue = string | number | boolean | undefined | null;
export type QueryRecord = Record<string, QueryValue>;

export type ApiFetchOptions = RequestInit & {
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
          details = (json as any)?.error ?? (json as any)?.message ?? text;
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

  // Boş response'ları handle et
  const text = await response.text();
  if (!text) {
    // Empty success response
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error: any) {
    // Useful for debugging unexpected HTML/text bodies
    console.error('Failed to parse JSON response:', text);
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

function ensureSuccess<T>(envelope: ApiResponseEnvelope<T>): T {
  if (!envelope.success) {
    console.error('API Error Details:', envelope);
    throw new Error(envelope.error ?? 'Unexpected API error');
  }
  return envelope.data;
}

export type RequestConfig = {
  readonly signal?: AbortSignal;
};

// =========================
// News API
// =========================

export type GetNewsListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly limit?: number;
  readonly categoryId?: string;
  readonly categoryIds?: string[]; // Çoklu kategori desteği
  readonly city?: string;
  readonly isPopular?: boolean;
};

export type GetCategoryNewsParams = {
  readonly categoryId?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type SearchNewsParams = {
  readonly query: string;
  readonly limit?: number;
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
    categoryIds: params.categoryIds?.join(','), // Çoklu kategoriyi virgülle ayırarak gönder
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

// =========================
// Bookmarks API
// =========================

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

// =========================
// News interactions
// =========================

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

// =========================
// Ingest & Admin stats
// =========================

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

// =========================
// Games API (single-player)
// =========================

export async function getAvailableGames(config: RequestConfig = {}) {
  // This endpoint returns a plain object, not ApiResponseEnvelope
  const res = await apiFetch<{
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

  return res;
}

export async function startGame(
  request: StartGameRequest,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<Game>>(
    '/api/games/start',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      headers: {
        'Content-Type': 'application/json',
      },
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

// =========================
// Multiplayer API
// =========================

export async function getGameRooms(
  gameType?: string,
  status?: string,
  limit = 20,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    rooms: Array<{
      id: string;
      name: string;
      gameType: string;
      maxPlayers: number;
      currentPlayers: string[];
      isPrivate: boolean;
      status: string;
      createdAt: string;
      createdBy: string;
    }>;
  }>>(
    '/api/games/rooms',
    {
      query: { gameType, status, limit },
      headers: {
        'Content-Type': 'application/json',
      },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function createGameRoom(
  request: {
    gameType: string;
    roomName: string;
    maxPlayers?: number;
    isPrivate?: boolean;
    password?: string;
  },
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    room: {
      id: string;
      name: string;
      gameType: string;
      maxPlayers: number;
      currentPlayers: string[];
      isPrivate: boolean;
      status: string;
      createdAt: string;
      createdBy: string;
    };
  }>>(
    '/api/games/rooms',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function joinGameRoom(
  roomId: string,
  request: {
    playerName: string;
    password?: string;
  },
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    participant: {
      id: string;
      gameId: string;
      playerId: string;
      playerName: string;
      joinedAt: string;
      isReady: boolean;
      currentScore: number;
    };
  }>>(
    `/api/games/rooms/${roomId}/join`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function leaveGameRoom(
  roomId: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    message: string;
  }>>(
    `/api/games/rooms/${roomId}/leave`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

export async function getGameRoomDetails(
  roomId: string,
  config: RequestConfig = {},
) {
  const envelope = await apiFetch<ApiResponseEnvelope<{
    room: {
      id: string;
      gameId: string;
      name: string;
      gameType: string;
      maxPlayers: number;
      currentPlayers: string[];
      isPrivate: boolean;
      status: string;
      createdAt: string;
      createdBy: string;
    };
    participants: Array<{
      id: string;
      playerId: string;
      playerName: string;
      joinedAt: string;
      isReady: boolean;
      currentScore: number;
    }>;
  }>>(
    `/api/games/rooms/${roomId}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: config.signal,
    },
  );

  return ensureSuccess(envelope);
}

// =========================
// Reels / Explore API
// =========================

export interface ExploreItem {
  kind: 'reel';
  id: string;
  title: string;
  summary: string;
  category: string;
  videoUrl: string;
  thumbUrl: string;
  durationSec: number;
  hrefId: string;
}

export interface ExploreFeedResponse {
  items: ExploreItem[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function fetchExploreFeed(
  params: {
    limit?: number;
    cursor?: string;
    category?: string;
    userId?: string;
  } = {},
  config: RequestConfig = {},
): Promise<ExploreFeedResponse> {
  const response = await apiFetch<ExploreFeedResponse>(
    '/api/reels/explore',
    {
      query: {
        limit: params.limit || 24,
        cursor: params.cursor,
        category: params.category,
        userId: params.userId,
      },
      signal: config.signal,
    },
  );

  return response;
}

export interface ReelListItem {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds: number;
  category: string;
  created_at: string;
  status: string;
}

export interface ReelListResponse {
  reels: ReelListItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchReelsList(
  params: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
  } = {},
  config: RequestConfig = {},
): Promise<ReelListResponse> {
  const response = await apiFetch<ReelListResponse>(
    '/api/reels/list',
    {
      query: {
        limit: params.limit || 20,
        offset: params.offset || 0,
        status: params.status,
        category: params.category,
      },
      signal: config.signal,
    },
  );

  return response;
}

export interface ReelDetail {
  id: string;
  content: {
    headline: string;
    summary_sentences?: string[];
    captions?: string;
    hashtags?: string[];
  };
  assets: {
    video_url?: string;
    thumbnail_url?: string;
    background_image?: string;
  };
  duration_seconds: number;
  category: string;
  engagement_score: number;
  published_at: string;
  created_at: string;
  news_id: string;
  status: string;
}

export async function fetchReelById(
  id: string,
  config: RequestConfig = {},
): Promise<ReelDetail> {
  const response = await apiFetch<ReelDetail>(
    `/api/reels/${id}`,
    {
      signal: config.signal,
    },
  );

  return response;
}

export interface NextReelResponse {
  item: {
    id: string;
    title: string;
    summary: string;
    category: string;
    videoUrl: string;
    thumbUrl: string;
    durationSec: number;
    hrefId: string;
  };
}

export async function fetchNextReel(
  currentId: string,
  params: {
    dir?: 'up' | 'down';
    category?: string;
    userId?: string;
  } = {},
  config: RequestConfig = {},
): Promise<NextReelResponse> {
  const response = await apiFetch<NextReelResponse>(
    `/api/reels/${currentId}/next`,
    {
      query: {
        dir: params.dir || 'up',
        category: params.category,
        userId: params.userId,
      },
      signal: config.signal,
    },
  );

  return response;
}

// =========================
// Recommendations API
// =========================

export async function postRecommendations(limit = 20, config: RequestConfig = {}) {
  const data = await apiFetch<{ ok: boolean; items: any[] }>(
    '/api/v1/recommendations',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'news', limit }),
      signal: config.signal,
    },
  );
  return data;
}

// =========================
// TTS API
// =========================

export interface TTSGenerateRequest {
  newsId: string;
  contentType: 'summary' | 'full';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
}

export interface TTSAudioResponse {
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
