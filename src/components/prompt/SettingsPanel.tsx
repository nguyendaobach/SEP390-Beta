/**
 * Settings Panel Component
 * =========================
 * Left panel for configuring prompt generation settings
 */

'use client';

import React from 'react';
import { usePromptEditorStore } from '@/store';
import {
  TextContentMode,
  AmountOfText,
  AudienceType,
  ToneType,
  OutputLanguage,
  ThemeType,
  ImageSourceType,
} from '@/types';
import {
  AlignJustify,
  Image as ImageIcon,
  FileText,
  Coins,
} from 'lucide-react';

export function SettingsPanel() {
  const {
    settings,
    setTextContentMode,
    setAmountOfText,
    setWriteFor,
    setTone,
    setOutputLanguage,
    setTheme,
    setImageSource,
  } = usePromptEditorStore();

  return (
    <div className="w-96 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto p-6">
      {/* Text Content Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlignJustify className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Text content</h3>
        </div>

        {/* Text Content Mode */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text content
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTextContentMode(TextContentMode.GENERATE)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.textContentMode === TextContentMode.GENERATE
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚡ Generate
            </button>
            <button
              onClick={() => setTextContentMode(TextContentMode.CONDENSE)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.textContentMode === TextContentMode.CONDENSE
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ➕ Condense
            </button>
            <button
              onClick={() => setTextContentMode(TextContentMode.PRESERVE)}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.textContentMode === TextContentMode.PRESERVE
                  ? 'bg-blue-50 border-blue-600 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔒 Preserve
            </button>
          </div>
        </div>

        {/* Amount of Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount of text
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(AmountOfText).map((amount) => (
              <button
                key={amount}
                onClick={() => setAmountOfText(amount)}
                className={`px-3 py-8 text-sm rounded-lg border transition-colors ${
                  settings.amountOfText === amount
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {amount === AmountOfText.MINIMAL && '═'}
                    {amount === AmountOfText.CONCISE && '══'}
                    {amount === AmountOfText.DETAILED && '═══'}
                    {amount === AmountOfText.EXTENSIVE && '════'}
                  </div>
                  <div className="capitalize">{amount}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Write For */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write for...
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., Business professionals, Students..."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: 'Business', value: AudienceType.BUSINESS },
              { label: 'High schoolers', value: AudienceType.HIGH_SCHOOLERS },
              { label: 'College students', value: AudienceType.COLLEGE_STUDENTS },
              { label: 'Creatives', value: AudienceType.CREATIVES },
              { label: 'Tech enthusiasts', value: AudienceType.TECH_ENTHUSIASTS },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setWriteFor(value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  settings.writeFor === value
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., Professional, Conversational..."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: 'Professional', value: ToneType.PROFESSIONAL },
              { label: 'Conversational', value: ToneType.CONVERSATIONAL },
              { label: 'Technical', value: ToneType.TECHNICAL },
              { label: 'Academic', value: ToneType.ACADEMIC },
              { label: 'Inspirational', value: ToneType.INSPIRATIONAL },
              { label: 'Humorous', value: ToneType.HUMOROUS },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  settings.tone === value
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Language */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output language
          </label>
          <select
            value={settings.outputLanguage}
            onChange={(e) => setOutputLanguage(e.target.value as OutputLanguage)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={OutputLanguage.VIETNAMESE}>🇻🇳 Tiếng Việt</option>
            <option value={OutputLanguage.ENGLISH}>🇺🇸 English</option>
            <option value={OutputLanguage.SPANISH}>🇪🇸 Español</option>
            <option value={OutputLanguage.FRENCH}>🇫🇷 Français</option>
            <option value={OutputLanguage.GERMAN}>🇩🇪 Deutsch</option>
            <option value={OutputLanguage.CHINESE}>🇨🇳 中文</option>
            <option value={OutputLanguage.JAPANESE}>🇯🇵 日本語</option>
          </select>
        </div>
      </div>

      {/* Visuals Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Visuals</h3>
        </div>

        {/* Theme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Use one of our popular themes below or view more
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Nova', value: ThemeType.NOVA, color: 'bg-blue-100' },
              { name: 'Fluo', value: ThemeType.FLUO, color: 'bg-black' },
              { name: 'Finesse', value: ThemeType.FINESSE, color: 'bg-amber-50' },
              { name: 'Verdigris', value: ThemeType.VERDIGRIS, color: 'bg-teal-800' },
              { name: 'Marine', value: ThemeType.MARINE, color: 'bg-indigo-900' },
              { name: 'Lux', value: ThemeType.LUX, color: 'bg-emerald-900' },
            ].map(({ name, value, color }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  settings.theme === value
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`${color} h-16 flex items-center justify-center`}>
                  <div className="text-xs font-medium text-white mix-blend-difference">
                    Title
                  </div>
                </div>
                <div className="px-2 py-1 text-xs text-center bg-white">{name}</div>
                {settings.theme === value && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Image Source */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image source
          </label>
          <select
            value={settings.imageSource}
            onChange={(e) => setImageSource(e.target.value as ImageSourceType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={ImageSourceType.AUTOMATIC}>⚡ Automatic</option>
            <option value={ImageSourceType.NONE}>None</option>
            <option value={ImageSourceType.UPLOAD}>Upload</option>
          </select>
        </div>
      </div>
    </div>
  );
}
