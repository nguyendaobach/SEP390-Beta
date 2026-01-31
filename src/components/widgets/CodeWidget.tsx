'use client';

/**
 * Code Widget
 * ===========
 * 
 * Code snippet display with syntax highlighting (basic).
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { Copy, Check, Code } from 'lucide-react';

interface CodeData {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const codeData = data as unknown as CodeData;
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!codeData.code) {
    return (
      <div
        className={cn(
          'p-6 bg-gray-100 rounded-lg text-center',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <Code className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">No code provided</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-gray-900',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={styles}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {/* Mac-style dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {codeData.filename && (
            <span className="ml-3 text-sm text-gray-400">{codeData.filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {codeData.language && (
            <span className="text-xs text-gray-500 uppercase">{codeData.language}</span>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono whitespace-pre">{codeData.code}</code>
      </pre>
    </div>
  );
}

export default CodeWidget;
