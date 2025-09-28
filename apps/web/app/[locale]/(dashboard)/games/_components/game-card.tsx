'use client';

import { type JSX } from 'react';
import type { Game } from '../_types/game-types';

interface GameCardProps {
  game: Game;
  onSelect: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    border: 'border-blue-400/30',
    accent: 'text-blue-400',
    hover: 'hover:border-blue-400/50',
    button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
    border: 'border-purple-400/30',
    accent: 'text-purple-400',
    hover: 'hover:border-purple-400/50',
    button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/20 to-green-600/30',
    border: 'border-green-400/30',
    accent: 'text-green-400',
    hover: 'hover:border-green-400/50',
    button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/30',
    border: 'border-cyan-400/30',
    accent: 'text-cyan-400',
    hover: 'hover:border-cyan-400/50',
    button: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30',
    border: 'border-yellow-400/30',
    accent: 'text-yellow-400',
    hover: 'hover:border-yellow-400/50',
    button: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500/20 to-red-600/30',
    border: 'border-red-400/30',
    accent: 'text-red-400',
    hover: 'hover:border-red-400/50',
    button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  }
};

const difficultyLabels = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor'
};

const difficultyColors = {
  easy: 'text-green-400 bg-green-500/20 border-green-400/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30',
  hard: 'text-red-400 bg-red-500/20 border-red-400/30'
};

export function GameCard({ game, onSelect }: GameCardProps): JSX.Element {
  const colors = colorClasses[game.color];
  const isDisabled = !game.isAvailable;

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        isDisabled
          ? 'bg-white/5 border border-white/10 opacity-60 cursor-not-allowed'
          : `${colors.bg} ${colors.border} border hover:shadow-lg hover:shadow-${game.color}-500/10 ${colors.hover} cursor-pointer`
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl ${isDisabled ? 'opacity-50' : colors.accent}`}>
              {game.icon}
            </div>
            <div>
              <h3 className={`text-xl font-bold transition-colors ${
                isDisabled ? 'text-white/50' : 'text-white group-hover:text-white/90'
              }`}>
                {game.title}
              </h3>
              <p className={`text-sm transition-colors ${
                isDisabled ? 'text-white/30' : 'text-white/70'
              }`}>
                {game.description}
              </p>
            </div>
          </div>
          
          {isDisabled && (
            <div className="ml-3 flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {/* Difficulty and Time */}
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[game.difficulty]}`}>
              {difficultyLabels[game.difficulty]}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{game.estimatedTime}</span>
            </div>
          </div>

          {/* XP Reward */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-white/60">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>XP Ödülü</span>
            </div>
            
            <div className={`font-medium ${isDisabled ? 'text-white/50' : colors.accent}`}>
              +{game.xpReward} XP
            </div>
          </div>

          {/* Completion Rate */}
          {game.completionRate > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">İlerleme</span>
                <span className={`${colors.accent} font-medium`}>
                  %{game.completionRate}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${colors.accent.replace('text-', 'from-')} to-white/60 transition-all duration-500`}
                  style={{ width: `${game.completionRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          {isDisabled ? (
            <div className="w-full py-3 px-4 bg-white/5 rounded-lg text-white/50 font-medium text-center">
              Yakında Gelecek
            </div>
          ) : (
            <div className={`w-full py-3 px-4 bg-gradient-to-r ${colors.button} rounded-lg text-white font-medium text-center transition-all duration-200 group-hover:shadow-lg group-hover:shadow-${game.color}-500/25`}>
              {game.isCompleted ? 'Tekrar Oyna' : 'Oyunu Başlat'}
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </div>
  );
}
