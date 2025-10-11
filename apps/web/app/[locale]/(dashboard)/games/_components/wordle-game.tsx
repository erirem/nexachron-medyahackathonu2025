'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import type { WordleGame, WordleAttempt, WordleLetterResult, WordleStats } from '../_types/game-types';

// Genişletilmiş Türkçe kelime havuzu (normalize edilmiş hali)
const WORDS = [
  // Temel kelimeler
  'KALEM', 'KITAP', 'MASAL', 'GUNES', 'AYDIN', 'BILGI', 'HAYAT', 'SEVIN', 'MUTLU', 'GUZEL',
  'BUYUK', 'KUCUK', 'SICAK', 'SOGUK', 'HIZLI', 'YAVAS', 'GUCLU', 'ZAYIF', 'TEMIZ', 'KIRLI',
  'SESSIZ', 'ACIK', 'KAPALI', 'ICERI', 'DISARI', 'YUKARI', 'ASAGI', 'ILERI', 'GERI', 'SAGA',
  'SOLA', 'ONCE', 'SONRA', 'BASAR', 'CIRKIN', 'APTAL', 'AKILLI', 'GENC', 'YASLI', 'SAGLIK',
  
  // Doğa ve çevre
  'AGAC', 'CICEK', 'BULUT', 'YAGMUR', 'KAR', 'RUZGAR', 'DENIZ', 'DAG', 'VADI', 'ORMAN',
  'NEHIR', 'GOL', 'GOK', 'YILDIZ', 'AY', 'GUNES', 'TOPRAK', 'TAS', 'KUM', 'CIMEN',
  
  // Hayvanlar
  'KEDI', 'KOPEK', 'KUS', 'BALIK', 'AT', 'INEK', 'KOYUN', 'KEÇI', 'TAVUK', 'HOROZ',
  'KURT', 'AYI', 'KAPLAN', 'ASLAN', 'FIL', 'ZURAFA', 'MAYMUN', 'YILAN', 'KURBAĞA', 'KELEBEK',
  
  // Yiyecekler
  'EKMEK', 'SU', 'SUT', 'ET', 'BAL', 'PEYNIR', 'YUMURTA', 'SEBZE', 'MEYVE', 'CICEK',
  'PILAV', 'CORBA', 'SALATA', 'KAHVE', 'CAY', 'MEYVE', 'ELMA', 'ARMUT', 'MUZ', 'PORTAKAL',
  
  // Renkler
  'BEYAZ', 'SIYAH', 'KIRMIZI', 'MAVI', 'YESIL', 'SARI', 'MOR', 'TURUNCU', 'PEMBE', 'GRI',
  
  // Meslekler
  'DOKTOR', 'OGRETMEN', 'MUHENDIS', 'AVUKAT', 'POLIS', 'ASKER', 'SANATCI', 'YAZAR', 'SAIR', 'MUZIK',
  
  // Spor ve oyunlar
  'FUTBOL', 'BASKET', 'VOLEYBOL', 'TENIS', 'YUZME', 'KOSU', 'ATLAMA', 'DANS', 'OYUN', 'MASA',
  
  // Teknoloji
  'BILGISAYAR', 'TELEFON', 'INTERNET', 'YAZILIM', 'DONANIM', 'EKRAN', 'KLAVYE', 'FARE', 'KAMERA', 'MIKROFON',
  
  // Duygular ve karakter
  'MUTLU', 'UZGUN', 'KIZGIN', 'KORKU', 'SASIRMA', 'MERAK', 'SEVGI', 'NEFRET', 'UMUT', 'KAYGI',
  
  // Zaman ve tarih
  'SABAH', 'OGLE', 'AKSAM', 'GECE', 'HAFTA', 'AY', 'YIL', 'GECMIS', 'GELECEK', 'SIMDI',
  
  // Ev ve aile
  'EV', 'ODA', 'MUTFAK', 'YATAK', 'MASA', 'SANDALYE', 'PENCERE', 'KAPI', 'BANYO', 'SALON',
  'ANNE', 'BABA', 'KARDES', 'COCUK', 'BEBEK', 'DEDE', 'NINE', 'AMCA', 'TEYZE', 'KUZEN'
];

// Günlük kelime için hash fonksiyonu
const getDailyWord = (): string => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Basit hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer'a çevir
  }
  
  const index = Math.abs(hash) % WORDS.length;
  return WORDS[index];
};

interface WordleGameProps {
  onComplete: (isWon: boolean, attempts: number, stats: WordleStats) => void;
  onClose: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  dailyMode?: boolean;
}

export function WordleGame({ onComplete, onClose, difficulty = 'medium', dailyMode = true }: WordleGameProps): JSX.Element {
  const [game, setGame] = useState<WordleGame>(() => {
    const word = dailyMode ? getDailyWord() : WORDS[Math.floor(Math.random() * WORDS.length)];
    return {
      id: Date.now().toString(),
      word: word,
      maxAttempts: difficulty === 'easy' ? 8 : difficulty === 'hard' ? 5 : 6,
      currentAttempt: 0,
      attempts: [],
      isCompleted: false,
      isWon: false,
      startTime: new Date()
    };
  });

  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [keyboardState, setKeyboardState] = useState<Record<string, 'correct' | 'present' | 'absent' | 'unused'>>({});
  const [stats, setStats] = useState<WordleStats>(() => {
    const saved = localStorage.getItem('wordle-stats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0],
      averageGuesses: 0
    };
  });

  // Türkçe karakterleri normalize et
  const normalizeTurkish = (str: string): string => {
    return str
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'i')
      .replace(/Ğ/g, 'G')
      .replace(/ğ/g, 'g')
      .replace(/Ü/g, 'U')
      .replace(/ü/g, 'u')
      .replace(/Ş/g, 'S')
      .replace(/ş/g, 's')
      .replace(/Ö/g, 'O')
      .replace(/ö/g, 'o')
      .replace(/Ç/g, 'C')
      .replace(/ç/g, 'c')
      .toUpperCase();
  };

  // Kelimeyi kontrol et
  const checkWord = useCallback((guess: string): WordleLetterResult[] => {
    const result: WordleLetterResult[] = [];
    const wordArray = game.word.split('');
    const guessArray = guess.split('');

    // Önce doğru pozisyonları kontrol et
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === wordArray[i]) {
        result[i] = { letter: guessArray[i], status: 'correct', position: i };
        wordArray[i] = ''; // Kullanılan harfi işaretle
      }
    }

    // Sonra mevcut ama yanlış pozisyonları kontrol et
    for (let i = 0; i < 5; i++) {
      if (result[i]) continue; // Zaten doğru pozisyon

      const letterIndex = wordArray.indexOf(guessArray[i]);
      if (letterIndex !== -1) {
        result[i] = { letter: guessArray[i], status: 'present', position: i };
        wordArray[letterIndex] = ''; // Kullanılan harfi işaretle
      } else {
        result[i] = { letter: guessArray[i], status: 'absent', position: i };
      }
    }

    return result;
  }, [game.word]);

  // İstatistikleri güncelle
  const updateStats = useCallback((isWon: boolean, attempts: number) => {
    const newStats = { ...stats };
    newStats.gamesPlayed++;
    
    if (isWon) {
      newStats.gamesWon++;
      newStats.currentStreak++;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.guessDistribution[attempts - 1]++;
    } else {
      newStats.currentStreak = 0;
    }
    
    newStats.averageGuesses = newStats.gamesWon > 0 
      ? newStats.guessDistribution.reduce((sum, count, index) => sum + (count * (index + 1)), 0) / newStats.gamesWon
      : 0;
    
    setStats(newStats);
    localStorage.setItem('wordle-stats', JSON.stringify(newStats));
  }, [stats]);

  // Klavye durumunu güncelle
  const updateKeyboardState = useCallback((result: WordleLetterResult[]) => {
    const newKeyboardState = { ...keyboardState };
    
    result.forEach(letter => {
      const currentState = newKeyboardState[letter.letter];
      if (!currentState || currentState === 'unused') {
        newKeyboardState[letter.letter] = letter.status;
      } else if (currentState === 'present' && letter.status === 'correct') {
        newKeyboardState[letter.letter] = 'correct';
      }
    });
    
    setKeyboardState(newKeyboardState);
  }, [keyboardState]);

  // Tahmin gönder
  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      setMessage('5 harfli bir kelime girin!');
      return;
    }

    const normalizedGuess = normalizeTurkish(currentGuess);
    if (!WORDS.includes(normalizedGuess)) {
      setMessage('Geçerli bir kelime girin!');
      return;
    }

    setIsAnimating(true);
    setMessage('');

    // Animasyon için kısa gecikme
    setTimeout(() => {
      const result = checkWord(normalizedGuess);
      const newAttempt: WordleAttempt = {
        word: normalizedGuess,
        result,
        isComplete: true
      };

      const isWon = result.every(letter => letter.status === 'correct');
      const newAttempts = [...game.attempts, newAttempt];
      const newCurrentAttempt = game.currentAttempt + 1;
      const isCompleted = isWon || newCurrentAttempt >= game.maxAttempts;

      setGame(prev => ({
        ...prev,
        attempts: newAttempts,
        currentAttempt: newCurrentAttempt,
        isCompleted,
        isWon,
        endTime: isCompleted ? new Date() : prev.endTime
      }));

      updateKeyboardState(result);
      setCurrentGuess('');
      setIsAnimating(false);

      if (isCompleted) {
        updateStats(isWon, newCurrentAttempt);
        setTimeout(() => {
          onComplete(isWon, newCurrentAttempt, stats);
        }, 1500);
      }
    }, 500);
  }, [currentGuess, game.attempts, game.currentAttempt, game.maxAttempts, checkWord, onComplete, updateKeyboardState, updateStats, stats]);

  // Klavye girişi
  const handleKeyPress = useCallback((key: string) => {
    if (game.isCompleted || isAnimating) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key.length === 1 && /[A-ZÇĞIİÖŞÜa-zçğıiöşü]/i.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key.toUpperCase());
      }
    }
  }, [currentGuess, game.isCompleted, isAnimating, submitGuess]);

  // Klavye event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (e.key.length === 1) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Harf rengi ve animasyon
  const getLetterColor = (status: 'correct' | 'present' | 'absent') => {
    switch (status) {
      case 'correct': return 'bg-green-500 text-white border-green-500';
      case 'present': return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent': return 'bg-gray-600 text-white border-gray-600';
      default: return 'bg-gray-700 text-white border-gray-700';
    }
  };

  // Klavye tuşu rengi
  const getKeyColor = (key: string) => {
    const state = keyboardState[key];
    switch (state) {
      case 'correct': return 'bg-green-500 text-white';
      case 'present': return 'bg-yellow-500 text-white';
      case 'absent': return 'bg-gray-600 text-white';
      default: return 'bg-gray-700 text-white hover:bg-gray-600';
    }
  };

  // Türkçe klavye düzeni
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Game Modal */}
      <div className="relative w-full max-w-md bg-[#1a2234] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📝</span>
              <span>Wordle</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Game Info */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-2">
              {game.currentAttempt} / {game.maxAttempts} deneme
            </p>
            <p className="text-white/50 text-xs">
              5 harfli Türkçe kelimeyi bulun!
            </p>
          </div>
        </div>

        {/* Game Board */}
        <div className="p-6">
          {/* Difficulty and Mode Info */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 text-sm text-white/60">
              <span className={`px-3 py-1 rounded-full ${
                difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {difficulty === 'easy' ? 'Kolay' : difficulty === 'hard' ? 'Zor' : 'Orta'}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                dailyMode ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {dailyMode ? 'Günlük Kelime' : 'Rastgele Kelime'}
              </span>
            </div>
          </div>

          {/* Attempts */}
          <div className="space-y-2 mb-6">
            {Array.from({ length: game.maxAttempts }).map((_, attemptIndex) => {
              const attempt = game.attempts[attemptIndex];
              const isCurrentAttempt = attemptIndex === game.currentAttempt && !game.isCompleted;
              
              return (
                <div key={attemptIndex} className="flex gap-2 justify-center">
                  {Array.from({ length: 5 }).map((_, letterIndex) => {
                    const letter = attempt?.word[letterIndex] || '';
                    const result = attempt?.result[letterIndex];
                    const isCurrentLetter = isCurrentAttempt && letterIndex === currentGuess.length;
                    
                    return (
                      <div
                        key={letterIndex}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-500 ${
                          result
                            ? `${getLetterColor(result.status)} border-transparent animate-pulse`
                            : isCurrentLetter
                            ? 'bg-white/20 border-blue-400 text-white animate-pulse'
                            : 'bg-white/5 border-white/20 text-white/50'
                        }`}
                        style={{
                          animationDelay: result ? `${letterIndex * 100}ms` : '0ms'
                        }}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Current Guess Input */}
          {!game.isCompleted && (
            <div className="mb-4">
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all ${
                      index < currentGuess.length
                        ? 'bg-white/20 border-blue-400 text-white'
                        : 'bg-white/5 border-white/20 text-white/50'
                    }`}
                  >
                    {currentGuess[index] || ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className="text-center mb-4">
              <p className="text-yellow-400 text-sm">{message}</p>
            </div>
          )}

          {/* Game Complete Message */}
          {game.isCompleted && (
            <div className="text-center mb-4">
              {game.isWon ? (
                <div>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-green-400 font-bold text-lg">Tebrikler!</p>
                  <p className="text-white/70 text-sm">
                    Kelimeyi {game.currentAttempt} denemede buldunuz!
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">😔</div>
                  <p className="text-red-400 font-bold text-lg">Kaybettiniz!</p>
                  <p className="text-white/70 text-sm">
                    Doğru kelime: <span className="font-bold">{game.word}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Virtual Keyboard */}
          <div className="mb-6">
            <div className="space-y-2">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 justify-center">
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${getKeyColor(key)}`}
                      disabled={game.isCompleted || isAnimating}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex gap-1 justify-center">
                <button
                  onClick={() => handleKeyPress('ENTER')}
                  className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  disabled={game.isCompleted || isAnimating}
                >
                  ENTER
                </button>
                <button
                  onClick={() => handleKeyPress('BACKSPACE')}
                  className="px-4 py-2 text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                  disabled={game.isCompleted || isAnimating}
                >
                  ←
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {!game.isCompleted ? (
              <>
                <button
                  onClick={submitGuess}
                  disabled={currentGuess.length !== 5 || isAnimating}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {isAnimating ? 'Kontrol Ediliyor...' : 'Tahmin Et'}
                </button>
                <button
                  onClick={() => setCurrentGuess('')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Temizle
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                Kapat
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="text-xs text-white/60 text-center space-y-1">
            <p><span className="text-green-400">■</span> Doğru harf, doğru pozisyon</p>
            <p><span className="text-yellow-400">■</span> Doğru harf, yanlış pozisyon</p>
            <p><span className="text-gray-400">■</span> Harf kelimede yok</p>
          </div>
        </div>
      </div>
    </div>
  );
}
