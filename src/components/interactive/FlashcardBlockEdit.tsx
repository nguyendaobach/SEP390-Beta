'use client';

/**
 * FlashcardBlockEdit Component
 * ============================
 * 
 * Edit mode component for creating/editing flashcards.
 * Front/Back flip card for memorization exercises.
 * 
 * Features:
 * - Edit front side text
 * - Edit back side text
 * - Visual flip preview toggle
 * - Rich text support (optional)
 * 
 * Data Structure exported to .eduvi:
 * {
 *   type: 'FLASHCARD',
 *   front: string,
 *   back: string
 * }
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { InteractiveWidgetProps } from './InteractiveWidgetRegistry';
import { 
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FlashcardData {
  front: string;
  back: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FlashcardBlockEdit({ id, data, isSelected, onUpdate }: InteractiveWidgetProps) {
  const flashcardData = data as unknown as FlashcardData;
  const [isFlipped, setIsFlipped] = useState(false);

  const front = flashcardData?.front || '';
  const back = flashcardData?.back || '';

  const handleFrontChange = useCallback((value: string) => {
    onUpdate({ front: value, back });
  }, [back, onUpdate]);

  const handleBackChange = useCallback((value: string) => {
    onUpdate({ front, back: value });
  }, [front, onUpdate]);

  const toggleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div
      className={cn(
        'rounded-xl border-2 overflow-hidden bg-white',
        'transition-all duration-200',
        isSelected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200'
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-white/80" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
              Flashcard Block
            </span>
          </div>
          <button
            onClick={toggleFlip}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg',
              'bg-white/20 hover:bg-white/30 text-white text-sm font-medium',
              'transition-colors duration-150'
            )}
          >
            <RotateCcw className="w-4 h-4" />
            {isFlipped ? 'Show Front' : 'Show Back'}
          </button>
        </div>
      </div>

      {/* Card Preview with Flip */}
      <div className="p-4">
        <div className="relative" style={{ perspective: '1000px' }}>
          <div
            className={cn(
              'relative w-full transition-transform duration-500',
              'transform-gpu',
              isFlipped && '[transform:rotateY(180deg)]'
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Side */}
            <div
              className={cn(
                'w-full rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-1',
                isFlipped && 'invisible'
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center mb-2">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  FRONT
                </span>
              </div>
              <textarea
                value={front}
                onChange={(e) => handleFrontChange(e.target.value)}
                placeholder="Enter the question or term..."
                className={cn(
                  'w-full min-h-[120px] px-4 py-3 text-center text-lg',
                  'border-none bg-transparent resize-none',
                  'focus:outline-none focus:ring-0',
                  'placeholder:text-gray-400'
                )}
              />
            </div>

            {/* Back Side */}
            <div
              className={cn(
                'absolute inset-0 w-full rounded-xl border-2 border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50 p-1',
                '[transform:rotateY(180deg)]',
                !isFlipped && 'invisible'
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center mb-2">
                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  BACK
                </span>
              </div>
              <textarea
                value={back}
                onChange={(e) => handleBackChange(e.target.value)}
                placeholder="Enter the answer or definition..."
                className={cn(
                  'w-full min-h-[120px] px-4 py-3 text-center text-lg',
                  'border-none bg-transparent resize-none',
                  'focus:outline-none focus:ring-0',
                  'placeholder:text-gray-400'
                )}
              />
            </div>
          </div>
        </div>

        {/* Edit Both Sides Panel */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Quick Edit
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Front Edit */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Front Side
              </label>
              <textarea
                value={front}
                onChange={(e) => handleFrontChange(e.target.value)}
                placeholder="Question or term..."
                className={cn(
                  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
                  'resize-none'
                )}
                rows={3}
              />
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ArrowRight className="w-5 h-5 text-gray-300" />
            </div>

            {/* Back Edit */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Back Side
              </label>
              <textarea
                value={back}
                onChange={(e) => handleBackChange(e.target.value)}
                placeholder="Answer or definition..."
                className={cn(
                  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                  'resize-none'
                )}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashcardBlockEdit;
