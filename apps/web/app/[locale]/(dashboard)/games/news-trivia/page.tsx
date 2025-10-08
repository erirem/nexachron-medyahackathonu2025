'use client';

import { useState, useEffect, useMemo, useRef, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGamification } from '@/contexts/gamification-context';
import { useNews } from '@/hooks/use-news';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  newsId: string;
  newsTitle: string;
}

interface GameState {
  currentQuestion: number;
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
}

const GAME_DURATION = 300; // 5 minutes in seconds
const QUESTIONS_PER_GAME = 5;
const XP_REWARD = 15;

export default function NewsTriviaPage(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    timeLeft: GAME_DURATION,
    isGameActive: false,
    isGameComplete: false,
    selectedAnswer: null,
    showResult: false,
  });

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);

  const { completeQuiz } = useGamification();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('games.newsTrivia.game');

  // Handle back navigation with multiple fallbacks
  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('Back button clicked, navigating to:', `/${locale}/games`);
    console.log('Current URL:', window.location.href);
    
    // Method 1: Force navigation with window.location
    try {
      window.location.href = `/${locale}/games`;
      console.log('window.location.href executed');
      return;
    } catch (error) {
      console.error('window.location.href failed:', error);
    }
    
    // Method 2: Try router.replace (more forceful than push)
    try {
      router.replace(`/${locale}/games`);
      console.log('router.replace executed');
    } catch (error) {
      console.error('router.replace failed:', error);
    }
    
    // Method 3: Try router.push as fallback
    try {
      router.push(`/${locale}/games`);
      console.log('router.push executed');
    } catch (error) {
      console.error('router.push failed:', error);
    }
    
    // Method 4: Try window.history.back as last resort
    setTimeout(() => {
      try {
        window.history.back();
        console.log('window.history.back executed');
      } catch (error) {
        console.error('window.history.back failed:', error);
      }
    }, 100);
  };

  // Fetch news data
  const { data: newsData, isLoading: newsLoading, error: newsError } = useNews({ 
    limit: 50,
    isPopular: true 
  });


  // Generate a single question from news item
  const generateQuestionFromNews = (news: any, index: number): TriviaQuestion | null => {
    if (!news.title || !news.summary) return null;

    const questionTypes = [
      () => generateCategoryQuestion(news),
      () => generateLocationQuestion(news),
      () => generateTimeQuestion(news),
      () => generateContentQuestion(news),
    ];

    const questionGenerator = questionTypes[index % questionTypes.length];
    return questionGenerator();
  };

  const generateCategoryQuestion = (news: any): TriviaQuestion | null => {
    if (!news.category) return null;

    const categories = ['Politika', 'Spor', 'Ekonomi', 'Teknoloji', 'Sağlık', 'Kültür', 'Dünya'];
    const correctCategory = news.category;
    const wrongCategories = categories.filter(cat => cat !== correctCategory)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [correctCategory, ...wrongCategories].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctCategory);

    return {
      id: `q-${news.id}-category`,
      question: `"${news.title}" haberi hangi kategoride yer alır?`,
      options,
      correctAnswer: correctIndex,
      explanation: `Bu haber ${correctCategory} kategorisinde yer almaktadır.`,
      newsId: news.id,
      newsTitle: news.title,
    };
  };

  const generateLocationQuestion = (news: any): TriviaQuestion | null => {
    if (!news.city) return null;

    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
    const correctCity = news.city;
    const wrongCities = cities.filter(city => city !== correctCity)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [correctCity, ...wrongCities].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctCity);

    return {
      id: `q-${news.id}-location`,
      question: `"${news.title}" haberi hangi şehirde geçiyor?`,
      options,
      correctAnswer: correctIndex,
      explanation: `Bu haber ${correctCity} şehrinde geçmektedir.`,
      newsId: news.id,
      newsTitle: news.title,
    };
  };

  const generateTimeQuestion = (news: any): TriviaQuestion | null => {
    if (!news.created_at) return null;

    const newsDate = new Date(news.created_at);
    const today = new Date();
    const diffTime = today.getTime() - newsDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeFrame: string;
    let correctAnswer: number;

    if (diffDays === 1) {
      timeFrame = 'Dün';
      correctAnswer = 0;
    } else if (diffDays <= 7) {
      timeFrame = 'Bu hafta';
      correctAnswer = 1;
    } else if (diffDays <= 30) {
      timeFrame = 'Bu ay';
      correctAnswer = 2;
    } else {
      timeFrame = 'Bu yıl';
      correctAnswer = 3;
    }

    const options = ['Dün', 'Bu hafta', 'Bu ay', 'Bu yıl'];
    const correctIndex = options.indexOf(timeFrame);

    return {
      id: `q-${news.id}-time`,
      question: `"${news.title}" haberi ne zaman yayınlandı?`,
      options,
      correctAnswer: correctIndex,
      explanation: `Bu haber ${timeFrame.toLowerCase()} yayınlandı.`,
      newsId: news.id,
      newsTitle: news.title,
    };
  };

  const generateContentQuestion = (news: any): TriviaQuestion | null => {
    if (!news.summary || news.summary.length < 50) return null;

    // Extract key words from summary
    const words = news.summary.split(' ').filter((word: string) => word.length > 4);
    if (words.length < 2) return null;

    const correctWord = words[Math.floor(Math.random() * words.length)];
    const wrongWords = words.filter((word: string) => word !== correctWord)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctWord);

    return {
      id: `q-${news.id}-content`,
      question: `"${news.title}" haberinin özetinde hangi kelime geçiyor?`,
      options,
      correctAnswer: correctIndex,
      explanation: `Bu haberin özetinde "${correctWord}" kelimesi geçmektedir.`,
      newsId: news.id,
      newsTitle: news.title,
    };
  };

  // Fallback questions when API fails
  const createFallbackQuestions = (): TriviaQuestion[] => {
    return [
      {
        id: 'fallback-1',
        question: 'Haber Trivia oyunu hangi tür sorular içerir?',
        options: ['Sadece spor soruları', 'Güncel haberler hakkında sorular', 'Sadece tarih soruları', 'Sadece bilim soruları'],
        correctAnswer: 1,
        explanation: 'Haber Trivia oyunu güncel haberler hakkında sorular içerir.',
        newsId: 'fallback',
        newsTitle: 'Haber Trivia Oyunu',
      },
      {
        id: 'fallback-2',
        question: 'Haber kategorileri arasında hangisi bulunur?',
        options: ['Müzik', 'Politika', 'Oyun', 'Moda'],
        correctAnswer: 1,
        explanation: 'Politika, haber kategorileri arasında yer alır.',
        newsId: 'fallback',
        newsTitle: 'Haber Kategorileri',
      },
      {
        id: 'fallback-3',
        question: 'Haber Trivia oyununda kaç soru sorulur?',
        options: ['3', '5', '7', '10'],
        correctAnswer: 1,
        explanation: 'Haber Trivia oyununda 5 soru sorulur.',
        newsId: 'fallback',
        newsTitle: 'Oyun Kuralları',
      },
      {
        id: 'fallback-4',
        question: 'Haber Trivia oyununda kazanılan XP miktarı nedir?',
        options: ['10 XP', '15 XP', '20 XP', '25 XP'],
        correctAnswer: 1,
        explanation: 'Haber Trivia oyununda 15 XP kazanılır.',
        newsId: 'fallback',
        newsTitle: 'XP Sistemi',
      },
      {
        id: 'fallback-5',
        question: 'Haber Trivia oyununun zorluk seviyesi nedir?',
        options: ['Zor', 'Orta', 'Kolay', 'Çok Zor'],
        correctAnswer: 2,
        explanation: 'Haber Trivia oyununun zorluk seviyesi kolaydır.',
        newsId: 'fallback',
        newsTitle: 'Oyun Zorluğu',
      },
    ];
  };

  // Initialize questions when news data is loaded
  useEffect(() => {
    if (newsData && newsData.length > 0 && !isLoading) {
      // Generate questions directly here to avoid useMemo dependency issues
      const generatedQuestions: TriviaQuestion[] = [];
      const shuffledNews = [...newsData].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(QUESTIONS_PER_GAME, shuffledNews.length); i++) {
        const news = shuffledNews[i];
        const question = generateQuestionFromNews(news, i);
        if (question) {
          generatedQuestions.push(question);
        }
      }
      
      setQuestions(generatedQuestions);
      setIsLoading(false);
    } else if (newsError || (!newsLoading && (!newsData || newsData.length === 0))) {
      // If there's an error or no data, create fallback questions
      setQuestions(createFallbackQuestions());
      setIsLoading(false);
    }
  }, [isLoading, newsError, newsLoading, newsData]);

  // Timeout fallback - if loading takes too long, use fallback questions
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && questions.length === 0) {
        setQuestions(createFallbackQuestions());
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, questions.length]);

  // Timer effect - only runs when shouldStartTimer changes
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

  const startGame = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setGameState({
      currentQuestion: 0,
      score: 0,
      timeLeft: GAME_DURATION,
      isGameActive: true,
      isGameComplete: false,
      selectedAnswer: null,
      showResult: false,
    });
    
    // Start the timer
    setShouldStartTimer(true);
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.showResult || gameState.isGameComplete) return;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      showResult: true,
    }));

    // Check if answer is correct
    const currentQ = questions[gameState.currentQuestion];
    if (currentQ && answerIndex === currentQ.correctAnswer) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
      }));
    }
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion < questions.length - 1) {
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
      completeQuiz('news-trivia', gameState.score, questions.length);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = (): string => {
    const percentage = (gameState.score / questions.length) * 100;
    if (percentage >= 80) return t('messages.excellent');
    if (percentage >= 60) return t('messages.good');
    if (percentage >= 40) return t('messages.okay');
    return t('messages.needsWork');
  };

  if (isLoading || newsLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div className="text-white text-xl mb-2">{t('loading')}</div>
          <div className="text-white/60 text-sm">Haberler yükleniyor...</div>
          {newsError && (
            <div className="text-red-400 text-sm mt-2">
              API hatası: {newsError.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center">
        <div className="text-white text-xl">{t('noNews')}</div>
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
            <p className="text-white/80 mb-8">Güncel gelişmeler hakkında kısa sorular.</p>

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
              onClick={startGame}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
            >
              {t('start')}
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
                <span className="text-white font-semibold">{gameState.score}/{questions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">{t('accuracy')}</span>
                <span className="text-white font-semibold">
                  {Math.round((gameState.score / questions.length) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">{t('earnedXp')}</span>
                <span className="text-yellow-400 font-semibold">+{XP_REWARD} XP</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
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
  const currentQ = questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / questions.length) * 100;

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
            {gameState.currentQuestion + 1}/{questions.length}
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
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 ";
              
              if (gameState.showResult) {
                if (index === currentQ.correctAnswer) {
                  buttonClass += "bg-green-500/20 border-green-500 text-green-300";
                } else if (index === gameState.selectedAnswer && index !== currentQ.correctAnswer) {
                  buttonClass += "bg-red-500/20 border-red-500 text-red-300";
                } else {
                  buttonClass += "bg-white/5 border-white/20 text-white/60";
                }
              } else {
                buttonClass += gameState.selectedAnswer === index
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-300"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30";
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
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
          {gameState.showResult && (
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
              {gameState.currentQuestion < questions.length - 1 ? t('next') : t('finish')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
