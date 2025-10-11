'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import { useNews } from '@/hooks/use-news';

interface MemoryCard {
  id: string;
  newsId: string;
  title: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onComplete: (score: number, timeSpent: number) => void;
  onClose: () => void;
  onShare?: () => void;
}

export function MemoryGame({ onComplete, onClose, onShare }: MemoryGameProps): JSX.Element {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: newsData, isLoading: newsLoading } = useNews({ limit: 20 });

  // Initialize game with news data
  useEffect(() => {
    if (newsData && newsData.length > 0) {
      initializeGame();
    }
  }, [newsData]);

  const initializeGame = useCallback(() => {
    if (!newsData || newsData.length < 6) {
      setError('Yeterli haber bulunamadı. Lütfen daha sonra tekrar deneyin.');
      setIsLoading(false);
      return;
    }

    // Select 6 random news items
    const shuffledNews = [...newsData].sort(() => Math.random() - 0.5).slice(0, 6);
    
    // Create pairs of cards
    const gameCards: MemoryCard[] = [];
    shuffledNews.forEach((news, index) => {
      // Create two cards for each news item
      gameCards.push(
        {
          id: `card-${index}-1`,
          newsId: news.id,
          title: news.title,
          imageUrl: news.primaryMedia?.url || 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=400&q=60',
          isFlipped: false,
          isMatched: false,
        },
        {
          id: `card-${index}-2`,
          newsId: news.id,
          title: news.title,
          imageUrl: news.primaryMedia?.url || 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=400&q=60',
          isFlipped: false,
          isMatched: false,
        }
      );
    });

    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setIsLoading(false);
  }, [newsData]);

  const handleCardClick = (cardIndex: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    if (flippedCards.length >= 2 || cards[cardIndex].isFlipped || cards[cardIndex].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardIndex];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prevCards =>
      prevCards.map((card, index) =>
        index === cardIndex ? { ...card, isFlipped: true } : card
      )
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.newsId === secondCard.newsId) {
        // Match found
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, isMatched: true }
              : card
          )
        );
        
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);

        // Check if game is completed
        if (matchedPairs + 1 === 6) {
          setGameCompleted(true);
          const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
          setTimeout(() => {
            onComplete(6, timeSpent);
          }, 1000);
        }
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setIsLoading(true);
    setError(null);
    initializeGame();
  };

  if (newsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/70">Haberler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-8 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{matchedPairs}</div>
          <div className="text-sm text-white/70">Eşleşme</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{moves}</div>
          <div className="text-sm text-white/70">Hareket</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}s
          </div>
          <div className="text-sm text-white/70">Süre</div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              card.isFlipped || card.isMatched
                ? 'rotate-y-180'
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className={`relative w-full h-full rounded-lg overflow-hidden ${
              card.isMatched 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : card.isFlipped 
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-white/10 border border-white/20'
            }`}>
              {card.isFlipped || card.isMatched ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=400&q=60';
                      }}
                    />
                    {card.isMatched && (
                      <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                        <div className="text-4xl">✅</div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-black/50">
                    <p className="text-xs text-white line-clamp-2">{card.title}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl opacity-50">🧩</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          Yeni Oyun
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
        >
          Çıkış
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
          >
            Paylaş
          </button>
        )}
      </div>

      {/* Game Complete Modal */}
      {gameCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2234] rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Tebrikler!</h2>
            <p className="text-white/70 mb-6">
              Tüm eşleşmeleri {moves} hareketle tamamladınız!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
              >
                Tekrar Oyna
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
