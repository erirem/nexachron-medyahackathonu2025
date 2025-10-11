/**
 * Game Answer Entity
 * Represents a player's answer to a game question
 */

export interface CreateGameAnswerData {
  gameId: string;
  playerId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // in milliseconds
  xpEarned?: number;
}

export interface UpdateGameAnswerData {
  answer?: string;
  isCorrect?: boolean;
  timeSpent?: number;
  xpEarned?: number;
}

export class GameAnswerEntity {
  id: string;
  gameId: string;
  playerId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  xpEarned: number;
  createdAt: Date;

  constructor(data: {
    id: string;
    game_id: string;
    player_id: string;
    question_id: string;
    answer: string;
    is_correct: boolean;
    time_spent: number;
    xp_earned: number;
    created_at: string;
  }) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.playerId = data.player_id;
    this.questionId = data.question_id;
    this.answer = data.answer;
    this.isCorrect = data.is_correct;
    this.timeSpent = data.time_spent;
    this.xpEarned = data.xp_earned;
    this.createdAt = new Date(data.created_at);
  }

  // Business logic methods
  isCorrectAnswer(): boolean {
    return this.isCorrect;
  }

  getTimeSpentSeconds(): number {
    return Math.round(this.timeSpent / 1000);
  }

  getTimeSpentMinutes(): number {
    return Math.round(this.timeSpent / (1000 * 60));
  }

  getXpEarned(): number {
    return this.xpEarned;
  }

  wasAnsweredQuickly(thresholdMs: number = 10000): boolean {
    return this.timeSpent <= thresholdMs;
  }

  wasAnsweredSlowly(thresholdMs: number = 30000): boolean {
    return this.timeSpent >= thresholdMs;
  }

  getSpeedBonus(): number {
    // Example: bonus XP for quick answers
    if (this.wasAnsweredQuickly(5000)) return 10;
    if (this.wasAnsweredQuickly(10000)) return 5;
    return 0;
  }

  getTotalXp(): number {
    return this.xpEarned + this.getSpeedBonus();
  }

  getAccuracy(): number {
    return this.isCorrect ? 100 : 0;
  }

  getEfficiency(): number {
    // Efficiency based on correctness and speed
    if (!this.isCorrect) return 0;
    
    const speedScore = this.wasAnsweredQuickly(10000) ? 1 : 0.5;
    return speedScore * 100;
  }
}
