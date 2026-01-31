'use client';

/**
 * HeadingBlock Component
 * ======================
 * 
 * Displays a heading with configurable level (H1-H6).
 * Editable inline with automatic font sizing.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store';
import { BlockType, IHeadingContent } from '@/types';

interface HeadingBlockProps {
  id: string;
  content: IHeadingContent;
  isSelected?: boolean;
  onSelect?: () => void;
}

const headingStyles: Record<number, string> = {
  1: 'text-4xl font-bold',
  2: 'text-3xl font-bold',
  3: 'text-2xl font-semibold',
  4: 'text-xl font-semibold',
  5: 'text-lg font-medium',
  6: 'text-base font-medium',
};

export function HeadingBlock({
  id,
  content,
  isSelected = false,
  onSelect,
}: HeadingBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateBlockContent = useDocumentStore((state) => state.updateBlockContent);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setText(content.text);
  }, [content.text]);

  const handleSave = () => {
    setIsEditing(false);
    if (text !== content.text) {
      updateBlockContent(id, {
        type: BlockType.HEADING,
        text,
        level: content.level,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(content.text);
      setIsEditing(false);
    }
  };

  const Tag = `h${content.level}` as keyof JSX.IntrinsicElements;

  return (
    <div
      className={cn(
        'relative group px-3 py-2 rounded-lg',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2',
        'hover:bg-gray-50/50'
      )}
      onClick={() => {
        onSelect?.();
        if (!isEditing) setIsEditing(true);
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full bg-transparent border-none outline-none',
            headingStyles[content.level],
            'text-gray-900'
          )}
          placeholder="Enter heading..."
        />
      ) : (
        <Tag className={cn(headingStyles[content.level], 'text-gray-900 cursor-text')}>
          {content.text || 'Click to edit...'}
        </Tag>
      )}
    </div>
  );
}

export default HeadingBlock;
