/**
 * useInlineEdit Hook
 * ==================
 * Custom hook for managing inline editing of card titles and bullet points.
 * Extracted from ContentPreview to keep the component clean.
 */

import { useState, useCallback } from 'react';
import { ICardOutline } from '@/types';

export function useInlineEdit(
  generatedOutline: ICardOutline[],
  updateCard: (id: string, card: Partial<ICardOutline>) => void
) {
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  const toggleEdit = useCallback(
    (fieldId: string, currentValue: string) => {
      setEditingFields((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
      setEditingValues((prev) => ({ ...prev, [fieldId]: currentValue }));
    },
    []
  );

  const changeField = useCallback((fieldId: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const saveField = useCallback(
    (cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => {
      const card = generatedOutline.find((c) => c.id === cardId);
      if (!card) return;

      const newValue = editingValues[fieldId] || '';

      if (fieldType === 'title') {
        updateCard(cardId, { ...card, title: newValue });
      } else {
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
    },
    [generatedOutline, editingValues, updateCard]
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      cardId: string,
      fieldId: string,
      fieldType: 'title' | 'bullet'
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveField(cardId, fieldId, fieldType);
      } else if (e.key === 'Escape') {
        setEditingFields((prev) => ({ ...prev, [fieldId]: false }));
      }
    },
    [saveField]
  );

  const addBullet = useCallback(
    (cardId: string) => {
      const card = generatedOutline.find((c) => c.id === cardId);
      if (!card) return;

      const newBulletIndex = card.bullets.length;
      updateCard(cardId, { ...card, bullets: [...card.bullets, ''] });

      const newFieldId = `bullet-${cardId}-${newBulletIndex}`;
      setTimeout(() => {
        setEditingFields((prev) => ({ ...prev, [newFieldId]: true }));
        setEditingValues((prev) => ({ ...prev, [newFieldId]: '' }));
      }, 0);
    },
    [generatedOutline, updateCard]
  );

  return {
    editingFields,
    editingValues,
    toggleEdit,
    changeField,
    saveField,
    handleKeyDown,
    addBullet,
  };
}
