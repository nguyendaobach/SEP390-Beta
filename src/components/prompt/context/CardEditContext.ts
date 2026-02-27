/**
 * CardEditContext
 * ===============
 * Context to avoid prop drilling for card inline editing.
 * Provides editing state and actions to all child CardItem components.
 */

import { createContext, useContext } from 'react';

export interface CardEditContextType {
  editingFields: Record<string, boolean>;
  editingValues: Record<string, string>;
  toggleEdit: (fieldId: string, currentValue: string) => void;
  changeField: (fieldId: string, value: string) => void;
  saveField: (cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => void;
  handleKeyDown: (e: React.KeyboardEvent, cardId: string, fieldId: string, fieldType: 'title' | 'bullet') => void;
  addBullet: (cardId: string) => void;
  removeCard: (cardId: string) => void;
}

export const CardEditContext = createContext<CardEditContextType | null>(null);

export function useCardEdit() {
  const ctx = useContext(CardEditContext);
  if (!ctx) {
    throw new Error('useCardEdit must be used within a CardEditContext.Provider');
  }
  return ctx;
}
