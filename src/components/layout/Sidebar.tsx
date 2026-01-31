'use client';

/**
 * Sidebar Component
 * =================
 * 
 * Left sidebar showing list of slides (Card Nodes).
 * Supports drag-and-drop reordering of slides.
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store';
import { ICard } from '@/types';
import { Plus, GripVertical, Trash2, FileText } from 'lucide-react';

// ============================================================================
// SORTABLE SLIDE ITEM
// ============================================================================

interface SlideItemProps {
  card: ICard;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SlideItem({ card, index, isActive, onClick, onDelete }: SlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer',
        'transition-all duration-150',
        isActive
          ? 'bg-primary-100 border-2 border-primary-500'
          : 'bg-white border-2 border-transparent hover:border-gray-200',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      {/* Slide thumbnail */}
      <div
        className={cn(
          'flex-shrink-0 w-16 h-12 rounded',
          'flex items-center justify-center',
          'text-xs font-medium',
          isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'
        )}
        style={{
          backgroundColor: card.backgroundColor || undefined,
        }}
      >
        <FileText className="w-5 h-5 opacity-50" />
      </div>

      {/* Slide info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {card.title}
        </p>
        <p className="text-xs text-gray-500">
          Slide {index + 1}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete slide"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export function Sidebar() {
  const document = useDocumentStore((state) => state.document);
  const activeCardId = useDocumentStore((state) => state.activeCardId);
  const setActiveCard = useDocumentStore((state) => state.setActiveCard);
  const addCard = useDocumentStore((state) => state.addCard);
  const deleteNode = useDocumentStore((state) => state.deleteNode);
  const reorderCards = useDocumentStore((state) => state.reorderCards);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderCards(active.id as string, over.id as string);
    }
  };

  if (!document) {
    return (
      <aside className="w-64 bg-surface-secondary border-r border-border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-surface-secondary border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Slides
        </h2>
      </div>

      {/* Slides list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={document.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {document.cards.map((card, index) => (
              <SlideItem
                key={card.id}
                card={card}
                index={index}
                isActive={card.id === activeCardId}
                onClick={() => setActiveCard(card.id)}
                onDelete={() => deleteNode(card.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add slide button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => addCard()}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'px-4 py-2 rounded-lg',
            'bg-primary-500 hover:bg-primary-600 text-white',
            'font-medium text-sm',
            'transition-colors duration-150'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
