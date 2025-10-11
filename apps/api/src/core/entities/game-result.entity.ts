/**
 * Game Result Entity
 * Represents the final result of a game for a player
 */

export interface CreateGameResultData {
  gameId: string;
  playerId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in milliseconds
  xpEarned: number;
  rank?: number;
}

export interface UpdateGameResultData {
  score?: number;
  correctAnswers?: number;
  timeSpent?: number;
  xpEarned?: number;
  rank?: number;
  completedAt?: Date;
}

export class GameResultEntity {
  id: string;
  gameId: string;
  playerId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  xpEarned: number;
  rank?: number;
  completedAt: Date;

  constructor(data: {
    id: string;
    game_id: string;
    player_id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_spent: number;
    xp_earned: number;
    rank?: number;
    completed_at: string;
  }) {
    this.id = data.id;
    this.gameId = data.game_id;
    this.playerId = data.player_id;
    this.score = data.score;
    this.totalQuestions = data.total_questions;
    this.correctAnswers = data.correct_answers;
    this.timeSpent = data.time_spent;
    this.xpEarned = data.xp_earned;
    this.rank = data.rank;
    this.completedAt = new Date(data.completed_at);
  }

  // Business logic methods
  getAccuracy(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }

  getTimeSpentSeconds(): number {
    return Math.round(this.timeSpent / 1000);
  }

  getTimeSpentMinutes(): number {
    return Math.round(this.timeSpent / (1000 * 60));
  }

  getAverageTimePerQuestion(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round(this.timeSpent / this.totalQuestions);
  }

  getScorePercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.score / this.totalQuestions) * 100);
  }

  isPerfectScore(): boolean {
    return this.correctAnswers === this.totalQuestions;
  }

  isGoodScore(threshold: number = 80): boolean {
    return this.getAccuracy() >= threshold;
  }

  isFastCompletion(thresholdMinutes: number = 5): boolean {
    return this.getTimeSpentMinutes() <= thresholdMinutes;
  }

  getPerformanceRating(): 'excellent' | 'good' | 'average' | 'poor' {
    const accuracy = this.getAccuracy();
    const speed = this.isFastCompletion(3);
    
    if (accuracy >= 90 && speed) return 'excellent';
    if (accuracy >= 80) return 'good';
    if (accuracy >= 60) return 'average';
    return 'poor';
  }

  getRankDisplay(): string {
    if (!this.rank) return 'N/A';
    
    const suffix = this.rank === 1 ? 'st' : 
                   this.rank === 2 ? 'nd' : 
                   this.rank === 3 ? 'rd' : 'th';
    return `${this.rank}${suffix}`;
  }

  getXpEarned(): number {
    return this.xpEarned;
  }

  getBonusXp(): number {
    let bonus = 0;
    
    // Perfect score bonus
    if (this.isPerfectScore()) bonus += 50;
    
    // Speed bonus
    if (this.isFastCompletion(2)) bonus += 25;
    else if (this.isFastCompletion(5)) bonus += 10;
    
    // Accuracy bonus
    if (this.getAccuracy() >= 95) bonus += 30;
    else if (this.getAccuracy() >= 85) bonus += 15;
    
    return bonus;
  }

  getTotalXp(): number {
    return this.xpEarned + this.getBonusXp();
  }

  getGrade(): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    const accuracy = this.getAccuracy();
    
    if (accuracy >= 97) return 'A+';
    if (accuracy >= 93) return 'A';
    if (accuracy >= 90) return 'B+';
    if (accuracy >= 87) return 'B';
    if (accuracy >= 83) return 'C+';
    if (accuracy >= 80) return 'C';
    if (accuracy >= 70) return 'D';
    return 'F';
  }

  getCompletionTime(): string {
    const minutes = Math.floor(this.timeSpent / (1000 * 60));
    const seconds = Math.floor((this.timeSpent % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
