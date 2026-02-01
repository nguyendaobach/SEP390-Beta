'use client';

/**
 * QuizBlock Component
 * ===================
 * 
 * Refactored Quiz block using Editor/Player pattern.
 * - QuizEditor: Edit mode for creating/modifying quiz questions
 * - QuizPlayer: Interactive view for answering questions
 * 
 * The main component handles mode switching and provides
 * a Preview/Edit toggle button in Editor mode.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDocumentStore, AppMode } from '@/store';
import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Eye,
  Pencil,
  RotateCcw,
  Trophy,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctIndex: number;
  explanation?: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface QuizBlockProps {
  id: string;
  data: QuizData;
  isSelected?: boolean;
  onUpdate: (data: Partial<QuizData>) => void;
}

// ============================================================================
// QUIZ EDITOR
// ============================================================================

interface QuizEditorProps {
  data: QuizData;
  onUpdate: (data: Partial<QuizData>) => void;
}

function QuizEditor({ data, onUpdate }: QuizEditorProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    data.questions[0]?.id || null
  );

  const questions = useMemo(() => data.questions || [], [data.questions]);
  const title = data.title || 'Quiz';

  const generateId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateOptionId = () => `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleTitleChange = useCallback((newTitle: string) => {
    onUpdate({ title: newTitle });
  }, [onUpdate]);

  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      question: '',
      options: [
        { id: generateOptionId(), text: '' },
        { id: generateOptionId(), text: '' },
      ],
      correctIndex: 0,
    };
    onUpdate({ questions: [...questions, newQuestion] });
    setExpandedQuestionId(newQuestion.id);
  }, [questions, onUpdate]);

  const handleRemoveQuestion = useCallback((questionId: string) => {
    const filtered = questions.filter((q) => q.id !== questionId);
    onUpdate({ questions: filtered });
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(filtered[0]?.id || null);
    }
  }, [questions, expandedQuestionId, onUpdate]);

  const handleQuestionChange = useCallback((questionId: string, text: string) => {
    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, question: text } : q
    );
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const handleOptionChange = useCallback((questionId: string, optionIndex: number, text: string) => {
    const updated = questions.map((q) => {
      if (q.id !== questionId) return q;
      const newOptions = [...q.options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], text };
      return { ...q, options: newOptions };
    });
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const handleCorrectIndexChange = useCallback((questionId: string, index: number) => {
    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, correctIndex: index } : q
    );
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const handleAddOption = useCallback((questionId: string) => {
    const updated = questions.map((q) => {
      if (q.id !== questionId || q.options.length >= 6) return q;
      return {
        ...q,
        options: [...q.options, { id: generateOptionId(), text: '' }],
      };
    });
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const handleRemoveOption = useCallback((questionId: string, optionIndex: number) => {
    const updated = questions.map((q) => {
      if (q.id !== questionId || q.options.length <= 2) return q;
      const newOptions = q.options.filter((_, i) => i !== optionIndex);
      const newCorrectIndex = q.correctIndex >= newOptions.length
        ? newOptions.length - 1
        : q.correctIndex;
      return { ...q, options: newOptions, correctIndex: newCorrectIndex };
    });
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const handleExplanationChange = useCallback((questionId: string, explanation: string) => {
    const updated = questions.map((q) =>
      q.id === questionId ? { ...q, explanation } : q
    );
    onUpdate({ questions: updated });
  }, [questions, onUpdate]);

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Quiz Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter quiz title..."
        />
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, qIndex) => {
          const isExpanded = expandedQuestionId === question.id;
          return (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedQuestionId(isExpanded ? null : question.id)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 cursor-pointer',
                  'hover:bg-gray-50 transition-colors',
                  isExpanded && 'bg-gray-50 border-b border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {qIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                    {question.question || 'New Question'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveQuestion(question.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Question Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Question
                        </label>
                        <textarea
                          value={question.question}
                          onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          rows={2}
                          placeholder="Enter your question..."
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          Options (click to mark correct)
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <button
                                onClick={() => handleCorrectIndexChange(question.id, optIndex)}
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                                  question.correctIndex === optIndex
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                )}
                              >
                                {optionLabels[optIndex]}
                              </button>
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                                className={cn(
                                  'flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                                  question.correctIndex === optIndex
                                    ? 'border-green-300 focus:ring-green-500 bg-green-50'
                                    : 'border-gray-200 focus:ring-indigo-500'
                                )}
                                placeholder={`Option ${optionLabels[optIndex]}...`}
                              />
                              {question.options.length > 2 && (
                                <button
                                  onClick={() => handleRemoveOption(question.id, optIndex)}
                                  className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.options.length < 6 && (
                          <button
                            onClick={() => handleAddOption(question.id)}
                            className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </button>
                        )}
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={question.explanation || ''}
                          onChange={(e) => handleExplanationChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                          rows={2}
                          placeholder="Explain the correct answer..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Question
      </button>
    </div>
  );
}

// ============================================================================
// QUIZ PLAYER
// ============================================================================

interface QuizPlayerProps {
  data: QuizData;
}

function QuizPlayer({ data }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = data.questions || [];
  const title = data.title || 'Quiz';
  const question = questions[currentQuestion];
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (selectedAnswer === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>No questions added yet</p>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Trophy className={cn(
            'w-16 h-16 mx-auto mb-4',
            percentage >= 70 ? 'text-yellow-500' : 'text-gray-400'
          )} />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
        <p className="text-lg text-gray-600 mb-4">
          You scored <span className="font-bold text-indigo-600">{score}</span> out of{' '}
          <span className="font-bold">{questions.length}</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 max-w-xs mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={cn(
              'h-3 rounded-full',
              percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            )}
          />
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-lg font-medium text-gray-800 mb-4">{question.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctIndex;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={option.id}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showResult}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all',
                    !showResult && !isSelected && 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50',
                    !showResult && isSelected && 'border-indigo-500 bg-indigo-50',
                    showCorrect && 'border-green-500 bg-green-50',
                    showWrong && 'border-red-500 bg-red-50'
                  )}
                >
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      !showResult && !isSelected && 'bg-gray-100 text-gray-600',
                      !showResult && isSelected && 'bg-indigo-500 text-white',
                      showCorrect && 'bg-green-500 text-white',
                      showWrong && 'bg-red-500 text-white'
                    )}
                  >
                    {showCorrect ? (
                      <Check className="w-4 h-4" />
                    ) : showWrong ? (
                      <X className="w-4 h-4" />
                    ) : (
                      optionLabels[index]
                    )}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
            >
              <strong>Explanation:</strong> {question.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedAnswer === null
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            )}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN QUIZ BLOCK
// ============================================================================

export function QuizBlock({ id, data, isSelected, onUpdate }: QuizBlockProps) {
  const appMode = useDocumentStore((state) => state.appMode);
  const [localMode, setLocalMode] = useState<'edit' | 'preview'>('edit');

  // In presentation mode, always show player
  const effectiveMode = appMode === 'PRESENT' ? 'preview' : localMode;

  return (
    <div
      className={cn(
        'rounded-xl border-2 overflow-hidden bg-white',
        'transition-all duration-200',
        isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200'
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-white/80" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
              Quiz Block
            </span>
          </div>
          
          {/* Mode Toggle (only in editor) */}
          {appMode === 'EDITOR' && (
            <button
              onClick={() => setLocalMode(localMode === 'edit' ? 'preview' : 'edit')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-white/20 hover:bg-white/30 text-white transition-colors'
              )}
            >
              {localMode === 'edit' ? (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {effectiveMode === 'edit' ? (
          <QuizEditor data={data} onUpdate={onUpdate} />
        ) : (
          <QuizPlayer data={data} />
        )}
      </div>
    </div>
  );
}

export default QuizBlock;
