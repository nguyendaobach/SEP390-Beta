'use client';

/**
 * Material Video Widget
 * =====================
 * 
 * Video player for user-uploaded videos (not YouTube/Vimeo).
 */

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoData {
  src: string;
  title?: string;
  poster?: string;
}

export function MaterialVideoWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const videoData = data as unknown as VideoData;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-black',
        'transition-all duration-200 group',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={{
        aspectRatio: styles?.aspectRatio || '16/9',
        ...styles,
      }}
      onClick={onSelect}
    >
      <video
        ref={videoRef}
        src={videoData.src}
        poster={videoData.poster}
        className="w-full h-full object-contain"
        onEnded={() => setIsPlaying(false)}
      />

      {/* Video Controls Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'flex flex-col justify-end'
        )}
      >
        {/* Title */}
        {videoData.title && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <p className="text-white text-sm font-medium truncate">{videoData.title}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-900 ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}

export default MaterialVideoWidget;
