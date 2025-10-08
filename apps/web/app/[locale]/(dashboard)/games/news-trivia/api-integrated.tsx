'use client';

import { useState, useEffect, useRef, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { startGame, answerQuestion, generateNewsTriviaQuestions } from '@/services/api';

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
  gameType: string;
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

interface GameState {
  currentQuestion: number;
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  selectedAnswer: string | null;
  showResult: boolean;
  gameId: string | null;
}

const GAME_DURATION = 300; // 5 minutes in seconds
const XP_REWARD = 35;

export default function ApiIntegratedNewsTriviaPage(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    timeLeft: GAME_DURATION,
    isGameActive: false,
    isGameComplete: false,
    selectedAnswer: null,
    showResult: false,
    gameId: null,
  });

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);

  const { completeQuiz } = useGamification();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('games.newsTrivia.game');

  // Handle back navigation
  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('Back button clicked, navigating to:', `/${locale}/games`);
    
    try {
      window.location.href = `/${locale}/games`;
      return;
    } catch (error) {
      console.error('window.location.href failed:', error);
    }
    
    try {
      router.replace(`/${locale}/games`);
    } catch (error) {
      console.error('router.replace failed:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (shouldStartTimer && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            return {
              ...prev,
              timeLeft: 0,
              isGameActive: false,
              isGameComplete: true,
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [shouldStartTimer]);

  // Cleanup timer when game ends
  useEffect(() => {
    if (!gameState.isGameActive || gameState.isGameComplete) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setShouldStartTimer(false);
    }
  }, [gameState.isGameActive, gameState.isGameComplete]);

  const startGameHandler = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, generate news trivia questions
      console.log('Generating news trivia questions...');
      generateNewsTriviaQuestions();
      
      // Then start the game
      console.log('Starting news trivia game...');
      const gameData = await startGame({
        gameType: 'news_trivia',
        mode: 'single',
        filter: {
          gameType: 'news_trivia',
          limit: 5
        }
      });
      
      setGame(gameData);
      setGameState({
        currentQuestion: 0,
        score: 0,
        timeLeft: GAME_DURATION,
        isGameActive: true,
        isGameComplete: false,
        selectedAnswer: null,
        showResult: false,
        gameId: gameData.id,
      });
      
      // Start the timer
      setShouldStartTimer(true);
      
    } catch (error) {
      console.error('Failed to start game:', error);
      setError(error instanceof Error ? error.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = async (answer: string) => {
    if (gameState.showResult || gameState.isGameComplete || !gameState.gameId) return;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
    }));

    try {
      const currentQ = game?.questions[gameState.currentQuestion];
      if (!currentQ) return;

      const result = await answerQuestion(gameState.gameId, {
        questionId: currentQ.id,
        answer: answer,
        timeSpent: GAME_DURATION - gameState.timeLeft,
      });

      if (result.isCorrect) {
        setGameState(prev => ({
          ...prev,
          score: prev.score + 1,
        }));
      }
    } catch (error) {
      console.error('Failed to answer question:', error);
    }
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion < (game?.questions.length || 0) - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        showResult: false,
      }));
    } else {
      // Game complete
      setGameState(prev => ({
        ...prev,
        isGameActive: false,
        isGameComplete: true,
      }));

      // Award XP
      if (game) {
        completeQuiz('news-trivia', gameState.score, game.questions.length);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = (): string => {
    if (!game) return '';
    const percentage = (gameState.score / game.questions.length) * 100;
    if (percentage >= 80) return t('messages.excellent');
    if (percentage >= 60) return t('messages.good');
    if (percentage >= 40) return t('messages.okay');
    return t('messages.needsWork');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div className="text-white text-xl mb-2">{t('loading')}</div>
          <div className="text-white/60 text-sm">Haber trivia soruları yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Hata</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={startGameHandler}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
              >
                Tekrar Dene
              </button>
              <button
                onClick={handleBack}
                className="w-full bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game start screen
  if (!gameState.isGameActive && !gameState.isGameComplete) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="mb-6 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </button>

          {/* Game card */}
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-b from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">Haber Trivia</h1>
            <p className="text-white/80 mb-8">Güncel haberlerden AI ile üretilen sorular.</p>

            {/* Game info */}
            <div className="flex justify-between items-center mb-8">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {t('difficulty')}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('time')}</span>
              </div>
            </div>

            {/* XP Reward */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{t('xpReward')}</span>
              </div>
              <div className="text-yellow-400 font-semibold">+{XP_REWARD} XP</div>
            </div>

            {/* Start button */}
            <button
              onClick={startGameHandler}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Yükleniyor...' : t('start')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game complete screen
  if (gameState.isGameComplete) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-b from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('completed')}</h2>
              <p className="text-white/80 mb-6">{getScoreMessage()}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-white/80">{t('score')}</span>
                <span className="text-white font-semibold">{gameState.score}/{game?.questions.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">{t('accuracy')}</span>
                <span className="text-white font-semibold">
                  {game ? Math.round((gameState.score / game.questions.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">{t('earnedXp')}</span>
                <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startGameHandler}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
              >
                {t('playAgain')}
              </button>
              <button
                onClick={handleBack}
                className="w-full bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                {t('backToGames')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game in progress
  const currentQ = game?.questions[gameState.currentQuestion];
  const progress = game ? ((gameState.currentQuestion + 1) / game.questions.length) * 100 : 0;

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center">
        <div className="text-white text-xl">Soru yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </button>
          <div className="text-white font-semibold">
            {gameState.currentQuestion + 1}/{game?.questions.length || 0}
          </div>
          <div className="text-white font-semibold">
            {formatTime(gameState.timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options?.map((option, index) => {
              let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 ";
              
              if (gameState.showResult) {
                if (option === currentQ.correctAnswer) {
                  buttonClass += "bg-green-500/20 border-green-500 text-green-300";
                } else if (option === gameState.selectedAnswer && option !== currentQ.correctAnswer) {
                  buttonClass += "bg-red-500/20 border-red-500 text-red-300";
                } else {
                  buttonClass += "bg-white/5 border-white/20 text-white/60";
                }
              } else {
                buttonClass += gameState.selectedAnswer === option
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-300"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30";
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(option)}
                  disabled={gameState.showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {gameState.showResult && currentQ.explanation && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-300 text-sm">
                <strong>{t('explanation')}</strong> {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Next button */}
        {gameState.showResult && (
          <div className="text-center">
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
            >
              {gameState.currentQuestion < (game?.questions.length || 0) - 1 ? t('next') : t('finish')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
