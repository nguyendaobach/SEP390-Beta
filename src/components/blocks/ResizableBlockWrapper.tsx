'use client';

/**
 * ResizableBlockWrapper Component
 * ===============================
 * 
 * Wraps block content to provide resize functionality.
 * Uses re-resizable for drag handles on corners and edges.
 * 
 * Maintains Reflow Logic:
 * - Uses CSS Flow (not absolute positioning)
 * - When resized, surrounding content automatically adjusts
 * - Width is percentage-based to maintain responsiveness
 */

import React, { useState, useCallback } from 'react';
import { Resizable, Enable } from 're-resizable';
import { cn } from '@/lib/utils';
import { IBlockStyles } from '@/types';

export interface ResizableBlockWrapperProps {
  id: string;
  children: React.ReactNode;
  styles?: IBlockStyles;
  isResizable?: boolean;
  isSelected?: boolean;
  maintainAspectRatio?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: string;
  onStyleChange?: (styles: Partial<IBlockStyles>) => void;
  onClick?: () => void;
}

// Resize handle enable configuration
const RESIZE_ENABLE: Enable = {
  top: false,
  right: true,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: true,
  bottomLeft: false,
  topLeft: false,
};

// Custom handle styles
const handleStyles = {
  right: {
    width: '8px',
    right: '-4px',
    cursor: 'ew-resize',
  },
  bottom: {
    height: '8px',
    bottom: '-4px',
    cursor: 'ns-resize',
  },
  bottomRight: {
    width: '16px',
    height: '16px',
    right: '-8px',
    bottom: '-8px',
    cursor: 'nwse-resize',
  },
};

export function ResizableBlockWrapper({
  id,
  children,
  styles,
  isResizable = true,
  isSelected = false,
  maintainAspectRatio = false,
  minWidth = 100,
  minHeight = 50,
  maxWidth = '100%',
  onStyleChange,
  onClick,
}: ResizableBlockWrapperProps) {
  const [isResizing, setIsResizing] = useState(false);

  // Parse current dimensions
  const currentWidth = styles?.width || '100%';
  const currentHeight = styles?.height || 'auto';

  // Handle resize start
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  // Handle resize end - update styles via callback
  const handleResizeStop = useCallback(
    (
      e: MouseEvent | TouchEvent,
      direction: string,
      ref: HTMLElement,
      delta: { width: number; height: number }
    ) => {
      setIsResizing(false);

      // Get the parent container width for percentage calculation
      const parentWidth = ref.parentElement?.clientWidth || ref.clientWidth;
      const newWidthPx = ref.clientWidth;
      const newHeightPx = ref.clientHeight;

      // Calculate percentage width (for responsive design)
      const newWidthPercent = Math.round((newWidthPx / parentWidth) * 100);

      // Update styles via callback
      const newStyles: IBlockStyles = {
        ...styles,
        width: `${Math.min(newWidthPercent, 100)}%`,
        height: `${newHeightPx}px`,
      };

      // If maintaining aspect ratio, store it
      if (maintainAspectRatio && newWidthPx && newHeightPx) {
        newStyles.aspectRatio = `${newWidthPx}/${newHeightPx}`;
      }

      onStyleChange?.(newStyles);
    },
    [styles, maintainAspectRatio, onStyleChange]
  );

  // If not resizable, just render children
  if (!isResizable) {
    return (
      <div style={{ width: currentWidth, height: currentHeight, maxWidth }}>
        {children}
      </div>
    );
  }

  return (
    <Resizable
      size={{
        width: currentWidth,
        height: currentHeight,
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      enable={isSelected ? RESIZE_ENABLE : false}
      handleStyles={handleStyles}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      lockAspectRatio={maintainAspectRatio}
      className={cn(
        'relative',
        // Transition when not actively resizing
        !isResizing && 'transition-all duration-200',
        // Show resize indicator when selected
        isSelected && 'resize-selected'
      )}
      handleComponent={{
        bottomRight: isSelected ? <ResizeHandle /> : undefined,
        right: isSelected ? <ResizeHandleEdge direction="horizontal" /> : undefined,
        bottom: isSelected ? <ResizeHandleEdge direction="vertical" /> : undefined,
      }}
    >
      {/* Content wrapper - maintains flow */}
      <div className="w-full h-full" onClick={onClick}>{children}</div>

      {/* Resize indicators (only when selected) */}
      {isSelected && (
        <>
          {/* Size display during resize */}
          {isResizing && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
              {currentWidth} × {currentHeight}
            </div>
          )}
        </>
      )}
    </Resizable>
  );
}

// ============================================================================
// RESIZE HANDLE COMPONENTS
// ============================================================================

/**
 * Corner resize handle
 */
function ResizeHandle() {
  return (
    <div
      className={cn(
        'absolute w-4 h-4 rounded-sm',
        'bg-primary-500 border-2 border-white shadow-md',
        'cursor-nwse-resize',
        'hover:bg-primary-600 hover:scale-110',
        'transition-transform duration-100'
      )}
      style={{
        right: '-8px',
        bottom: '-8px',
      }}
    />
  );
}

/**
 * Edge resize handle (shows as a line)
 */
function ResizeHandleEdge({ direction }: { direction: 'horizontal' | 'vertical' }) {
  if (direction === 'horizontal') {
    return (
      <div
        className={cn(
          'absolute w-1 h-12 rounded-full',
          'bg-primary-500 opacity-0 hover:opacity-100',
          'transition-opacity duration-150',
          'cursor-ew-resize'
        )}
        style={{
          right: '-2px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'absolute h-1 w-12 rounded-full',
        'bg-primary-500 opacity-0 hover:opacity-100',
        'transition-opacity duration-150',
        'cursor-ns-resize'
      )}
      style={{
        bottom: '-2px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    />
  );
}

export default ResizableBlockWrapper;
