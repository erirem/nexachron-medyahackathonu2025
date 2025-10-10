import { z } from 'zod';
import { AACategory } from '../../news-ingest/dto/news-item.dto';

// Oyun türleri
export enum GameType {
  QUIZ = 'quiz',                    // Genel quiz soruları
  NEWS_TRIVIA = 'news_trivia',       // Haber trivia (AA haberlerinden)
  MEMORY = 'memory',
  WORDLE = 'wordle',
  WORD_PUZZLE = 'word_puzzle',
  TIMELINE = 'timeline',
  SPOT_DIFFERENCE = 'spot_difference',
}

// Oyun zorluk seviyeleri
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// Oyun modları
export enum GameMode {
  SINGLE_PLAYER = 'single_player',
  MULTIPLAYER = 'multiplayer',
}

// Soru türleri
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  SEQUENCE = 'sequence',
}

// Soru kaynak türleri
export enum QuestionSource {
  MANUAL = 'manual',           // Manuel eklenen quiz soruları
  NEWS_AI = 'news_ai',         // AA haberlerinden GPT ile üretilen
  NEWS_MANUAL = 'news_manual', // AA haberlerinden manuel eklenen
}

// Oyun durumu
export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Soru şeması
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string()).optional(), // Çoktan seçmeli için
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  difficulty: z.nativeEnum(DifficultyLevel),
  category: z.nativeEnum(AACategory),
  source: z.nativeEnum(QuestionSource), // Soru kaynağı
  sourceNewsId: z.string().uuid().optional(), // Hangi habere dayalı (sadece news soruları için)
  gameType: z.nativeEnum(GameType), // Hangi oyun türü için
  createdAt: z.date(),
});

export type Question = z.infer<typeof QuestionSchema>;

// Oyun şeması
export const GameSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(GameType),
  mode: z.nativeEnum(GameMode),
  status: z.nativeEnum(GameStatus),
  questions: z.array(QuestionSchema),
  currentQuestionIndex: z.number().min(0),
  timeLimit: z.number().optional(), // Saniye cinsinden
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdBy: z.string().uuid(),
});

export type Game = z.infer<typeof GameSchema>;

// Oyun sonucu
export const GameResultSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  playerId: z.string().uuid(),
  score: z.number().min(0),
  totalQuestions: z.number().min(1),
  correctAnswers: z.number().min(0),
  timeSpent: z.number().min(0), // Saniye cinsinden
  xpEarned: z.number().min(0),
  rank: z.number().optional(), // Multiplayer'da sıralama
  completedAt: z.date(),
});

export type GameResult = z.infer<typeof GameResultSchema>;

// Multiplayer oda şeması
export const GameRoomSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  name: z.string(),
  maxPlayers: z.number().min(2).max(8),
  currentPlayers: z.array(z.string().uuid()),
  isPrivate: z.boolean(),
  password: z.string().optional(),
  status: z.nativeEnum(GameStatus),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdBy: z.string().uuid(),
});

export type GameRoom = z.infer<typeof GameRoomSchema>;

// Oyun katılımcısı
export const GameParticipantSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  playerId: z.string().uuid(),
  playerName: z.string(),
  playerAvatar: z.string().optional(),
  joinedAt: z.date(),
  isReady: z.boolean().default(false),
  currentScore: z.number().min(0).default(0),
  currentQuestionIndex: z.number().min(0).default(0),
});

export type GameParticipant = z.infer<typeof GameParticipantSchema>;

// Soru havuzu filtresi
export const QuestionPoolFilterSchema = z.object({
  gameType: z.nativeEnum(GameType), // Hangi oyun türü için sorular
  category: z.nativeEnum(AACategory).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  source: z.nativeEnum(QuestionSource).optional(), // Soru kaynağı filtresi
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  limit: z.number().min(1).max(50).default(5),
});

export type QuestionPoolFilter = z.infer<typeof QuestionPoolFilterSchema>;

// Oyun başlatma isteği
export const StartGameRequestSchema = z.object({
  gameType: z.nativeEnum(GameType),
  mode: z.nativeEnum(GameMode),
  filter: QuestionPoolFilterSchema.optional(),
  timeLimit: z.number().min(30).max(300).optional(), // 30 saniye - 5 dakika
  roomName: z.string().optional(), // Multiplayer için
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
});

export type StartGameRequest = z.infer<typeof StartGameRequestSchema>;

// Soru cevaplama isteği
export const AnswerQuestionRequestSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string(),
  timeSpent: z.number().min(0), // Saniye cinsinden
});

export type AnswerQuestionRequest = z.infer<typeof AnswerQuestionRequestSchema>;
