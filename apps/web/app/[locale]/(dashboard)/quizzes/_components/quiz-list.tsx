'use client';

import { type JSX } from 'react';
import type { Quiz } from '../_types/quiz-types';

interface QuizListProps {
  quizzes: Quiz[];
  onQuizSelect: (quiz: Quiz) => void;
}

const difficultyColors = {
  easy: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-400/30'
  },
  medium: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-400/30'
  },
  hard: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-400/30'
  }
};

const difficultyLabels = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor'
};

export function QuizList({ quizzes, onQuizSelect }: QuizListProps): JSX.Element {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-white/70 mb-2">
          Bu kategoride quiz bulunmuyor
        </h3>
        <p className="text-white/50">
          Farklı bir kategori seçerek quizleri keşfedebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        const difficultyStyle = difficultyColors[quiz.difficulty];
        const timeMinutes = Math.floor(quiz.timeLimit / 60);
        
        return (
          <div
            key={quiz.id}
            onClick={() => onQuizSelect(quiz)}
            className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white blur-lg" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-white/70 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>
                
                {quiz.isCompleted && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Difficulty and Time */}
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border`}>
                    {difficultyLabels[quiz.difficulty]}
                  </div>
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{timeMinutes} dk</span>
                  </div>
                </div>

                {/* Question Count and XP */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{quiz.questionCount} soru</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-400 font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>+{quiz.xpReward} XP</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <div className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium text-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                  {quiz.isCompleted ? 'Tekrar Çöz' : 'Quiz\'i Başlat'}
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        );
      })}
    </div>
  );
}
