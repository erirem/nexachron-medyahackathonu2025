'use client';

import { useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { QuizCategoryCard } from './_components/quiz-category-card';
import { QuizList } from './_components/quiz-list';
import { QuizModal } from './_components/quiz-modal';
import type { Quiz, QuizCategory } from './_types/quiz-types';

// Mock quiz data
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Güncel Haberler Quiz\'i',
    description: 'Son 24 saatteki önemli haberler hakkında bilginizi test edin',
    category: 'news',
    difficulty: 'easy',
    questionCount: 2,
    timeLimit: 300, // 5 dakika
    xpReward: 50,
    isCompleted: false,
    questions: [
      {
        id: '1',
        question: 'Türkiye\'nin yeni uzay programı hangi yılda başlatıldı?',
        options: ['2020', '2021', '2022', '2023'],
        correctAnswer: 1,
        explanation: 'Türkiye Uzay Ajansı 2021 yılında kuruldu ve uzay programı başlatıldı.'
      },
      {
        id: '2',
        question: 'Hangi ülke 2024 yılında Dünya Kupası\'nı kazandı?',
        options: ['Brezilya', 'Arjantin', 'Fransa', 'Almanya'],
        correctAnswer: 1,
        explanation: 'Arjantin 2024 Dünya Kupası\'nı kazandı.'
      }
    ]
  },
  {
    id: '2',
    title: 'Genel Kültür Quiz\'i',
    description: 'Tarih, coğrafya ve kültür hakkında sorular',
    category: 'general',
    difficulty: 'medium',
    questionCount: 1,
    timeLimit: 600, // 10 dakika
    xpReward: 100,
    isCompleted: false,
    questions: [
      {
        id: '1',
        question: 'Osmanlı İmparatorluğu hangi yılda kuruldu?',
        options: ['1299', '1300', '1301', '1302'],
        correctAnswer: 0,
        explanation: 'Osmanlı İmparatorluğu 1299 yılında kuruldu.'
      }
    ]
  },
  {
    id: '3',
    title: 'Spor Quiz\'i',
    description: 'Futbol, basketbol ve diğer spor dalları hakkında sorular',
    category: 'sports',
    difficulty: 'hard',
    questionCount: 1,
    timeLimit: 900, // 15 dakika
    xpReward: 150,
    isCompleted: false,
    questions: [
      {
        id: '1',
        question: 'Galatasaray kaç kez UEFA Kupası kazandı?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 0,
        explanation: 'Galatasaray 2000 yılında UEFA Kupası\'nı kazandı.'
      }
    ]
  }
];

const quizCategories: QuizCategory[] = [
  {
    id: 'news',
    name: 'Haber Quizleri',
    description: 'Güncel haberler ve olaylar hakkında quizler',
    icon: '📰',
    color: 'blue',
    quizCount: 12,
    completedCount: 3
  },
  {
    id: 'general',
    name: 'Genel Kültür',
    description: 'Tarih, coğrafya, bilim ve kültür quizleri',
    icon: '🧠',
    color: 'purple',
    quizCount: 25,
    completedCount: 8
  },
  {
    id: 'sports',
    name: 'Spor',
    description: 'Futbol, basketbol ve diğer spor dalları',
    icon: '⚽',
    color: 'green',
    quizCount: 18,
    completedCount: 5
  },
  {
    id: 'technology',
    name: 'Teknoloji',
    description: 'Yapay zeka, programlama ve teknoloji trendleri',
    icon: '💻',
    color: 'cyan',
    quizCount: 15,
    completedCount: 2
  },
  {
    id: 'economy',
    name: 'Ekonomi',
    description: 'Finans, ekonomi ve iş dünyası',
    icon: '💰',
    color: 'yellow',
    quizCount: 10,
    completedCount: 1
  },
  {
    id: 'science',
    name: 'Bilim',
    description: 'Fizik, kimya, biyoloji ve matematik',
    icon: '🔬',
    color: 'red',
    quizCount: 20,
    completedCount: 4
  }
];

export default function QuizzesPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const { userProfile, completeQuiz } = useGamification();
  const router = useRouter();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  const handleQuizComplete = (quiz: Quiz, score: number) => {
    // Gamification sistemine quiz tamamlama bildir
    completeQuiz(quiz.id, score, quiz.questionCount);
  };

  const filteredQuizzes = selectedCategory 
    ? mockQuizzes.filter(quiz => quiz.category === selectedCategory)
    : mockQuizzes;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quizler</h1>
          <p className="text-[#8fb8ff] text-lg">
            Bilginizi test edin ve XP kazanın! {userProfile?.xp || 0} XP'niz var.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Kategoriler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizCategories.map((category) => (
              <QuizCategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Quiz List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {selectedCategory 
                ? `${quizCategories.find(c => c.id === selectedCategory)?.name} Quizleri`
                : 'Tüm Quizler'
              }
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Tümünü Göster
              </button>
            )}
          </div>
          
          <QuizList
            quizzes={filteredQuizzes}
            onQuizSelect={handleQuizSelect}
          />
        </div>

        {/* Quiz Modal */}
        {selectedQuiz && (
          <QuizModal
            quiz={selectedQuiz}
            isOpen={isQuizModalOpen}
            onClose={() => {
              setIsQuizModalOpen(false);
              setSelectedQuiz(null);
            }}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    </div>
  );
}
