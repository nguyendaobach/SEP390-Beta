'use client';

/**
 * Toolbar Component
 * =================
 * 
 * Top toolbar with buttons to add content blocks and layouts.
 * Includes Export functionality for .eduvi files.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store';
import { BlockType, LayoutVariant } from '@/types';
import { exportToEduvi } from '@/lib/exportToEduvi';
import {
  Type,
  Heading1,
  Image,
  Video,
  Columns2,
  Columns3,
  PanelLeft,
  Undo2,
  Redo2,
  Save,
  Download,
  // Interactive icons
  HelpCircle,
  Layers,
  PenLine,
} from 'lucide-react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({ icon, label, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'text-sm font-medium',
        'transition-colors duration-150',
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
      )}
      title={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-8 bg-gray-200 mx-1" />;
}

export function Toolbar() {
  const activeCardId = useDocumentStore((state) => state.activeCardId);
  const addBlockToCard = useDocumentStore((state) => state.addBlockToCard);
  const addLayoutToCard = useDocumentStore((state) => state.addLayoutToCard);
  const document = useDocumentStore((state) => state.document);

  const hasActiveCard = !!activeCardId;

  const handleAddBlock = (blockType: BlockType) => {
    if (activeCardId) {
      addBlockToCard(activeCardId, blockType);
    }
  };

  const handleAddLayout = (variant: LayoutVariant) => {
    if (activeCardId) {
      addLayoutToCard(activeCardId, variant);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border px-4 flex items-center justify-between">
      {/* Left section - Document title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {document?.title || 'Untitled'}
        </h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Auto-saved
        </span>
      </div>

      {/* Center section - Add content buttons */}
      <div className="flex items-center gap-2">
        {/* Block buttons */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          <ToolbarButton
            icon={<Heading1 className="w-4 h-4" />}
            label="Heading"
            onClick={() => handleAddBlock(BlockType.HEADING)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<Type className="w-4 h-4" />}
            label="Text"
            onClick={() => handleAddBlock(BlockType.TEXT)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<Image className="w-4 h-4" />}
            label="Image"
            onClick={() => handleAddBlock(BlockType.IMAGE)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<Video className="w-4 h-4" />}
            label="Video"
            onClick={() => handleAddBlock(BlockType.VIDEO)}
            disabled={!hasActiveCard}
          />
        </div>

        <ToolbarDivider />

        {/* Layout buttons */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          <ToolbarButton
            icon={<Columns2 className="w-4 h-4" />}
            label="2 Columns"
            onClick={() => handleAddLayout(LayoutVariant.TWO_COLUMN)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<Columns3 className="w-4 h-4" />}
            label="3 Columns"
            onClick={() => handleAddLayout(LayoutVariant.THREE_COLUMN)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<PanelLeft className="w-4 h-4" />}
            label="Sidebar"
            onClick={() => handleAddLayout(LayoutVariant.SIDEBAR_LEFT)}
            disabled={!hasActiveCard}
          />
        </div>

        <ToolbarDivider />

        {/* Interactive blocks */}
        <div className="flex items-center gap-1 bg-amber-50 rounded-lg p-1 border border-amber-200">
          <ToolbarButton
            icon={<HelpCircle className="w-4 h-4 text-indigo-600" />}
            label="Quiz"
            onClick={() => handleAddBlock(BlockType.QUIZ)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<Layers className="w-4 h-4 text-amber-600" />}
            label="Flashcard"
            onClick={() => handleAddBlock(BlockType.FLASHCARD)}
            disabled={!hasActiveCard}
          />
          <ToolbarButton
            icon={<PenLine className="w-4 h-4 text-emerald-600" />}
            label="Fill Blank"
            onClick={() => handleAddBlock(BlockType.FILL_BLANK)}
            disabled={!hasActiveCard}
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        <ToolbarDivider />
        <button
          onClick={() => {
            if (document) {
              exportToEduvi(document);
            }
          }}
          disabled={!document}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-emerald-500 hover:bg-emerald-600 text-white',
            'font-medium text-sm transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Export as .eduvi file for Flutter Viewer"
        >
          <Download className="w-4 h-4" />
          Export .eduvi
        </button>
        <button
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary-500 hover:bg-primary-600 text-white',
            'font-medium text-sm transition-colors'
          )}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </header>
  );
}

export default Toolbar;
