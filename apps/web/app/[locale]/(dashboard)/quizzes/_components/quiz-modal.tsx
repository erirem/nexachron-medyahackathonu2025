/* eslint-disable react/no-unescaped-entities */
'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, type JSX } from 'react';
import { useGamification } from '@/contexts/gamification-context';
import { SocialShareModal } from '@/components/social-share-modal';
import type { Quiz, QuizProgress } from '../_types/quiz-types';

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (quiz: Quiz, score: number) => void;
}

export function QuizModal({ quiz, isOpen, onClose, onComplete }: QuizModalProps): JSX.Element {
  const t = useTranslations('quizzes.modal');
  const { useHint, userProfile } = useGamification();
  const [progress, setProgress] = useState<QuizProgress>({
    currentQuestion: 0,
    totalQuestions: quiz.questionCount,
    timeRemaining: quiz.timeLimit,
    answers: new Array(quiz.questionCount).fill(null),
    startTime: new Date()
  });
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Define before any render-time references (e.g., effect deps) to avoid TDZ
  const handleSubmit = useCallback(() => {
    setIsCompleted(true);
    setShowResults(true);
    
    // Calculate score
    const correctAnswers = progress.answers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    
    onComplete(quiz, correctAnswers);
  }, [onComplete, progress.answers, quiz]);

  // Timer effect
  useEffect(() => {
    if (!isOpen || isCompleted || showResults) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, isOpen, isCompleted, showResults]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress({
        currentQuestion: 0,
        totalQuestions: quiz.questionCount,
        timeRemaining: quiz.timeLimit,
        answers: new Array(quiz.questionCount).fill(null),
        startTime: new Date()
      });
      setIsCompleted(false);
      setShowResults(false);
      setSelectedAnswer(null);
      setShowHint(false);
      setHintUsed(false);
    }
  }, [isOpen, quiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleUseHint = () => {
    if (useHint()) {
      setShowHint(true);
      setHintUsed(true);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...progress.answers];
    newAnswers[progress.currentQuestion] = selectedAnswer;

    if (progress.currentQuestion === progress.totalQuestions - 1) {
      // Last question - complete quiz
      setProgress(prev => ({
        ...prev,
        answers: newAnswers
      }));
      handleSubmit();
    } else {
      // Next question
      setProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answers: newAnswers
      }));
      setSelectedAnswer(newAnswers[progress.currentQuestion + 1]);
      setShowHint(false);
      setHintUsed(false);
    }
  };

  const handlePrevious = () => {
    if (progress.currentQuestion > 0) {
      setProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      setSelectedAnswer(progress.answers[progress.currentQuestion - 1]);
      setShowHint(false);
      setHintUsed(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswerCount = () => {
    return progress.answers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
  };

  const isPerfectScore = () => {
    return getCorrectAnswerCount() === quiz.questionCount;
  };

  const currentQuestion = quiz.questions[progress.currentQuestion];

  if (!isOpen) return <></>;

  // Quiz verisi eksikse hata göster
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-[#1a2234] rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('dataMissing.title')}</h2>
            <p className="text-white/70 mb-6">{t('dataMissing.description')}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200"
            >
              {t('actions.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[95vh] bg-[#1a2234] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {!showResults ? (
          /* Quiz Interface */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Progress */}
              <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-white/70">
                  <span>
                    {t('labels.questionProgress', {
                      current: progress.currentQuestion + 1,
                      total: progress.totalQuestions,
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(progress.timeRemaining)}
                  </span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${((progress.currentQuestion + 1) / progress.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {currentQuestion.question}
              </h3>

              {/* Hint Section */}
              {currentQuestion.hint && (
                <div className="mb-4">
                  {!showHint ? (
                    <button
                      onClick={handleUseHint}
                      disabled={hintUsed || !userProfile || userProfile.xp < 5}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {hintUsed ? t('hint.used') : t('hint.button')}
                      </span>
                    </button>
                  ) : (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-blue-300 text-sm font-medium mb-1">{t('hint.label')}</p>
                          <p className="text-blue-200 text-sm">{currentQuestion.hint}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
               )}
               
               <div className="space-y-2">
                 {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                     className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-blue-400 bg-blue-500'
                          : 'border-white/40'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
              <button
                onClick={handlePrevious}
                disabled={progress.currentQuestion === 0}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                {t('actions.previous')}
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200"
              >
                {progress.currentQuestion === progress.totalQuestions - 1
                  ? t('actions.submit')
                  : t('actions.next')}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">{t('results.title')}</h2>
              <p className="text-white/70">{t('results.subtitle')}</p>
            </div>

            {/* Results Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{getCorrectAnswerCount()} / {quiz.questionCount}</div>
                <div className="text-sm text-white/70">{t('results.correctAnswers')}</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">+{Math.floor(quiz.xpReward * (getCorrectAnswerCount() / quiz.questionCount))}</div>
                <div className="text-sm text-white/70">{t('results.xpEarned')}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                {t('actions.close')}
              </button>
              
              {/* Share Button - only show for perfect scores */}
              {isPerfectScore() && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium transition-all duration-200"
                >
                  🎉 Paylaş
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowResults(false);
                  setIsCompleted(false);
                  setProgress({
                    currentQuestion: 0,
                    totalQuestions: quiz.questionCount,
                    timeRemaining: quiz.timeLimit,
                    answers: new Array(quiz.questionCount).fill(null),
                    startTime: new Date()
                  });
                  setSelectedAnswer(null);
                  setShowHint(false);
                  setHintUsed(false);
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
              >
                {t('actions.retry')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameType="quiz"
        score={getCorrectAnswerCount()}
        totalQuestions={quiz.questionCount}
        isPerfectScore={isPerfectScore()}
      />
    </div>
  );
}
