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
import { Home, HelpCircle } from 'lucide-react';

export default function PromptEditorPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white z-20">
        <div className="flex items-center gap-4">
          {/* Logo/Home */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-sm font-semibold">Home</span>
          </button>
          {/* Title */}
          <h1 className="text-xl ml-72 font-bold text-gray-900">Prompt editor</h1>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Help */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
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
