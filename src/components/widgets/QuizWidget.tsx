'use client';

/**
 * Quiz Widget
 * ===========
 * 
 * Interactive quiz component with multiple choice questions.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizData {
  title?: string;
  questions: QuizQuestion[];
}

export function QuizWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const quizData = data as unknown as QuizData;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);

  const question = quizData.questions?.[currentQuestion];

  const handleAnswer = (index: number) => {
    if (answered[currentQuestion]) return;

    setSelectedAnswer(index);
    const newAnswered = [...answered];
    newAnswered[currentQuestion] = true;
    setAnswered(newAnswered);

    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
  };

  if (!quizData.questions || quizData.questions.length === 0) {
    return (
      <div
        className={cn(
          'p-6 bg-gray-100 rounded-lg text-center',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">No quiz questions available</p>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div
        className={cn(
          'p-6 bg-white rounded-lg border shadow-sm',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <div className="text-center">
          <div
            className={cn(
              'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
              percentage >= 70 ? 'bg-green-100' : percentage >= 40 ? 'bg-yellow-100' : 'bg-red-100'
            )}
          >
            <span
              className={cn(
                'text-2xl font-bold',
                percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
              )}
            >
              {percentage}%
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Complete!</h3>
          <p className="text-gray-600 mb-4">
            You scored {score} out of {quizData.questions.length}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border shadow-sm overflow-hidden',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={styles}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-primary-500 text-white">
        <div className="flex items-center justify-between">
          <span className="font-medium">{quizData.title || 'Quiz'}</span>
          <span className="text-sm opacity-90">
            {currentQuestion + 1} / {quizData.questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-primary-400 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentQuestion + (answered[currentQuestion] ? 1 : 0)) / quizData.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-4">
        <p className="text-lg font-medium text-gray-900 mb-4">{question.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctIndex;
            const isSelected = selectedAnswer === index;
            const hasAnswered = answered[currentQuestion];

            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(index);
                }}
                disabled={hasAnswered}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                  'flex items-center gap-3',
                  !hasAnswered && 'hover:border-primary-300 hover:bg-primary-50',
                  hasAnswered && isCorrect && 'border-green-500 bg-green-50',
                  hasAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-50',
                  !hasAnswered && 'border-gray-200'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0',
                    hasAnswered && isCorrect && 'border-green-500 bg-green-500 text-white',
                    hasAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-500 text-white',
                    !hasAnswered && 'border-gray-300'
                  )}
                >
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                  {!hasAnswered && String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {answered[currentQuestion] && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="mt-4 w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizWidget;
