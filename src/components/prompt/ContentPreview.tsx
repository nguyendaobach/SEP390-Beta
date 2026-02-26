/**
 * Content Preview Component
 * =========================
 * Center panel showing the generated content outline
 */

'use client';

import React, { useState } from 'react';
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
  MoreVertical,
  AlignLeft,
  CreditCard,
  Plus,
  FileText,
  Trash2,
  GripVertical,
} from 'lucide-react';

// ============================================================================
// SORTABLE CARD ITEM
// ============================================================================

interface CardItemProps {
  card: ICardOutline;
  index: number;
  editingFields: Record<string, boolean>;
  editingValues: Record<string, string>;
  onToggleEdit: (fieldId: string, currentValue: string) => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onSaveField: (cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => void;
  onKeyDown: (e: React.KeyboardEvent, cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => void;
  onAddBullet: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

function CardItem({
  card,
  index,
  editingFields,
  editingValues,
  onToggleEdit,
  onFieldChange,
  onSaveField,
  onKeyDown,
  onAddBullet,
  onDelete,
}: CardItemProps) {
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
              onChange={(e) => onFieldChange(titleFieldId, e.target.value)}
              onBlur={() => onSaveField(card.id, titleFieldId, 'title')}
              onKeyDown={(e) => onKeyDown(e, card.id, titleFieldId, 'title')}
              className="w-full px-3 py-2 mb-3 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
            />
          ) : (
            <h3
              onClick={() => onToggleEdit(titleFieldId, card.title)}
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
                          onChange={(e) => onFieldChange(bulletFieldId, e.target.value)}
                          onBlur={() => onSaveField(card.id, bulletFieldId, 'bullet')}
                          onKeyDown={(e) => onKeyDown(e, card.id, bulletFieldId, 'bullet')}
                          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <span
                          onClick={() => onToggleEdit(bulletFieldId, bullet)}
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
            onClick={() => onAddBullet(card.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add bullet point
          </button>
        </div>

        {/* Delete button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => onDelete(card.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Delete card"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

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

  const toggleEditingField = (fieldId: string, currentValue: string) => {
    setEditingFields((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
    if (!editingFields[fieldId]) {
      setEditingValues((prev) => ({ ...prev, [fieldId]: currentValue }));
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveField = (cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => {
    const card = generatedOutline.find((c) => c.id === cardId);
    if (!card) return;

    const newValue = editingValues[fieldId] || '';
    
    if (fieldType === 'title') {
      updateCard(cardId, { ...card, title: newValue });
    } else if (fieldType === 'bullet') {
      const bulletIndex = parseInt(fieldId.split('-').pop() || '0');
      const newBullets = [...card.bullets];
      
      if (newValue.trim() === '') {
        newBullets.splice(bulletIndex, 1);
      } else {
        newBullets[bulletIndex] = newValue;
      }
      
      updateCard(cardId, { ...card, bullets: newBullets });
    }

    setEditingFields((prev) => ({ ...prev, [fieldId]: false }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    cardId: string,
    fieldId: string,
    fieldType: 'title' | 'bullet'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveField(cardId, fieldId, fieldType);
    } else if (e.key === 'Escape') {
      setEditingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleAddBullet = (cardId: string) => {
    const card = generatedOutline.find((c) => c.id === cardId);
    if (!card) return;

    const newBulletIndex = card.bullets.length;
    updateCard(cardId, { ...card, bullets: [...card.bullets, ''] });
    
    const newFieldId = `bullet-${cardId}-${newBulletIndex}`;
    setTimeout(() => {
      setEditingFields((prev) => ({ ...prev, [newFieldId]: true }));
      setEditingValues((prev) => ({ ...prev, [newFieldId]: '' }));
    }, 0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = generatedOutline.findIndex((card) => card.id === active.id);
      const newIndex = generatedOutline.findIndex((card) => card.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderCards(oldIndex, newIndex);
      }
    }
  };

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
          <>
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
                    <CardItem
                      key={card.id}
                      card={card}
                      index={index}
                      editingFields={editingFields}
                      editingValues={editingValues}
                      onToggleEdit={toggleEditingField}
                      onFieldChange={handleFieldChange}
                      onSaveField={handleSaveField}
                      onKeyDown={handleKeyDown}
                      onAddBullet={handleAddBullet}
                      onDelete={removeCard}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add card button */}
            <button
              onClick={() => addCard({
                id: `card-${Date.now()}`,
                title: 'New Card',
                bullets: [],
                order: totalCards + 1,
              })}
              className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add card
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      {generatedOutline.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{totalCards} cards total</span>
            </div>
            <div className="text-gray-400">
              Type <span className="font-mono bg-gray-100 px-1 rounded">---</span> for card breaks
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
