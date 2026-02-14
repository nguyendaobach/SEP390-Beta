/**
 * Prompt Panel Component
 * ======================
 * Right panel for entering the main prompt and generating content
 */

'use client';

import React from 'react';
import { usePromptEditorStore } from '@/store';
import {
  Zap,
  Info,
  Coins,
  Lightbulb,
  Edit3,
  CreditCard,
  Loader2,
} from 'lucide-react';

export function PromptPanel() {
  const {
    mainPrompt,
    additionalInstructions,
    setMainPrompt,
    setAdditionalInstructions,
    generatedOutline,
    totalCards,
    isGenerating,
    generateContent,
    creditUsed,
    totalCredit,
  } = usePromptEditorStore();

  const handleGenerate = () => {
    if (!mainPrompt.trim()) {
      alert('Vui lòng nhập prompt');
      return;
    }
    generateContent();
  };

  return (
    <div className="w-96 h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Prompt</h3>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Main Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to create?
          </label>
          <textarea
            value={mainPrompt}
            onChange={(e) => setMainPrompt(e.target.value)}
            placeholder="e.g., Đại hội Đại biểu Toàn quốc lần thứ XIV..."
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
          />
        </div>

        {/* Additional Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional instructions
          </label>
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="Optional"
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Card by card info */}
        {generatedOutline.length > 0 && (
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">{totalCards}</span> cards created
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Generate Button */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !mainPrompt.trim()}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
            isGenerating || !mainPrompt.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Generate
            </span>
          )}
        </button>

        {/* Help Text */}
        {generatedOutline.length === 0 && (
          <div className="mt-3 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Need help getting started?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
