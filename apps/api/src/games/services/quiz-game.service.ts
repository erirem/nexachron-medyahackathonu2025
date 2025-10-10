import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GamificationService } from './gamification.service';
import {
  Game,
  GameResult,
  AnswerQuestionRequest,
  QuestionType,
  DifficultyLevel,
} from '../dto/game.dto';

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  xpEarned: number;
  timeBonus: number;
}

@Injectable()
export class QuizGameService {
  private readonly logger = new Logger(QuizGameService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Soru cevapla ve sonucu hesapla
   */
  async answerQuestion(
    game: Game,
    answerRequest: AnswerQuestionRequest,
    userId: string,
  ): Promise<AnswerResult> {
    this.logger.log(`Processing answer for question ${answerRequest.questionId} by user ${userId}`);

    try {
      // Soruyu bul
      const question = game.questions.find(q => q.id === answerRequest.questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Cevabı kontrol et
      const isCorrect = this.checkAnswer(question, answerRequest.answer);
      
      // XP hesapla
      const baseXP = this.calculateBaseXP(question.difficulty, isCorrect);
      const timeBonus = this.calculateTimeBonus(answerRequest.timeSpent, question.difficulty);
      const totalXP = baseXP + timeBonus;

      // Sonucu kaydet
      await this.saveAnswerResult(game.id, userId, answerRequest, isCorrect, totalXP);

      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned: totalXP,
        timeBonus,
      };
    } catch (error) {
      this.logger.error(`Failed to process answer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyun sonucunu hesapla
   */
  async calculateGameResult(gameId: string, userId: string): Promise<GameResult> {
    this.logger.log(`Calculating game result for game ${gameId} and user ${userId}`);

    try {
      // Kullanıcının tüm cevaplarını getir
      const { data: answers, error } = await this.supabaseService.supabase
        .from('game_answers')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', userId);

      if (error) {
        throw new Error(`Failed to fetch answers: ${error.message}`);
      }

      // İstatistikleri hesapla
      const totalQuestions = answers.length;
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalXP = answers.reduce((sum, a) => sum + (a.xp_earned || 0), 0);
      const totalTimeSpent = answers.reduce((sum, a) => sum + (a.time_spent || 0), 0);

      // Başarı oranına göre bonus XP
      const successRate = correctAnswers / totalQuestions;
      const bonusXP = this.calculateBonusXP(successRate, totalQuestions);

      const finalXP = totalXP + bonusXP;

      // Oyun sonucu oluştur
      const result: GameResult = {
        id: crypto.randomUUID(),
        gameId,
        playerId: userId,
        score: correctAnswers,
        totalQuestions,
        correctAnswers,
        timeSpent: totalTimeSpent,
        xpEarned: finalXP,
        completedAt: new Date(),
      };

      // Sonucu kaydet
      await this.saveGameResult(result);

      return result;
    } catch (error) {
      this.logger.error(`Failed to calculate game result: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cevabı kontrol et
   */
  private checkAnswer(question: any, userAnswer: string): boolean {
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    const userAnswerNormalized = userAnswer.toLowerCase().trim();

    // Farklı soru türleri için farklı kontrol yöntemleri
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return correctAnswer === userAnswerNormalized;
      
      case QuestionType.TRUE_FALSE:
        return correctAnswer === userAnswerNormalized;
      
      case QuestionType.FILL_BLANK:
        // Boşluk doldurma için daha esnek kontrol
        return this.fuzzyMatch(correctAnswer, userAnswerNormalized);
      
      default:
        return correctAnswer === userAnswerNormalized;
    }
  }

  /**
   * Bulanık eşleşme (boşluk doldurma için)
   */
  private fuzzyMatch(correct: string, user: string): boolean {
    // Basit benzerlik kontrolü
    const similarity = this.calculateSimilarity(correct, user);
    return similarity > 0.8; // %80 benzerlik eşiği
  }

  /**
   * String benzerliği hesapla
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein mesafesi
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Temel XP hesapla
   */
  private calculateBaseXP(difficulty: DifficultyLevel, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    const baseXP = {
      [DifficultyLevel.EASY]: 10,
      [DifficultyLevel.MEDIUM]: 15,
      [DifficultyLevel.HARD]: 20,
    };

    return baseXP[difficulty] || 10;
  }

  /**
   * Zaman bonusu hesapla
   */
  private calculateTimeBonus(timeSpent: number, difficulty: DifficultyLevel): number {
    const maxTime = {
      [DifficultyLevel.EASY]: 30,
      [DifficultyLevel.MEDIUM]: 45,
      [DifficultyLevel.HARD]: 60,
    };

    const timeLimit = maxTime[difficulty] || 30;
    const timeRatio = Math.max(0, (timeLimit - timeSpent) / timeLimit);
    
    // Hızlı cevap bonusu (maksimum 5 XP)
    return Math.floor(timeRatio * 5);
  }

  /**
   * Bonus XP hesapla (başarı oranına göre)
   */
  private calculateBonusXP(successRate: number, totalQuestions: number): number {
    if (successRate >= 1.0) {
      // Mükemmel skor bonusu
      return totalQuestions * 2;
    } else if (successRate >= 0.8) {
      // Yüksek başarı bonusu
      return totalQuestions;
    } else if (successRate >= 0.6) {
      // Orta başarı bonusu
      return Math.floor(totalQuestions * 0.5);
    }
    
    return 0;
  }

  /**
   * Cevap sonucunu kaydet
   */
  private async saveAnswerResult(
    gameId: string,
    userId: string,
    answerRequest: AnswerQuestionRequest,
    isCorrect: boolean,
    xpEarned: number,
  ) {
    const { error } = await this.supabaseService.supabase
      .from('game_answers')
      .insert({
        game_id: gameId,
        player_id: userId,
        question_id: answerRequest.questionId,
        answer: answerRequest.answer,
        is_correct: isCorrect,
        time_spent: answerRequest.timeSpent,
        xp_earned: xpEarned,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save answer result: ${error.message}`);
    }
  }

  /**
   * Oyun sonucunu kaydet
   */
  private async saveGameResult(result: GameResult) {
    const { error } = await this.supabaseService.supabase
      .from('game_results')
      .insert({
        id: result.id,
        game_id: result.gameId,
        player_id: result.playerId,
        score: result.score,
        total_questions: result.totalQuestions,
        correct_answers: result.correctAnswers,
        time_spent: result.timeSpent,
        xp_earned: result.xpEarned,
        rank: result.rank,
        completed_at: result.completedAt.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save game result: ${error.message}`);
    }
  }
}
