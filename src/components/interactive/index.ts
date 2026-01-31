/**
 * Interactive Components - Barrel Export
 * =======================================
 * 
 * Central export for all interactive widget components.
 * Also handles registration with the InteractiveWidgetRegistry.
 */

// Registry
export { 
  InteractiveWidgetRegistry, 
  renderInteractiveWidget,
  type InteractiveWidgetProps,
} from './InteractiveWidgetRegistry';

// Edit Mode Components
export { QuizBlockEdit } from './QuizBlockEdit';
export { FlashcardBlockEdit } from './FlashcardBlockEdit';
export { FillInBlankBlockEdit } from './FillInBlankBlockEdit';

// ============================================================================
// REGISTER ALL INTERACTIVE WIDGETS
// ============================================================================

import { InteractiveWidgetRegistry } from './InteractiveWidgetRegistry';
import { QuizBlockEdit } from './QuizBlockEdit';
import { FlashcardBlockEdit } from './FlashcardBlockEdit';
import { FillInBlankBlockEdit } from './FillInBlankBlockEdit';

// Register Quiz Block
InteractiveWidgetRegistry.register('QUIZ', QuizBlockEdit);

// Register Flashcard Block
InteractiveWidgetRegistry.register('FLASHCARD', FlashcardBlockEdit);

// Register Fill-in-Blank Block
InteractiveWidgetRegistry.register('FILL_BLANK', FillInBlankBlockEdit);

console.log('[EduVi] Interactive widgets registered:', [
  'QUIZ',
  'FLASHCARD', 
  'FILL_BLANK'
]);
