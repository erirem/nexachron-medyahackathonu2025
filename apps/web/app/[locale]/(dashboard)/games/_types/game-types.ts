export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'cyan' | 'yellow' | 'red';
  category: 'educational' | 'memory' | 'word' | 'trivia' | 'timeline' | 'visual';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  isAvailable: boolean;
  isCompleted: boolean;
  completionRate: number; // 0-100
  estimatedTime: string;
}

export interface GameResult {
  gameId: string;
  score: number;
  maxScore: number;
  timeSpent: number; // saniye cinsinden
  xpEarned: number;
  completedAt: Date;
  achievements: string[];
}

export interface GameProgress {
  currentLevel: number;
  totalLevels: number;
  currentScore: number;
  timeRemaining: number;
  startTime: Date;
}

// Wordle specific types
export interface WordleGame {
  id: string;
  word: string;
  maxAttempts: number;
  currentAttempt: number;
  attempts: WordleAttempt[];
  isCompleted: boolean;
  isWon: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface WordleAttempt {
  word: string;
  result: WordleLetterResult[];
  isComplete: boolean;
}

export interface WordleLetterResult {
  letter: string;
  status: 'correct' | 'present' | 'absent';
  position: number;
}

export interface WordleStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  averageGuesses: number;
}
