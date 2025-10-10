import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { QuestionGenerationService } from './services/question-generation.service';
import { QuizGameService } from './services/quiz-game.service';
import { MultiplayerService } from './services/multiplayer.service';
import { GamificationService } from './services/gamification.service';
import {
  Game,
  GameResult,
  GameStatus,
  GameType,
  GameMode,
  StartGameRequest,
  AnswerQuestionRequest,
  QuestionPoolFilter,
} from './dto/game.dto';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly questionGenerationService: QuestionGenerationService,
    private readonly quizGameService: QuizGameService,
    private readonly multiplayerService: MultiplayerService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Kullanıcının var olup olmadığını kontrol et, yoksa oluştur
   */
  private async ensureUserExists(userId: string): Promise<void> {
    try {
      // Kullanıcının var olup olmadığını kontrol et
      const { data: existingUser, error: fetchError } = await this.supabaseService.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = "not found" hatası, diğer hatalar gerçek hatalar
        throw new Error(`Failed to check user existence: ${fetchError.message}`);
      }

      if (!existingUser) {
        // Kullanıcı yoksa oluştur
        this.logger.log(`User ${userId} not found, creating...`);
        
        // Supabase auth'dan kullanıcı bilgilerini al
        const { data: authUser, error: authError } = await this.supabaseService.adminSupabase.auth.admin.getUserById(userId);
        
        if (authError || !authUser.user) {
          throw new Error(`Failed to get user from auth: ${authError?.message || 'User not found in auth'}`);
        }

        // RLS'i bypass etmek için adminSupabase kullan
        const { error: createError } = await this.supabaseService.adminSupabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email || `${userId}@temp.com`, // Email yoksa geçici email
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`);
        }
        this.logger.log(`User ${userId} created successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure user exists: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mevcut oyunları listele
   */
  async getAvailableGames() {
    return {
      games: [
        {
          id: GameType.QUIZ,
          name: 'Genel Quiz',
          description: 'Genel bilgi sorularıyla bilginizi test edin',
          icon: '🧠',
          category: 'educational',
          difficulty: 'easy',
          xpReward: 30,
          isAvailable: true,
          supportsMultiplayer: true,
        },
        {
          id: GameType.NEWS_TRIVIA,
          name: 'Haber Trivia',
          description: 'Güncel haberlerden sorularla bilginizi test edin',
          icon: '📰',
          category: 'news',
          difficulty: 'easy',
          xpReward: 35,
          isAvailable: true,
          supportsMultiplayer: true,
        },
        {
          id: GameType.MEMORY,
          name: 'Haber Hafızası',
          description: 'Haber başlıklarını eşleştirin',
          icon: '🧩',
          category: 'memory',
          difficulty: 'medium',
          xpReward: 25,
          isAvailable: true,
          supportsMultiplayer: false,
        },
        {
          id: GameType.WORDLE,
          name: 'Kelime Oyunu',
          description: '5 harfli kelimeyi tahmin edin',
          icon: '📝',
          category: 'word',
          difficulty: 'medium',
          xpReward: 35,
          isAvailable: true,
          supportsMultiplayer: false,
        },
      ],
    };
  }

  /**
   * Belirli oyun detaylarını getir
   */
  async getGameDetails(gameType: GameType) {
    const gameInfo = {
      [GameType.QUIZ]: {
        name: 'Genel Quiz',
        description: 'Genel bilgi sorularıyla bilginizi test edin',
        rules: [
          'Her soru için 30 saniye süreniz var',
          'Doğru cevap 10 XP kazandırır',
          'Yanlış cevap 5 XP kaybettirir',
          '5 soruluk setler halinde oynanır',
        ],
        xpReward: 30,
        timeLimit: 150, // 5 soru x 30 saniye
        questionCount: 5,
        categories: ['Genel Bilgi', 'Tarih', 'Coğrafya', 'Bilim'],
      },
      [GameType.NEWS_TRIVIA]: {
        name: 'Haber Trivia',
        description: 'Anadolu Ajansı güncel haberlerinden sorularla bilginizi test edin',
        rules: [
          'Her soru için 30 saniye süreniz var',
          'Doğru cevap 12 XP kazandırır',
          'Yanlış cevap 5 XP kaybettirir',
          '5 soruluk setler halinde oynanır',
          'Sorular güncel haberlerden gelir',
        ],
        xpReward: 35,
        timeLimit: 150, // 5 soru x 30 saniye
        questionCount: 5,
        categories: ['Güncel', 'Ekonomi', 'Spor', 'Teknoloji'],
      },
    };

    return gameInfo[gameType] || null;
  }

  /**
   * Yeni oyun başlat
   */
  async startGame(startRequest: StartGameRequest, userId: string): Promise<Game> {
    this.logger.log(`Starting ${startRequest.gameType} game for user ${userId}`);

    try {
      // Kullanıcının var olup olmadığını kontrol et, yoksa oluştur
      await this.ensureUserExists(userId);
      // Soru havuzundan soruları çek
      const questions = await this.questionGenerationService.getQuestions(
        startRequest.filter || { 
          gameType: startRequest.gameType,
          limit: 5 
        },
      );

      if (questions.length === 0) {
        throw new Error('No questions available for the selected criteria');
      }

      // Oyun oluştur
      const game: Game = {
        id: crypto.randomUUID(),
        type: startRequest.gameType,
        mode: startRequest.mode,
        status: GameStatus.WAITING,
        questions,
        currentQuestionIndex: 0,
        timeLimit: startRequest.timeLimit,
        createdAt: new Date(),
        createdBy: userId,
      };

      // Veritabanına kaydet
      await this.saveGame(game);

      // Kullanıcıyı oyuna kat
      await this.addParticipant(game.id, userId);

      // Multiplayer ise oda oluştur
      if (startRequest.mode === GameMode.MULTIPLAYER) {
        await this.multiplayerService.createGameRoom({
          gameType: startRequest.gameType,
          roomName: startRequest.roomName || `Room ${game.id.slice(0, 8)}`,
          maxPlayers: 8,
          isPrivate: startRequest.isPrivate || false,
          password: startRequest.password,
          filter: startRequest.filter,
          createdBy: userId,
        });
      }

      return game;
    } catch (error) {
      this.logger.error(`Failed to start game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soru cevapla
   */
  async answerQuestion(
    gameId: string,
    userId: string,
    answerRequest: AnswerQuestionRequest,
  ) {
    this.logger.log(`User ${userId} answering question in game ${gameId}`);

    try {
      // Oyunu getir
      const game = await this.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Kullanıcının oyuna katılıp katılmadığını kontrol et
      const isParticipant = await this.isUserParticipant(gameId, userId);
      if (!isParticipant) {
        throw new Error('User is not a participant in this game');
      }

      // Soruyu cevapla
      const result = await this.quizGameService.answerQuestion(
        game,
        answerRequest,
        userId,
      );

      // Cevabı kaydet
      await this.saveAnswer(gameId, userId, answerRequest, result);

      return result;
    } catch (error) {
      this.logger.error(`Failed to answer question: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyunu tamamla
   */
  async completeGame(gameId: string, userId: string): Promise<GameResult> {
    this.logger.log(`Completing game ${gameId} for user ${userId}`);

    try {
      // Oyun sonuçlarını hesapla
      const result = await this.quizGameService.calculateGameResult(gameId, userId);

      // XP ve gamification güncellemeleri
      await this.gamificationService.updateUserProgress(userId, result);

      // Oyunu tamamlandı olarak işaretle
      await this.updateGameStatus(gameId, GameStatus.COMPLETED);

      return result;
    } catch (error) {
      this.logger.error(`Failed to complete game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyun durumunu getir
   */
  async getGameStatus(gameId: string, userId: string) {
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const isParticipant = await this.isUserParticipant(gameId, userId);
    if (!isParticipant) {
      throw new Error('User is not a participant in this game');
    }

    return {
      game,
      currentQuestion: game.questions[game.currentQuestionIndex],
      progress: {
        current: game.currentQuestionIndex + 1,
        total: game.questions.length,
        percentage: Math.round(((game.currentQuestionIndex + 1) / game.questions.length) * 100),
      },
      timeRemaining: this.calculateTimeRemaining(game),
    };
  }

  /**
   * Oyun geçmişini getir
   */
  async getGameHistory(
    userId: string,
    filters: { page: number; limit: number; gameType?: GameType },
  ) {
      const { data, error } = await this.supabaseService.supabase
        .from('game_results')
        .select(`
          *,
          games!inner(*)
        `)
        .eq('player_id', userId)
        .eq(filters.gameType ? 'games.type' : 'games.type', filters.gameType || '')
        .order('completed_at', { ascending: false })
        .range(
          (filters.page - 1) * filters.limit,
          filters.page * filters.limit - 1,
        );

    if (error) {
      throw new Error(`Failed to fetch game history: ${error.message}`);
    }

    return {
      results: data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: data.length,
      },
    };
  }

  /**
   * Liderlik tablosunu getir
   */
  async getLeaderboard(
    gameType?: GameType,
    period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly',
    limit: number = 50,
  ) {
    return this.gamificationService.getLeaderboard(gameType, period, limit);
  }

  /**
   * Soru havuzu istatistikleri
   */
  async getQuestionStats() {
    return this.questionGenerationService.getQuestionStats();
  }

  /**
   * Günlük soru havuzu yenileme
   */
  async refreshQuestionPool() {
    return this.questionGenerationService.generateDailyNewsTriviaQuestions();
  }

  // Private helper methods

  private async saveGame(game: Game) {
    const { error } = await this.supabaseService.supabase
      .from('games')
      .insert({
        id: game.id,
        type: game.type,
        mode: game.mode,
        status: game.status,
        questions: game.questions,
        current_question_index: game.currentQuestionIndex,
        time_limit: game.timeLimit,
        created_by: game.createdBy,
        created_at: game.createdAt.toISOString(),
        started_at: game.startedAt?.toISOString(),
        completed_at: game.completedAt?.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save game: ${error.message}`);
    }
  }

  private async getGame(gameId: string): Promise<Game | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Game not found
      }
      throw new Error(`Failed to fetch game: ${error.message}`);
    }

    return {
      id: data.id,
      type: data.type,
      mode: data.mode,
      status: data.status,
      questions: data.questions,
      currentQuestionIndex: data.current_question_index,
      timeLimit: data.time_limit,
      createdAt: new Date(data.created_at),
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdBy: data.created_by,
    };
  }

  private async isUserParticipant(gameId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.supabase
      .from('game_participants')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', userId)
      .single();

    return !error && !!data;
  }

  private async saveAnswer(
    gameId: string,
    userId: string,
    answerRequest: AnswerQuestionRequest,
    result: any,
  ) {
    const { error } = await this.supabaseService.supabase
      .from('game_answers')
      .insert({
        game_id: gameId,
        player_id: userId,
        question_id: answerRequest.questionId,
        answer: answerRequest.answer,
        is_correct: result.isCorrect,
        time_spent: answerRequest.timeSpent,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save answer: ${error.message}`);
    }
  }

  private async updateGameStatus(gameId: string, status: GameStatus) {
    const updateData: any = { status };
    
    if (status === GameStatus.IN_PROGRESS) {
      updateData.started_at = new Date().toISOString();
    } else if (status === GameStatus.COMPLETED) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabaseService.supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to update game status: ${error.message}`);
    }
  }

  private calculateTimeRemaining(game: Game): number | null {
    if (!game.timeLimit || !game.startedAt) {
      return null;
    }

    const elapsed = (Date.now() - game.startedAt.getTime()) / 1000;
    const remaining = game.timeLimit - elapsed;
    
    return Math.max(0, Math.floor(remaining));
  }

  /**
   * Haber trivia soruları oluştur
   */
  async generateNewsTriviaQuestions() {
    this.logger.log('Generating news trivia questions...');
    
    try {
      const result = await this.questionGenerationService.generateManualNewsTriviaQuestions();
      
      return {
        success: result.success,
        message: result.message,
        questionsGenerated: result.questionsGenerated
      };
    } catch (error) {
      this.logger.error(`Failed to generate news trivia questions: ${error.message}`);
      return {
        success: false,
        message: `Failed to generate questions: ${error.message}`,
        questionsGenerated: 0
      };
    }
  }

  /**
   * Oyuna katılımcı ekle
   */
  private async addParticipant(gameId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .insert({
        id: crypto.randomUUID(),
        game_id: gameId,
        player_id: userId,
        player_name: `Player ${userId.slice(0, 8)}`,
        joined_at: new Date().toISOString(),
        is_ready: false,
        current_score: 0,
        current_question_index: 0,
      });

    if (error) {
      throw new Error(`Failed to add participant: ${error.message}`);
    }
  }
}
