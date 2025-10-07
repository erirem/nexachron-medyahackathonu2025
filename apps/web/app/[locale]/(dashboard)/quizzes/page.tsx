/* eslint-disable react/no-unescaped-entities */
'use client';

import { useMemo, useState, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useGamification } from '@/contexts/gamification-context';

import { QuizCategoryCard } from './_components/quiz-category-card';
import { QuizList } from './_components/quiz-list';
import { QuizModal } from './_components/quiz-modal';
import type { Quiz, QuizCategory } from './_types/quiz-types';

// Mock quiz data (content placeholders)
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: "Güncel Haberler Quiz'i",
    description: 'Son 24 saatteki önemli haberler hakkında bilginizi test edin',
    category: 'news',
    difficulty: 'easy',
    questionCount: 2,
    timeLimit: 300,
    xpReward: 50,
    isCompleted: false,
    questions: [
      {
        id: '1',
        question: "Türkiye'nin yeni uzay programı hangi yılda başlatıldı?",
        options: ['2020', '2021', '2022', '2023'],
        correctAnswer: 1,
        explanation: 'Türkiye Uzay Ajansı 2021 yılında kuruldu ve uzay programı başlatıldı.'
      },
      {
        id: '2',
        question: "Hangi ülke 2024 yılında Dünya Kupası'nı kazandı?",
        options: ['Brezilya', 'Arjantin', 'Fransa', 'Almanya'],
        correctAnswer: 1,
        explanation: "Arjantin 2024 Dünya Kupası'nı kazandı."
      }
    ]
  },
  {
    id: '2',
    title: "Genel Kültür Quiz'i",
    description: 'Tarih, coğrafya ve kültür hakkında sorular',
    category: 'general',
    difficulty: 'medium',
    questionCount: 1,
    timeLimit: 600,
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
    title: "Spor Quiz'i",
    description: 'Futbol, basketbol ve diğer spor dalları hakkında sorular',
    category: 'sports',
    difficulty: 'hard',
    questionCount: 1,
    timeLimit: 900,
    xpReward: 150,
    isCompleted: false,
    questions: [
      {
        id: '1',
        question: 'Galatasaray kaç kez UEFA Kupası kazandı?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 0,
        explanation: "Galatasaray 2000 yılında UEFA Kupası'nı kazandı."
      }
    ]
  }
];

const baseCategories: readonly Omit<QuizCategory, 'name' | 'description'>[] = [
  {
    id: 'news',
    icon: '📰',
    color: 'blue',
    quizCount: 12,
    completedCount: 3
  },
  {
    id: 'general',
    icon: '🧠',
    color: 'purple',
    quizCount: 25,
    completedCount: 8
  },
  {
    id: 'sports',
    icon: '⚽',
    color: 'green',
    quizCount: 18,
    completedCount: 5
  },
  {
    id: 'technology',
    icon: '💻',
    color: 'cyan',
    quizCount: 15,
    completedCount: 2
  },
  {
    id: 'economy',
    icon: '💰',
    color: 'yellow',
    quizCount: 10,
    completedCount: 1
  },
  {
    id: 'science',
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
  const locale = useLocale();
  const t = useTranslations('quizzes');

  const categories = useMemo(
    () =>
      baseCategories.map((category) => ({
        ...category,
        name: t(`categories.${category.id}.name`),
        description: t(`categories.${category.id}.description`),
      })),
    [t],
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  const handleQuizComplete = (quiz: Quiz, score: number) => {
    completeQuiz(quiz.id, score, quiz.questionCount);
  };

  const filteredQuizzes = selectedCategory
    ? mockQuizzes.filter((quiz) => quiz.category === selectedCategory)
    : mockQuizzes;

  const activeCategory = selectedCategory
    ? categories.find((category) => category.id === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('page.back')}
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('page.title')}</h1>
          <p className="text-[#8fb8ff] text-lg">
            {t('page.description', { xp: (userProfile?.xp ?? 0).toLocaleString(locale) })}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">{t('page.categoriesHeading')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <QuizCategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {activeCategory
                ? t('page.categoryTitle', { category: activeCategory.name })
                : t('page.allTitle')}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {t('page.showAll')}
              </button>
            )}
          </div>
          
          <QuizList
            quizzes={filteredQuizzes}
            onQuizSelect={handleQuizSelect}
          />
        </div>

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
