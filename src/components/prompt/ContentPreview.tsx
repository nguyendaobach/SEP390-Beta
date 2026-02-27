/**
 * Content Preview Component
 * =========================
 * Center panel showing the generated content outline.
 * Uses useInlineEdit hook + CardEditContext to keep things clean.
 */

'use client';

import React, { useMemo } from 'react';
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
import { usePromptEditorStore } from '@/store';
import { ContentViewMode, ICardOutline } from '@/types';
import {
  CreditCard,
  Plus,
  FileText,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { useInlineEdit } from './hooks/useInlineEdit';
import { CardEditContext, useCardEdit } from './context/CardEditContext';

// ============================================================================
// SORTABLE CARD ITEM (uses context instead of prop drilling)
// ============================================================================

interface CardItemProps {
  card: ICardOutline;
  index: number;
}

const CardItem = React.memo(function CardItem({ card, index }: CardItemProps) {
  const {
    editingFields,
    editingValues,
    toggleEdit,
    changeField,
    saveField,
    handleKeyDown,
    addBullet,
    removeCard,
  } = useCardEdit();

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

  const titleFieldId = `title-${card.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-6 transition-shadow ${
        isDragging ? 'opacity-50 shadow-2xl' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 mt-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>

        {/* Card number */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">
          {index + 1}
        </div>

        {/* Card content */}
        <div className="flex-1">
          {/* Editable title */}
          {editingFields[titleFieldId] ? (
            <input
              type="text"
              autoFocus
              value={editingValues[titleFieldId] || ''}
              onChange={(e) => changeField(titleFieldId, e.target.value)}
              onBlur={() => saveField(card.id, titleFieldId, 'title')}
              onKeyDown={(e) => handleKeyDown(e, card.id, titleFieldId, 'title')}
              className="w-full px-3 py-2 mb-3 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
            />
          ) : (
            <h3
              onClick={() => toggleEdit(titleFieldId, card.title)}
              className="text-lg font-semibold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition-colors"
            >
              {card.title}
            </h3>
          )}

          {/* Bullet points */}
          {card.bullets.length > 0 && (
            <ul className="space-y-2 mb-3">
              {card.bullets.map((bullet, bulletIndex) => {
                const bulletFieldId = `bullet-${card.id}-${bulletIndex}`;
                const isEditing = editingFields[bulletFieldId];

                return (
                  <li key={bulletIndex} className="flex items-start gap-2 text-gray-600">
                    <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingValues[bulletFieldId] || ''}
                          onChange={(e) => changeField(bulletFieldId, e.target.value)}
                          onBlur={() => saveField(card.id, bulletFieldId, 'bullet')}
                          onKeyDown={(e) => handleKeyDown(e, card.id, bulletFieldId, 'bullet')}
                          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <span
                          onClick={() => toggleEdit(bulletFieldId, bullet)}
                          className="text-sm cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors block"
                        >
                          {bullet}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Add bullet button */}
          <button
            onClick={() => addBullet(card.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add bullet point
          </button>
        </div>

        {/* Delete button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => removeCard(card.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Delete card"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// CONTENT PREVIEW COMPONENT
// ============================================================================

export function ContentPreview() {
  const {
    contentViewMode,
    setContentViewMode,
    generatedOutline,
    totalCards,
    addCard,
    updateCard,
    removeCard,
    reorderCards,
  } = usePromptEditorStore();

  /* ── Inline editing (delegated to custom hook) ── */
  const inlineEdit = useInlineEdit(generatedOutline, updateCard);

  /* ── DnD sensors ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = generatedOutline.findIndex((c) => c.id === active.id);
      const newIndex = generatedOutline.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) reorderCards(oldIndex, newIndex);
    }
  };

  /* ── Context value (memoised to avoid unnecessary re-renders) ── */
  const contextValue = useMemo(
    () => ({ ...inlineEdit, removeCard }),
    [inlineEdit, removeCard]
  );

  return (
    <div className="flex-1 h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Content</h2>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setContentViewMode(ContentViewMode.CARD_BY_CARD)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                contentViewMode === ContentViewMode.CARD_BY_CARD
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card-by-card
            </button>
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="px-6 py-6">
        {generatedOutline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Enter your prompt on the right and click Generate to create your presentation outline
            </p>
          </div>
        ) : (
          <CardEditContext.Provider value={contextValue}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={generatedOutline.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {generatedOutline.map((card, index) => (
                    <CardItem key={card.id} card={card} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add card button */}
            <button
              onClick={() =>
                addCard({
                  id: crypto.randomUUID(),
                  title: 'New Card',
                  bullets: [],
                  order: totalCards + 1,
                })
              }
              className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add card
            </button>
          </CardEditContext.Provider>
        )}
      </div>

      {/* Footer */}
      {generatedOutline.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{totalCards} cards total</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
