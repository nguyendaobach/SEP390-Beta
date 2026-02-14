/**
 * Prompt Editor Page
 * ==================
 * Main page for creating presentations using AI prompts (similar to Gamma)
 * 
 * Workflow:
 * 1. User configures settings (left panel)
 * 2. User enters prompt (right panel)
 * 3. AI generates content outline (center panel)
 * 4. User can edit/rearrange cards
 * 5. Click "Create Presentation" to convert to slides
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsPanel } from '@/components/prompt/SettingsPanel';
import { ContentPreview } from '@/components/prompt/ContentPreview';
import { PromptPanel } from '@/components/prompt/PromptPanel';
import { usePromptEditorStore } from '@/store';
import { Home, HelpCircle } from 'lucide-react';

export default function PromptEditorPage() {
  const router = useRouter();
  const { generatedOutline } = usePromptEditorStore();

  const handleCreatePresentation = () => {
    if (generatedOutline.length === 0) {
      alert('Vui lòng generate content trước');
      return;
    }

    // TODO: Convert outline to document structure and navigate to editor
    // For now, just navigate to the main editor
    router.push('/editor');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white z-20">
        <div className="flex items-center gap-4">
          {/* Logo/Home */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-sm font-semibold">Home</span>
          </button>

          <div className="h-6 w-px bg-gray-300" />

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900">Prompt editor</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* Create Presentation Button */}
          {generatedOutline.length > 0 && (
            <button
              onClick={handleCreatePresentation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Create Presentation
            </button>
          )}
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Settings */}
        <SettingsPanel />

        {/* Center Panel - Content Preview */}
        <ContentPreview />

        {/* Right Panel - Prompt Input */}
        <PromptPanel />
      </div>
    </div>
  );
}
