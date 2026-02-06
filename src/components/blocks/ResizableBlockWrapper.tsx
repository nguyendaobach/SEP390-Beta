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
  left: true,
  topRight: true,
  bottomRight: true,
  bottomLeft: true,
  topLeft: true,
};

// Custom handle styles - invisible hit areas that cover the border
const handleStyles = {
  top: {
    height: '4px',
    top: '0px',
    cursor: 'ns-resize',
  },
  right: {
    width: '4px',
    right: '0px',
    cursor: 'ew-resize',
  },
  bottom: {
    height: '4px',
    bottom: '0px',
    cursor: 'ns-resize',
  },
  left: {
    width: '4px',
    left: '0px',
    cursor: 'ew-resize',
  },
  topRight: {
    width: '12px',
    height: '12px',
    right: '0px',
    top: '0px',
    cursor: 'nesw-resize',
  },
  bottomRight: {
    width: '12px',
    height: '12px',
    right: '0px',
    bottom: '0px',
    cursor: 'nwse-resize',
  },
  bottomLeft: {
    width: '12px',
    height: '12px',
    left: '0px',
    bottom: '0px',
    cursor: 'nesw-resize',
  },
  topLeft: {
    width: '12px',
    height: '12px',
    left: '0px',
    top: '0px',
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
        topLeft: isSelected ? <ResizeHandle position="top-left" /> : undefined,
        topRight: isSelected ? <ResizeHandle position="top-right" /> : undefined,
        bottomLeft: isSelected ? <ResizeHandle position="bottom-left" /> : undefined,
        bottomRight: isSelected ? <ResizeHandle position="bottom-right" /> : undefined,
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
 * Corner resize handle - visible dots at corners
 */
function ResizeHandle({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const positionStyles = {
    'top-left': { top: '-4px', left: '-4px' },
    'top-right': { top: '-4px', right: '-4px' },
    'bottom-left': { bottom: '-4px', left: '-4px' },
    'bottom-right': { bottom: '-4px', right: '-4px' },
  };

  return (
    <div
      className={cn(
        'absolute w-3 h-3 rounded-full',
        'bg-primary-500 border border-white shadow-sm',
        'opacity-0 group-hover:opacity-100',
        'hover:bg-primary-600 hover:scale-125',
        'transition-all duration-150',
        'pointer-events-none'
      )}
      style={positionStyles[position]}
    />
  );
}

export default ResizableBlockWrapper;
