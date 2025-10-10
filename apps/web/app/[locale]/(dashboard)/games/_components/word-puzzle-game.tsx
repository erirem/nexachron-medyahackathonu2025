'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';

interface WordPuzzleGameProps {
  onComplete: (score: number, wordsFound: number, timeSpent: number) => void;
  onClose: () => void;
  onShare?: () => void;
}

// Türkçe kelimeler veritabanı (haber temalı)
const TURKISH_WORDS = [
  'HABER', 'GAZETE', 'TELEVIZYON', 'RADYO', 'INTERNET', 'SOSYAL', 'MEDYA',
  'POLITIKA', 'EKONOMI', 'SPOR', 'KULTUR', 'SANAT', 'MUZIK', 'SINEMA',
  'TURIZM', 'SAGLIK', 'EGITIM', 'TEKNOLOJI', 'BILIM', 'ARASTIRMA',
  'GELISME', 'YENILIK', 'BULUS', 'ICAT', 'KEŞIF', 'ARAMA', 'BULMA',
  'KELIME', 'BULMACA', 'OYUN', 'YARISMA', 'BASARI', 'KAZANMA',
  'OGRENME', 'BILGI', 'HAFIZA', 'DUSUNME', 'MANTIK', 'AKIL',
  'ZEKA', 'YARATICILIK', 'HAYAL', 'RUYA', 'UMUT', 'MUTLULUK',
  'SEVINC', 'GURUR', 'ONUR', 'SAYGI', 'SEVGI', 'ARKADASLIK',
  'AİLE', 'EV', 'YURT', 'VATAN', 'ULKE', 'MİLLET', 'HALK',
  'INSAN', 'KISI', 'BIRAK', 'KADIN', 'ERKEK', 'COCUK', 'YASLI',
  'GENÇ', 'YASLI', 'YENI', 'ESKI', 'BUYUK', 'KUCUK', 'UZUN', 'KISA',
  'YUKSEK', 'ALCAK', 'GENIS', 'DAR', 'KALIN', 'INCE', 'AGIR', 'HAFIF',
  'SICAK', 'SOGUK', 'ILIK', 'SERT', 'YUMUSAK', 'TEMIZ', 'KIRLI',
  'GUVENLI', 'TEHLIKELI', 'KOLAY', 'ZOR', 'BASIT', 'KARMASIK',
  'HIZLI', 'YAVAS', 'ERKEN', 'GEC', 'SABAH', 'AKSAM', 'GECE', 'GUNDUZ'
];

// Kelime bulmaca oluşturucu
const generateWordPuzzle = () => {
  // Rastgele 7 harf seç
  const selectedWords = TURKISH_WORDS.sort(() => Math.random() - 0.5).slice(0, 3);
  const allLetters = selectedWords.join('').split('').sort(() => Math.random() - 0.5);
  const puzzleLetters = allLetters.slice(0, 7);
  
  return {
    letters: puzzleLetters,
    words: selectedWords,
    foundWords: [] as string[],
    score: 0
  };
};

export function WordPuzzleGame({ onComplete, onClose, onShare }: WordPuzzleGameProps): JSX.Element {
  const [puzzle, setPuzzle] = useState(generateWordPuzzle());
  const [currentWord, setCurrentWord] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);

  // Oyunu başlat
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setPuzzle(generateWordPuzzle());
    setCurrentWord('');
    setSelectedLetters([]);
    setMessage('');
  };

  // Harf seç
  const selectLetter = (index: number) => {
    if (gameCompleted || selectedLetters.includes(index)) return;
    
    setSelectedLetters(prev => [...prev, index]);
    setCurrentWord(prev => prev + puzzle.letters[index]);
  };

  // Harf kaldır
  const removeLetter = (index: number) => {
    if (gameCompleted) return;
    
    const letterIndex = selectedLetters.indexOf(index);
    if (letterIndex === -1) return;
    
    setSelectedLetters(prev => prev.filter((_, i) => i !== letterIndex));
    setCurrentWord(prev => prev.slice(0, letterIndex) + prev.slice(letterIndex + 1));
  };

  // Kelimeyi kontrol et
  const checkWord = () => {
    if (currentWord.length < 3) {
      setMessage('En az 3 harfli bir kelime girin!');
      return;
    }

    const normalizedWord = currentWord.toUpperCase();
    
    if (puzzle.foundWords.includes(normalizedWord)) {
      setMessage('Bu kelimeyi zaten buldunuz!');
      return;
    }

    if (puzzle.words.includes(normalizedWord)) {
      // Kelime bulundu!
      const newFoundWords = [...puzzle.foundWords, normalizedWord];
      const newScore = puzzle.score + normalizedWord.length * 10;
      
      setPuzzle(prev => ({
        ...prev,
        foundWords: newFoundWords,
        score: newScore
      }));
      
      setMessage(`🎉 Harika! "${normalizedWord}" kelimesini buldunuz! +${normalizedWord.length * 10} puan`);
      
      // Tüm kelimeler bulundu mu kontrol et
      if (newFoundWords.length === puzzle.words.length) {
        setGameCompleted(true);
        const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        setTimeout(() => {
          onComplete(newScore, newFoundWords.length, timeSpent);
        }, 2000);
      }
    } else {
      setMessage('Bu kelime bulunamadı!');
    }
    
    setCurrentWord('');
    setSelectedLetters([]);
  };

  // Oyunu sıfırla
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setPuzzle(generateWordPuzzle());
    setCurrentWord('');
    setSelectedLetters([]);
    setMessage('');
  };

  // Harf butonları
  const LetterButton = ({ letter, index }: { letter: string; index: number }) => {
    const isSelected = selectedLetters.includes(index);
    
    return (
      <button
        onClick={() => isSelected ? removeLetter(index) : selectLetter(index)}
        className={`w-12 h-12 rounded-lg font-bold text-lg transition-all duration-200 ${
          isSelected
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
        }`}
      >
        {letter}
      </button>
    );
  };

  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
          <div className="text-6xl mb-6">🔤</div>
          <h2 className="text-2xl font-bold mb-4">Kelime Bulmaca</h2>
          <p className="text-white/70 mb-6">
            Verilen harflerden anlamlı kelimeler oluşturun. 
            Her kelime için harf sayısı kadar puan kazanırsınız!
          </p>
          <div className="space-y-4">
            <div className="text-sm text-white/60">
              <p>• En az 3 harfli kelimeler geçerli</p>
              <p>• Harfleri sırayla seçin</p>
              <p>• Tüm kelimeleri bulun ve skorunuzu artırın!</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors"
            >
              Oyunu Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Oyun İstatistikleri */}
      <div className="flex justify-between items-center mb-8 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{puzzle.score}</div>
          <div className="text-sm text-white/70">Puan</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{puzzle.foundWords.length}/{puzzle.words.length}</div>
          <div className="text-sm text-white/70">Kelime</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}s
          </div>
          <div className="text-sm text-white/70">Süre</div>
        </div>
      </div>

      {/* Harf Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Harf Seçin</h3>
        <div className="flex justify-center gap-3 mb-6">
          {puzzle.letters.map((letter, index) => (
            <LetterButton key={index} letter={letter} index={index} />
          ))}
        </div>
      </div>

      {/* Mevcut Kelime */}
      <div className="mb-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Mevcut Kelime</h3>
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="text-2xl font-bold text-white min-h-[2rem]">
            {currentWord || 'Harfleri seçin...'}
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={checkWord}
            disabled={currentWord.length < 3}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
          >
            Kelimeyi Kontrol Et
          </button>
          <button
            onClick={() => {
              setCurrentWord('');
              setSelectedLetters([]);
            }}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Mesaj */}
      {message && (
        <div className="mb-6 p-4 bg-white/10 rounded-lg text-center">
          <p className="text-white">{message}</p>
        </div>
      )}

      {/* Bulunan Kelimeler */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Bulunan Kelimeler</h3>
        <div className="bg-white/5 rounded-lg p-4">
          {puzzle.foundWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {puzzle.foundWords.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/60">Henüz kelime bulunamadı...</p>
          )}
        </div>
      </div>

      {/* Oyun Kontrolleri */}
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

      {/* Oyun Tamamlandı Modal */}
      {gameCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2234] rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Tebrikler!</h2>
            <p className="text-white/70 mb-6">
              Tüm kelimeleri buldunuz!<br />
              Toplam puan: {puzzle.score}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
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
