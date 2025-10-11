/**
 * Game Entity
 * Represents a game instance in the system
 */

export enum GameType {
  QUIZ = 'quiz',
  NEWS_TRIVIA = 'news_trivia',
  MEMORY = 'memory',
  WORDLE = 'wordle',
  WORD_PUZZLE = 'word_puzzle',
  TIMELINE = 'timeline',
  SPOT_DIFFERENCE = 'spot_difference',
}

export enum GameMode {
  SINGLE_PLAYER = 'single_player',
  MULTIPLAYER = 'multiplayer',
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  timeLimit?: number;
}

export interface CreateGameData {
  type: GameType;
  mode: GameMode;
  questions: GameQuestion[];
  timeLimit?: number;
  createdBy: string;
}

export interface UpdateGameData {
  status?: GameStatus;
  currentQuestionIndex?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class GameEntity {
  id: string;
  type: GameType;
  mode: GameMode;
  status: GameStatus;
  questions: GameQuestion[];
  currentQuestionIndex: number;
  timeLimit?: number;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  constructor(data: {
    id: string;
    type: string;
    mode: string;
    status: string;
    questions: any; // JSONB from database
    current_question_index: number;
    time_limit?: number;
    created_by: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
  }) {
    this.id = data.id;
    this.type = data.type as GameType;
    this.mode = data.mode as GameMode;
    this.status = data.status as GameStatus;
    this.questions = Array.isArray(data.questions) ? data.questions : [];
    this.currentQuestionIndex = data.current_question_index;
    this.timeLimit = data.time_limit;
    this.createdBy = data.created_by;
    this.createdAt = new Date(data.created_at);
    this.startedAt = data.started_at ? new Date(data.started_at) : undefined;
    this.completedAt = data.completed_at ? new Date(data.completed_at) : undefined;
  }

  // Business logic methods
  isActive(): boolean {
    return this.status === GameStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === GameStatus.COMPLETED;
  }

  isWaiting(): boolean {
    return this.status === GameStatus.WAITING;
  }

  getCurrentQuestion(): GameQuestion | null {
    if (this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
      return this.questions[this.currentQuestionIndex];
    }
    return null;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }

  getProgress(): number {
    if (this.questions.length === 0) return 0;
    return Math.round((this.currentQuestionIndex / this.questions.length) * 100);
  }

  canStart(): boolean {
    return this.status === GameStatus.WAITING;
  }

  canAnswer(): boolean {
    return this.status === GameStatus.IN_PROGRESS && this.getCurrentQuestion() !== null;
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }

  getRemainingQuestions(): number {
    return Math.max(0, this.questions.length - this.currentQuestionIndex);
  }

  getDuration(): number | null {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }

  getDurationMinutes(): number | null {
    const duration = this.getDuration();
    return duration ? Math.round(duration / (1000 * 60)) : null;
  }
}
