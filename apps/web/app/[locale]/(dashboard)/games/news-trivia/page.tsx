'use client';

import { useState, useEffect, useRef, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { startGame, answerQuestion, createGameRoom, joinGameRoom, getGameRoomDetails } from '@/services/api';
import { getSupabaseClient } from '@/lib/supabase/client';
import { MultiplayerLobby } from './_components/multiplayer-lobby';
import { MultiplayerResults } from './_components/multiplayer-results';
import { useMultiplayerSocket } from '@/hooks/use-multiplayer-socket';

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

interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  hasAnswered: boolean;
  currentAnswer?: string;
}

interface MultiplayerState {
  roomId: string | null;
  players: Player[];
  isHost: boolean;
  isWaitingForPlayers: boolean;
  gameStarted: boolean;
  showLobby: boolean;
}

const GAME_DURATION = 300; // 5 minutes in seconds
const XP_REWARD = 35;

export default function NewsTriviaPage(): JSX.Element {
  const [gameMode, setGameMode] = useState<'select' | 'single' | 'multiplayer'>('select');
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

  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState>({
    roomId: null,
    players: [],
    isHost: false,
    isWaitingForPlayers: true,
    gameStarted: false,
    showLobby: false,
  });

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldStartTimer, setShouldStartTimer] = useState(false);
  const channelRef = useRef<any>(null);
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2));

  // WebSocket connection
  const { 
    socket, 
    isConnected, 
    error: socketError, 
    addEventListener, 
    removeEventListener, 
    actions: socketActions 
  } = useMultiplayerSocket();

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    const handlePlayerJoined = (data: { participant: any; roomDetails: any; timestamp: Date }) => {
      console.log('Player joined:', data);
      
      // Backend participant'ını Frontend Player interface'ine map et
      const player: Player = {
        id: data.participant.id,
        name: data.participant.playerName || data.participant.name || 'Oyuncu',
        score: data.participant.currentScore || 0,
        isReady: data.participant.isReady || false,
        hasAnswered: false,
      };
      
      setMultiplayerState(prev => ({
        ...prev,
        players: [...prev.players, player],
      }));
    };

    const handlePlayerLeft = (data: { userId: string; roomDetails: any; timestamp: Date }) => {
      console.log('Player left:', data);
      setMultiplayerState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.userId),
      }));
    };

    const handleGameStarted = (data: { game: any; timestamp: Date }) => {
      console.log('Game started:', data);
      setGame(data.game);
      setGameState(prev => ({
        ...prev,
        gameId: data.game.id,
        isGameActive: true,
      }));
      setMultiplayerState(prev => ({
        ...prev,
        gameStarted: true,
        isWaitingForPlayers: false,
      }));
      setShouldStartTimer(true);
    };

    const handlePlayerAnswered = (data: { userId: string; questionId: string; answer: string; isCorrect: boolean; score: number; timestamp: Date }) => {
      console.log('Player answered:', data);
      setMultiplayerState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.userId 
            ? { ...p, score: p.score + (data.isCorrect ? 1 : 0), hasAnswered: true }
            : p
        ),
      }));
    };

    const handleNextQuestion = (data: { gameState: any; timestamp: Date }) => {
      console.log('Next question:', data);
      if (data.gameState.isComplete) {
        setGameState(prev => ({
          ...prev,
          isGameComplete: true,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          currentQuestion: data.gameState.currentQuestionIndex,
          selectedAnswer: null,
          showResult: false,
        }));
        setMultiplayerState(prev => ({
          ...prev,
          players: prev.players.map(p => ({ ...p, hasAnswered: false })),
        }));
      }
    };

    const handleGameCompleted = (data: { results: any; timestamp: Date }) => {
      console.log('Game completed:', data);
      setGameState(prev => ({
        ...prev,
        isGameComplete: true,
      }));
    };

    const handleRoomJoined = (data: { participant: any; roomDetails: any; timestamp: Date }) => {
      console.log('Room joined:', data);
      console.log('Participant:', data.participant);
      console.log('Participant keys:', Object.keys(data.participant || {}));
      
      // Backend participant'ını Frontend Player interface'ine map et
      const player: Player = {
        id: data.participant.id,
        name: data.participant.playerName || data.participant.name || 'Oyuncu',
        score: data.participant.currentScore || 0,
        isReady: data.participant.isReady || false,
        hasAnswered: false,
      };
      
      setMultiplayerState(prev => ({
        ...prev,
        players: [player], // Kendi oyuncuyu ekle
      }));
    };

    const handleError = (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    };

    // Add event listeners
    addEventListener('roomJoined', handleRoomJoined);
    addEventListener('playerJoined', handlePlayerJoined);
    addEventListener('playerLeft', handlePlayerLeft);
    addEventListener('gameStarted', handleGameStarted);
    addEventListener('playerAnswered', handlePlayerAnswered);
    addEventListener('nextQuestion', handleNextQuestion);
    addEventListener('gameCompleted', handleGameCompleted);
    addEventListener('error', handleError);

    // Cleanup
    return () => {
      removeEventListener('roomJoined', handleRoomJoined);
      removeEventListener('playerJoined', handlePlayerJoined);
      removeEventListener('playerLeft', handlePlayerLeft);
      removeEventListener('gameStarted', handleGameStarted);
      removeEventListener('playerAnswered', handlePlayerAnswered);
      removeEventListener('nextQuestion', handleNextQuestion);
      removeEventListener('gameCompleted', handleGameCompleted);
      removeEventListener('error', handleError);
    };
  }, [socket, addEventListener, removeEventListener]);

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
      // Start the game directly with existing questions
      console.log('Starting news trivia game with existing questions...');
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
      
      // Eğer soru yoksa, kullanıcıya bilgi ver
      if (errorMessage.includes('No questions available')) {
        setError('Şu anda haber trivia soruları mevcut değil. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError(errorMessage);
      }
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

        // Update multiplayer player score
        if (gameMode === 'multiplayer') {
          setMultiplayerState(prev => ({
            ...prev,
            players: prev.players.map(p => 
              p.id === clientIdRef.current 
                ? { ...p, score: p.score + 1, hasAnswered: true }
                : p
            ),
          }));
        }
      } else if (gameMode === 'multiplayer') {
        // Update multiplayer player as answered
        setMultiplayerState(prev => ({
          ...prev,
          players: prev.players.map(p => 
            p.id === clientIdRef.current 
              ? { ...p, hasAnswered: true }
              : p
          ),
        }));
      }

      // Send answer via WebSocket for multiplayer
      if (gameMode === 'multiplayer' && socketActions && multiplayerState.roomId) {
        socketActions.answerQuestion({
          roomId: multiplayerState.roomId,
          questionId: currentQ.id,
          answer: answer,
          timeSpent: GAME_DURATION - gameState.timeLeft,
        });
      }
    } catch (error) {
      console.error('Failed to answer question:', error);
    }
  };

  const nextQuestion = () => {
    if (gameMode === 'multiplayer' && socketActions && multiplayerState.roomId) {
      // Multiplayer: Use WebSocket
      socketActions.nextQuestion({
        roomId: multiplayerState.roomId,
      });
    } else {
      // Single player: Local logic
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
          <div className="text-white/60 text-sm">Oyun başlatılıyor...</div>
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
            <h2 className="text-2xl font-bold text-white mb-2">
              {error.includes('mevcut değil') ? 'Soru Bulunamadı' : 'Hata'}
            </h2>
            <p className="text-white/80 mb-6">{error}</p>
            {error.includes('mevcut değil') && (
              <p className="text-yellow-300 text-sm mb-6">
                Haber trivia soruları günlük olarak otomatik oluşturulur. 
                Lütfen daha sonra tekrar deneyin.
              </p>
            )}
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

  // Game mode selection screen
  if (gameMode === 'select') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
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

          {/* Game info header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-b from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Haber Trivia</h1>
            <p className="text-white/80 text-lg">Güncel gelişmeler hakkında kısa sorular</p>
          </div>

          {/* Game mode selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single Player Mode */}
            <div 
              onClick={() => setGameMode('single')}
              className="bg-gradient-to-br from-yellow-900/20 to-orange-800/10 border border-yellow-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-yellow-400/50 transition-all duration-200 group"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-b from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tek Oyunculu</h3>
              <p className="text-white/70 text-sm mb-4">Kendi hızınızda oynayın</p>
              <div className="flex items-center justify-center gap-4 text-xs text-white/60 mb-4">
                <div className="flex items-center gap-1">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Kolay</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>2-5 dk</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>+15 XP</span>
                </div>
              </div>
              <div className="text-yellow-400 text-sm font-semibold">Başla →</div>
            </div>

            {/* Multiplayer Mode */}
            <div 
              onClick={() => setGameMode('multiplayer')}
              className="bg-gradient-to-br from-purple-900/20 to-indigo-800/10 border border-purple-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400/50 transition-all duration-200 group"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-b from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h-2.5l-1.5-1.5 1.5-1.5H20v-2h-3.5l-1.5-1.5 1.5-1.5H20V4h-6v2.5l-1.5 1.5-1.5-1.5V4H4v2.5l1.5 1.5L4 9.5V12h3.5l1.5 1.5L7.5 15H4v2h2.5l1.5 1.5L7.5 20H4v2h6v-2.5l1.5-1.5 1.5 1.5V22h6v-2.5l1.5-1.5 1.5 1.5V22h6z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Çok Oyunculu</h3>
              <p className="text-white/70 text-sm mb-4">Arkadaşlarınızla yarışın</p>
              <div className="flex items-center justify-center gap-4 text-xs text-white/60 mb-4">
                <div className="flex items-center gap-1">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Kolay</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>5-10 dk</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>+25 XP</span>
                </div>
              </div>
              <div className="text-purple-400 text-sm font-semibold">Başla →</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer mode - show lobby
  if (gameMode === 'multiplayer' && !multiplayerState.roomId) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Back button */}
          <button
            onClick={() => setGameMode('select')}
            className="mb-6 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>

          <MultiplayerLobby
            onRoomJoined={(roomId) => {
              setMultiplayerState(prev => ({
                ...prev,
                roomId,
                isHost: false,
                players: [], // Boş başlat, WebSocket join'de eklenecek
              }));
              
              // Join room via WebSocket
              if (socketActions) {
                socketActions.joinRoom({
                  roomId,
                  playerName: 'You',
                });
              }
            }}
            onRoomCreated={(roomId) => {
              setMultiplayerState(prev => ({
                ...prev,
                roomId,
                isHost: true,
                players: [], // Boş başlat, WebSocket join'de eklenecek
              }));
              
              // Join room via WebSocket
              if (socketActions) {
                socketActions.joinRoom({
                  roomId,
                  playerName: 'You',
                });
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Multiplayer room lobby
  if (gameMode === 'multiplayer' && multiplayerState.roomId && !multiplayerState.gameStarted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Back button */}
          <button
            onClick={() => setGameMode('select')}
            className="mb-6 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>

          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-800/10 border border-purple-500/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Oda: {multiplayerState.roomId}
              </h2>
              <p className="text-white/80">
                {multiplayerState.players.length} oyuncu odada
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Oyuncular</h3>
              <div className="space-y-2">
                {multiplayerState.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                    <span className="font-medium text-white">{player.name}</span>
                    <span className="text-sm text-white/60">
                      {player.isReady ? 'Hazır' : 'Hazır Değil'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {multiplayerState.isHost && (
              <div className="text-center">
                <button
                  onClick={async () => {
                    // Start multiplayer game via WebSocket
                    try {
                      setIsLoading(true);
                      
                      if (socketActions && multiplayerState.roomId) {
                        socketActions.startGame({
                          roomId: multiplayerState.roomId,
                        });
                      }
                    } catch (error) {
                      console.error('Failed to start multiplayer game:', error);
                      setError(error instanceof Error ? error.message : 'Failed to start game');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={multiplayerState.players.length < 2}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-colors text-lg font-semibold"
                >
                  Oyunu Başlat ({multiplayerState.players.length}/2+ oyuncu)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game start screen (for single player)
  if (gameMode === 'single' && !gameState.isGameActive && !gameState.isGameComplete) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Back button */}
          <button
            onClick={() => setGameMode('select')}
            className="mb-6 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
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

  // Multiplayer game in progress
  if (gameMode === 'multiplayer' && multiplayerState.gameStarted && game) {
    const currentQ = game.questions[gameState.currentQuestion];
    const progress = ((gameState.currentQuestion + 1) / game.questions.length) * 100;

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
              onClick={() => setGameMode('select')}
              className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {gameState.timeLeft}s
              </div>
              <div className="text-sm text-white/60">Kalan Süre</div>
            </div>
          </div>

          {/* Multiplayer Players */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Oyuncular</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {multiplayerState.players.map((player) => (
                <div key={player.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{player.name}</span>
                    <span className="text-lg font-bold text-purple-400">{player.score}</span>
                  </div>
                  {player.hasAnswered && (
                    <div className="text-sm text-green-400 mt-1">Cevapladı</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Soru {gameState.currentQuestion + 1} / {game.questions.length}</span>
              <span>%{Math.round(progress)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-800/10 border border-purple-500/30 rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQ.question}
            </h2>
            
            <div className="space-y-3">
              {currentQ.options?.map((option, index) => {
                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                
                if (gameState.showResult) {
                  if (option === currentQ.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-500/20 text-green-300";
                  } else if (gameState.selectedAnswer === option) {
                    buttonClass += "border-red-500 bg-red-500/20 text-red-300";
                  } else {
                    buttonClass += "border-white/20 bg-white/5 text-white/60";
                  }
                } else {
                  buttonClass += gameState.selectedAnswer === option
                    ? "border-purple-500 bg-purple-500/20 text-purple-300"
                    : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30";
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
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-purple-300 text-sm">
                  <strong>Açıklama:</strong> {currentQ.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Next button */}
          {gameState.showResult && (
            <div className="text-center">
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
              >
                {gameState.currentQuestion < game.questions.length - 1 ? 'Sonraki Soru' : 'Oyunu Bitir'}
              </button>
            </div>
          )}

          {/* Multiplayer Game Complete */}
          {gameState.isGameComplete && (
            <MultiplayerResults
              players={multiplayerState.players}
              onPlayAgain={() => {
                // Reset multiplayer game state
                setMultiplayerState(prev => ({
                  ...prev,
                  gameStarted: false,
                  isWaitingForPlayers: true,
                  players: prev.players.map(p => ({ ...p, score: 0, hasAnswered: false })),
                }));
                setGameState(prev => ({
                  ...prev,
                  currentQuestion: 0,
                  score: 0,
                  timeLeft: GAME_DURATION,
                  isGameActive: false,
                  isGameComplete: false,
                  selectedAnswer: null,
                  showResult: false,
                  gameId: null,
                }));
                setGame(null);
              }}
              onBackToGames={() => setGameMode('select')}
            />
          )}
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