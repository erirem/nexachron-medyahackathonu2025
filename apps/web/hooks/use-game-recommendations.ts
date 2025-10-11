import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';
import type { 
  GameRecommendation, 
  GameRecommendationConfig, 
  UserGamePreferences,
  AIRecommendationReason
} from '@/lib/types/game-recommendations';
import { AI_RECOMMENDATION_REASONS } from '@/lib/types/game-recommendations';

// Mevcut oyunlar listesi (games/page.tsx'den alındı)
const AVAILABLE_GAMES = [
  {
    id: 'quizzes',
    title: 'Haber Quizleri',
    description: 'Güncel haberlerle bilgini test et',
    icon: 'quiz',
    color: 'blue' as const,
    category: 'educational' as const,
    difficulty: 'easy' as const,
    xpReward: 30,
    estimatedTime: '5-10 dk',
    href: '/quizzes',
    matchedCategories: ['Genel Kültür', 'Eğitim', 'Teknoloji']
  },
  {
    id: 'news-trivia',
    title: 'Haber Trivia',
    description: 'Hızlı sorularla gündem bilgini ölç',
    icon: 'lightning',
    color: 'yellow' as const,
    category: 'trivia' as const,
    difficulty: 'easy' as const,
    xpReward: 15,
    estimatedTime: '3-5 dk',
    href: '/games/news-trivia',
    matchedCategories: ['Genel Kültür', 'Spor', 'Siyaset']
  },
  {
    id: 'news-guessr',
    title: 'Haber Coğrafyası',
    description: 'Haberlerin yerini haritada bul',
    icon: 'map',
    color: 'cyan' as const,
    category: 'trivia' as const,
    difficulty: 'medium' as const,
    xpReward: 30,
    estimatedTime: '5-8 dk',
    href: '/games/news-guessr',
    matchedCategories: ['Dünya', 'Coğrafya', 'Seyahat']
  },
  {
    id: 'wordle',
    title: 'Kelime Oyunu',
    description: 'Günün kelimesini 6 denemede bul',
    icon: 'text',
    color: 'green' as const,
    category: 'word' as const,
    difficulty: 'medium' as const,
    xpReward: 35,
    estimatedTime: '5-10 dk',
    href: '/games/wordle',
    matchedCategories: ['Dil', 'Eğitim', 'Genel Kültür']
  },
  {
    id: 'memory-game',
    title: 'Hafıza Oyunu',
    description: 'Haber görsellerini eşleştir',
    icon: 'brain',
    color: 'purple' as const,
    category: 'memory' as const,
    difficulty: 'medium' as const,
    xpReward: 25,
    estimatedTime: '3-7 dk',
    href: '/games/memory-game',
    matchedCategories: ['Genel Kültür', 'Eğitim']
  },
  {
    id: 'flappy-aa-bird',
    title: 'Flappy AA Bird',
    description: 'AA maskotu ile eğlenceli arcade oyunu',
    icon: 'gamepad',
    color: 'orange' as const,
    category: 'arcade' as const,
    difficulty: 'medium' as const,
    xpReward: 20,
    estimatedTime: '2-5 dk',
    href: '/games/flappy-aa-bird',
    matchedCategories: ['Eğlence', 'Arcade']
  }
];

const DEFAULT_CONFIG: GameRecommendationConfig = {
  maxRecommendationsPerPage: 2,
  minSpacingBetweenCards: 3,
  aiRecommendationProbability: 0.7,
  playerCountRange: {
    min: 50,
    max: 500
  }
};

// Mock kullanıcı tercihlerini al (gerçekte Supabase'den gelecek)
const getMockUserPreferences = (): UserGamePreferences => {
  return {
    preferredCategories: ['Teknoloji', 'Spor', 'Ekonomi', 'Genel Kültür'],
    completedGames: ['news-trivia'],
    favoriteGameTypes: ['trivia', 'educational'],
    lastPlayedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
    totalGamesPlayed: 5
  };
};

// Oyuncu sayısını random generate et
const generatePlayerCount = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// AI öneri sebebini random seç
const getRandomAIReason = (): AIRecommendationReason => {
  const reasons = AI_RECOMMENDATION_REASONS;
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Kullanıcı kategorilerine göre oyunları filtrele ve skorla
const scoreGameForUser = (game: typeof AVAILABLE_GAMES[0], userPrefs: UserGamePreferences): number => {
  let score = 0;
  
  // Kategori eşleşmesi (en önemli faktör)
  const categoryMatches = game.matchedCategories.some(cat => 
    userPrefs.preferredCategories.includes(cat)
  );
  if (categoryMatches) score += 50;
  
  // Favori oyun tipi
  if (userPrefs.favoriteGameTypes.includes(game.category)) score += 30;
  
  // Tamamlanmamış oyunlar öncelikli
  if (!userPrefs.completedGames.includes(game.id)) score += 20;
  
  // XP reward'a göre bonus
  score += game.xpReward * 0.5;
  
  // Random faktör (çeşitlilik için)
  score += Math.random() * 10;
  
  return score;
};

export function useGameRecommendations(newsCount: number = 0) {
  const locale = useLocale();
  const { userProfile } = useGamification();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const userPreferences = useMemo(() => getMockUserPreferences(), []);
  
  useEffect(() => {
    const generateRecommendations = () => {
      setIsLoading(true);
      
      // Kullanıcı tercihlerine göre oyunları skorla
      const scoredGames = AVAILABLE_GAMES.map(game => ({
        game,
        score: scoreGameForUser(game, userPreferences)
      }));
      
      // En yüksek skorlu oyunları seç
      const topGames = scoredGames
        .sort((a, b) => b.score - a.score)
        .slice(0, DEFAULT_CONFIG.maxRecommendationsPerPage)
        .map(({ game }) => game);
      
      // GameRecommendation formatına çevir
      const gameRecommendations: GameRecommendation[] = topGames.map(game => {
        const isAIRecommended = Math.random() < DEFAULT_CONFIG.aiRecommendationProbability;
        const hasChallenge = Math.random() < 0.4; // %40 şans
        
        return {
          id: game.id,
          title: game.title,
          description: game.description,
          icon: game.icon,
          color: game.color,
          category: game.category,
          difficulty: game.difficulty,
          xpReward: game.xpReward,
          estimatedTime: game.estimatedTime,
          activePlayerCount: generatePlayerCount(
            DEFAULT_CONFIG.playerCountRange.min,
            DEFAULT_CONFIG.playerCountRange.max
          ),
          isRecommendedByAI: isAIRecommended,
          aiRecommendationReason: isAIRecommended ? getRandomAIReason() : undefined,
          hasActiveChallenge: hasChallenge,
          streakContinuation: userProfile?.currentStreak && userProfile.currentStreak > 0 ? {
            currentStreak: userProfile.currentStreak,
            nextReward: (userProfile.currentStreak + 1) * 5
          } : undefined,
          matchedCategories: game.matchedCategories,
          href: `/${locale}${game.href}`
        };
      });
      
      setRecommendations(gameRecommendations);
      setIsLoading(false);
    };
    
    // Haber sayısına göre öneri generate et
    if (newsCount > 0) {
      generateRecommendations();
    }
  }, [newsCount, locale, userProfile, userPreferences]);
  
  // Oyun kartlarının grid'de hangi pozisyonlarda görüneceğini hesapla
  const getRecommendationPositions = (totalItems: number): number[] => {
    if (recommendations.length === 0) return [];
    
    const positions: number[] = [];
    const spacing = DEFAULT_CONFIG.minSpacingBetweenCards;
    
    // İlk öneri için minimum 2. pozisyon
    let nextPosition = Math.max(2, Math.floor(Math.random() * spacing) + 2);
    
    for (let i = 0; i < recommendations.length && nextPosition < totalItems; i++) {
      positions.push(nextPosition);
      // Sonraki pozisyon için minimum spacing bırak
      nextPosition += spacing + Math.floor(Math.random() * 3) + 1;
    }
    
    return positions;
  };
  
  return {
    recommendations,
    isLoading,
    getRecommendationPositions,
    config: DEFAULT_CONFIG
  };
}
