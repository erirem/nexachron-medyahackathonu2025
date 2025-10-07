'use client';

import { useTranslations } from 'next-intl';
import { type JSX } from 'react';
import type { QuizCategory } from '../_types/quiz-types';

interface QuizCategoryCardProps {
  category: QuizCategory;
  isSelected: boolean;
  onSelect: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    border: 'border-blue-400/30',
    accent: 'text-blue-400',
    hover: 'hover:border-blue-400/50'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
    border: 'border-purple-400/30',
    accent: 'text-purple-400',
    hover: 'hover:border-purple-400/50'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/20 to-green-600/30',
    border: 'border-green-400/30',
    accent: 'text-green-400',
    hover: 'hover:border-green-400/50'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/30',
    border: 'border-cyan-400/30',
    accent: 'text-cyan-400',
    hover: 'hover:border-cyan-400/50'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30',
    border: 'border-yellow-400/30',
    accent: 'text-yellow-400',
    hover: 'hover:border-yellow-400/50'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500/20 to-red-600/30',
    border: 'border-red-400/30',
    accent: 'text-red-400',
    hover: 'hover:border-red-400/50'
  }
};

export function QuizCategoryCard({ category, isSelected, onSelect }: QuizCategoryCardProps): JSX.Element {
  const t = useTranslations('quizzes.categoryCard');
  const colors = colorClasses[category.color];
  const progressPercentage = (category.completedCount / category.quizCount) * 100;

  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
        isSelected
          ? `${colors.bg} ${colors.border} border-2 shadow-lg shadow-${category.color}-500/20`
          : `${colors.bg} ${colors.border} border hover:shadow-lg hover:shadow-${category.color}-500/10 ${colors.hover}`
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-4xl ${colors.accent}`}>
            {category.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-white/70">
              {category.description}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">{t('labels.quizCount')}</span>
            <span className={`font-semibold ${colors.accent}`}>
              {category.quizCount}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">{t('labels.completed')}</span>
            <span className={`font-semibold ${colors.accent}`}>
              {category.completedCount}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">{t('labels.progress')}</span>
              <span className={`${colors.accent} font-medium`}>
                %{Math.round(progressPercentage)}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${colors.accent.replace('text-', 'from-')} to-white/60 transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
    </button>
  );
}
