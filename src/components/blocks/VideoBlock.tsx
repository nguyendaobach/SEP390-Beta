'use client';

/**
 * VideoBlock Component
 * ====================
 * 
 * Embeds video content from YouTube, Vimeo, or direct sources.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { IVideoContent } from '@/types';
import { Play } from 'lucide-react';

interface VideoBlockProps {
  id: string;
  content: IVideoContent;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoId(url: string): string | null {
  const regex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function VideoBlock({
  id,
  content,
  isSelected = false,
  onSelect,
}: VideoBlockProps) {
  let embedUrl: string | null = null;

  if (content.provider === 'youtube') {
    const videoId = getYouTubeId(content.src);
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (content.provider === 'vimeo') {
    const videoId = getVimeoId(content.src);
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  } else {
    embedUrl = content.src;
  }

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      onClick={onSelect}
    >
      <div className="relative w-full aspect-video bg-gray-900">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video embed"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Invalid video URL</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoBlock;
