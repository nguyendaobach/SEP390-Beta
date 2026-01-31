'use client';

/**
 * YouTube Embed Widget
 * ====================
 * 
 * Embeds YouTube videos with privacy-enhanced mode.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { Youtube } from 'lucide-react';

interface YouTubeData {
  videoId?: string;
  src?: string;
  title?: string;
  autoplay?: boolean;
  startTime?: number;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubeEmbedWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const ytData = data as unknown as YouTubeData;
  const videoId = ytData.videoId || (ytData.src ? extractYouTubeId(ytData.src) : null);

  if (!videoId) {
    return (
      <div
        className={cn(
          'aspect-video bg-gray-900 rounded-lg flex items-center justify-center',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <div className="text-center text-gray-400">
          <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  if (ytData.autoplay) embedUrl.searchParams.set('autoplay', '1');
  if (ytData.startTime) embedUrl.searchParams.set('start', ytData.startTime.toString());
  embedUrl.searchParams.set('rel', '0');

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-black',
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
        src={embedUrl.toString()}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={ytData.title || 'YouTube Video'}
      />
    </div>
  );
}

export default YouTubeEmbedWidget;
