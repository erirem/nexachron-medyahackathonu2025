'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import type { Quiz, QuizProgress, QuizResult } from '../_types/quiz-types';

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (quiz: Quiz, score: number) => void;
}

export function QuizModal({ quiz, isOpen, onClose, onComplete }: QuizModalProps): JSX.Element {
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
  }, [isOpen, isCompleted, showResults]);

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
    }
  }, [isOpen, quiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
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
      setSelectedAnswer(prev => newAnswers[progress.currentQuestion + 1]);
    }
  };

  const handlePrevious = () => {
    if (progress.currentQuestion > 0) {
      setProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      setSelectedAnswer(prev => progress.answers[progress.currentQuestion - 1]);
    }
  };

  const handleSubmit = () => {
    setIsCompleted(true);
    setShowResults(true);
    
    // Calculate score
    const correctAnswers = progress.answers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index]?.correctAnswer ? 1 : 0);
    }, 0);
    
    onComplete(quiz, correctAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[progress.currentQuestion];

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1a2234] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {!showResults ? (
          /* Quiz Interface */
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
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
                  <span>Soru {progress.currentQuestion + 1} / {progress.totalQuestions}</span>
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
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
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
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={progress.currentQuestion === 0}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Önceki
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200"
              >
                {progress.currentQuestion === progress.totalQuestions - 1 ? 'Tamamla' : 'Sonraki'}
              </button>
            </div>
          </>
        ) : (
          /* Results */
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Tamamlandı!</h2>
              <p className="text-white/70">Tebrikler, quiz'i başarıyla tamamladınız.</p>
            </div>

            {/* Results Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {progress.answers.reduce((count, answer, index) => 
                    count + (answer === quiz.questions[index]?.correctAnswer ? 1 : 0), 0
                  )} / {quiz.questionCount}
                </div>
                <div className="text-sm text-white/70">Doğru Cevap</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  +{Math.floor(quiz.xpReward * (progress.answers.reduce((count, answer, index) => 
                    count + (answer === quiz.questions[index]?.correctAnswer ? 1 : 0), 0
                  ) / quiz.questionCount))}
                </div>
                <div className="text-sm text-white/70">XP Kazandınız</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                Kapat
              </button>
              
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
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
              >
                Tekrar Çöz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
