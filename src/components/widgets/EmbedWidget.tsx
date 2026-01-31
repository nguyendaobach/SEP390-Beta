'use client';

/**
 * Embed Widget
 * ============
 * 
 * Generic iframe embed for external content.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { ExternalLink } from 'lucide-react';

interface EmbedData {
  src: string;
  title?: string;
}

export function EmbedWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const embedData = data as unknown as EmbedData;

  if (!embedData.src) {
    return (
      <div
        className={cn(
          'p-6 bg-gray-100 rounded-lg text-center',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <ExternalLink className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">No embed URL provided</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-gray-100 border',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={{
        aspectRatio: styles?.aspectRatio || '16/9',
        ...styles,
      }}
      onClick={onSelect}
    >
      <iframe
        src={embedData.src}
        className="absolute inset-0 w-full h-full border-0"
        title={embedData.title || 'Embedded content'}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

export default EmbedWidget;
