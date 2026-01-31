'use client';

/**
 * Audio Widget
 * ============
 * 
 * Audio player for podcasts, music, or narration.
 */

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface AudioData {
  src: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const audioData = data as unknown as AudioData;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-4 text-white',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-300 ring-offset-2'
      )}
      style={styles}
      onClick={onSelect}
    >
      <audio ref={audioRef} src={audioData.src} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Cover Art */}
        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {audioData.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={audioData.coverUrl}
              alt={audioData.title || 'Album art'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-8 h-8 opacity-50" />
          )}
        </div>

        {/* Info and Controls */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{audioData.title || 'Untitled Track'}</p>
          {audioData.artist && (
            <p className="text-sm opacity-75 truncate">{audioData.artist}</p>
          )}

          {/* Progress Bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs opacity-75 w-10">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-1 appearance-none bg-white/30 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
              }}
            />
            <span className="text-xs opacity-75 w-10 text-right">
              {formatTime(duration || 0)}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-primary-600 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioWidget;
