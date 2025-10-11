export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  hint?: string; // Optional hint for the question
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number; // saniye cinsinden
  xpReward: number;
  isCompleted: boolean;
  questions: QuizQuestion[];
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'cyan' | 'yellow' | 'red';
  quizCount: number;
  completedCount: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number; // saniye cinsinden
  xpEarned: number;
  completedAt: Date;
}

export interface QuizProgress {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
  answers: (number | null)[];
  startTime: Date;
}
