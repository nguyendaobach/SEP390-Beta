/**
 * Interactive Components - Barrel Export
 * =======================================
 * 
 * Central export for all interactive widget components.
 * Also handles registration with the InteractiveWidgetRegistry.
 */

import React from 'react';

// Registry
export { 
  InteractiveWidgetRegistry, 
  renderInteractiveWidget,
  type InteractiveWidgetProps,
} from './InteractiveWidgetRegistry';

// Legacy Edit Mode Components (kept for backwards compatibility)
export { QuizBlockEdit } from './QuizBlockEdit';
export { FlashcardBlockEdit } from './FlashcardBlockEdit';
export { FillInBlankBlockEdit } from './FillInBlankBlockEdit';

// NEW: Refactored Components with Editor/Player pattern
export { QuizBlock } from './QuizBlock';
export { FlashcardBlock } from './FlashcardBlock';
export { FillInBlankBlock } from './FillInBlankBlock';

// ============================================================================
// REGISTER ALL INTERACTIVE WIDGETS
// ============================================================================

import { InteractiveWidgetRegistry, InteractiveWidgetProps } from './InteractiveWidgetRegistry';
import { QuizBlock } from './QuizBlock';
import { FlashcardBlock } from './FlashcardBlock';
import { FillInBlankBlock } from './FillInBlankBlock';

// Register new refactored blocks (cast through unknown for type safety bypass)
InteractiveWidgetRegistry.register('QUIZ', QuizBlock as unknown as React.ComponentType<InteractiveWidgetProps>);
InteractiveWidgetRegistry.register('FLASHCARD', FlashcardBlock as unknown as React.ComponentType<InteractiveWidgetProps>);
InteractiveWidgetRegistry.register('FILL_BLANK', FillInBlankBlock as unknown as React.ComponentType<InteractiveWidgetProps>);

console.log('[EduVi] Interactive widgets registered:', [
  'QUIZ',
  'FLASHCARD', 
  'FILL_BLANK'
]);
