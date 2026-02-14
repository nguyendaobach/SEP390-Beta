/**
 * Content Preview Component
 * =========================
 * Center panel showing the generated content outline
 */

'use client';

import React from 'react';
import { usePromptEditorStore } from '@/store';
import { ContentViewMode } from '@/types';
import {
  MoreVertical,
  AlignLeft,
  CreditCard,
  Plus,
  FileText,
} from 'lucide-react';

export function ContentPreview() {
  const {
    contentViewMode,
    setContentViewMode,
    generatedOutline,
    totalCards,
    addCard,
  } = usePromptEditorStore();

  const handleAddCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: 'New Card',
      bullets: [],
      order: totalCards + 1,
    };
    addCard(newCard);
  };

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Content</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setContentViewMode(ContentViewMode.FREEFORM)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                contentViewMode === ContentViewMode.FREEFORM
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              Freeform
            </button>
            <button
              onClick={() => setContentViewMode(ContentViewMode.CARD_BY_CARD)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                contentViewMode === ContentViewMode.CARD_BY_CARD
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card-by-card
            </button>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-6 py-6">
        {generatedOutline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Enter your prompt on the right and click Generate to create your presentation outline
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedOutline.map((card, index) => (
              <div
                key={card.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Card Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {card.title}
                    </h3>
                    {card.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {card.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={bulletIndex}
                            className="flex items-start gap-2 text-gray-600"
                          >
                            <span className="text-gray-400 mt-1">•</span>
                            <span className="text-sm">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex-shrink-0">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Card Button */}
            <button
              onClick={handleAddCard}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add card
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {generatedOutline.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{totalCards} cards total</span>
            </div>
            <div className="text-gray-400">
              Type <span className="font-mono bg-gray-100 px-1 rounded">---</span> for card breaks
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
