'use client';

import { useState, type JSX } from 'react';
import { useTranslations } from 'next-intl';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'quiz' | 'newsguessr' | 'wordle' | 'flappy-bird';
  score?: number;
  totalQuestions?: number;
  attempts?: number;
  word?: string;
  highScore?: number;
  isPerfectScore?: boolean;
  isNewRecord?: boolean;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (text: string, url: string) => string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    color: 'from-blue-400 to-blue-600',
    shareUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: 'from-blue-600 to-blue-800',
    shareUrl: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'W',
    color: 'from-green-500 to-green-700',
    shareUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'T',
    color: 'from-blue-500 to-blue-700',
    shareUrl: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    color: 'from-blue-700 to-blue-900',
    shareUrl: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'R',
    color: 'from-orange-500 to-red-600',
    shareUrl: (text, url) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  }
];

export function SocialShareModal({
  isOpen,
  onClose,
  gameType,
  score = 0,
  totalQuestions = 0,
  attempts = 0,
  word = '',
  highScore = 0,
  isPerfectScore = false,
  isNewRecord = false
}: SocialShareModalProps): JSX.Element {
  const t = useTranslations('socialShare');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return <></>;

  const generateShareText = () => {
    switch (gameType) {
      case 'quiz':
        if (isPerfectScore) {
          return t('shareTexts.quizPerfect', { score: totalQuestions, total: totalQuestions });
        }
        return t('shareTexts.quizScore', { score, total: totalQuestions });
      
      case 'newsguessr':
        if (isPerfectScore) {
          return t('shareTexts.newsguessrPerfect');
        }
        return t('shareTexts.newsguessrScore', { score, total: totalQuestions });
      
      case 'wordle':
        return t('shareTexts.wordleSuccess', { word, attempts });
      
      case 'flappy-bird':
        if (isNewRecord) {
          return t('shareTexts.flappyNewRecord', { score: highScore });
        }
        return t('shareTexts.flappyScore', { score: highScore });
      
      default:
        return t('shareTexts.default');
    }
  };

  const shareText = generateShareText();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexachron.com';
  const gameUrl = `${baseUrl}/games`;

  const handleShare = (platform: SocialPlatform) => {
    const shareUrl = platform.shareUrl(shareText, gameUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${gameUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getGameIcon = () => {
    switch (gameType) {
      case 'quiz':
        return '🧠';
      case 'newsguessr':
        return '🗺️';
      case 'wordle':
        return '📝';
      case 'flappy-bird':
        return '🦅';
      default:
        return '🎮';
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'quiz':
        return 'Quiz Başarısı';
      case 'newsguessr':
        return 'NewsGuessr Başarısı';
      case 'wordle':
        return 'Wordle Başarısı';
      case 'flappy-bird':
        return 'Flappy Bird Başarısı';
      default:
        return 'Oyun Başarısı';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1a2234] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getGameIcon()}</div>
              <h2 className="text-xl font-bold text-white">{getGameTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Achievement Message */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">
              {isPerfectScore ? '🎉' : isNewRecord ? '🏆' : '✨'}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isPerfectScore ? t('perfectScore') : isNewRecord ? t('newRecord') : t('congratulations')}
            </h3>
            <p className="text-white/70 text-sm">
              {t('description')}
            </p>
          </div>

          {/* Share Text Preview */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm leading-relaxed">
              "{shareText}"
            </p>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r ${platform.color} hover:opacity-90 transition-all duration-200 text-white font-medium`}
              >
                <span className="text-lg font-bold">{platform.icon}</span>
                <span className="text-sm">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
              copied 
                ? 'border-green-500 bg-green-500/10 text-green-400' 
                : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('copied')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{t('copyText')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
