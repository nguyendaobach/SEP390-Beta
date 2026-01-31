/**
 * EduVi Export Utility
 * ====================
 * 
 * Serializes the document state to .eduvi JSON format.
 * This file is consumed by the Flutter Viewer app.
 * 
 * File Format (.eduvi):
 * - JSON with strict schema
 * - Contains metadata, cards, and all block content
 * - Version-controlled for backwards compatibility
 * 
 * Usage:
 *   import { exportToEduvi } from '@/lib/exportToEduvi';
 *   import { useDocumentStore } from '@/store/useDocumentStore';
 *   
 *   const document = useDocumentStore.getState().document;
 *   exportToEduvi(document);
 */

import { 
  IDocument, 
  ICard, 
  ILayout, 
  IBlock,
  BlockType,
} from '@/types/nodes';

// ============================================================================
// EXPORT SCHEMA VERSION
// ============================================================================

const EDUVI_SCHEMA_VERSION = '1.0.0';
const EDUVI_FILE_EXTENSION = '.eduvi';

// ============================================================================
// TYPES
// ============================================================================

/**
 * The strict schema for .eduvi files
 * This is what Flutter will parse
 */
export interface EduViFileSchema {
  /** Schema version for backwards compatibility */
  version: string;
  
  /** Export timestamp (ISO 8601) */
  exportedAt: string;
  
  /** Document metadata */
  metadata: {
    title: string;
    description: string;
    author?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  };
  
  /** The actual content - array of cards (slides) */
  cards: EduViCard[];
}

export interface EduViCard {
  id: string;
  title: string;
  order: number;
  layouts: EduViLayout[];
}

export interface EduViLayout {
  id: string;
  variant: string; // LayoutVariant as string
  order: number;
  blocks: EduViBlock[];
}

export interface EduViBlock {
  id: string;
  type: string; // BlockType as string
  columnIndex: number;
  order: number;
  content: EduViBlockContent;
}

/**
 * Union type for all possible block content
 * Each type has its own structure
 */
export type EduViBlockContent = 
  | EduViTextContent
  | EduViImageContent
  | EduViVideoContent
  | EduViCodeContent
  | EduViQuizContent
  | EduViFlashcardContent
  | EduViFillBlankContent
  | EduViTableContent
  | EduViChartContent
  | EduViEmbedContent
  | Record<string, unknown>; // Fallback for unknown types

export interface EduViTextContent {
  type: 'TEXT';
  text: string;
  format?: 'plain' | 'html' | 'markdown';
}

export interface EduViImageContent {
  type: 'IMAGE';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface EduViVideoContent {
  type: 'VIDEO';
  src: string;
  poster?: string;
  autoplay?: boolean;
}

export interface EduViCodeContent {
  type: 'CODE';
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export interface EduViQuizContent {
  type: 'QUIZ';
  title: string;
  questions: Array<{
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctIndex: number;
    explanation?: string;
  }>;
}

export interface EduViFlashcardContent {
  type: 'FLASHCARD';
  front: string;
  back: string;
}

export interface EduViFillBlankContent {
  type: 'FILL_BLANK';
  sentence: string;
  blanks: string[];
}

export interface EduViTableContent {
  type: 'TABLE';
  headers: string[];
  rows: string[][];
}

export interface EduViChartContent {
  type: 'CHART';
  chartType: string;
  data: unknown;
  options?: unknown;
}

export interface EduViEmbedContent {
  type: 'EMBED';
  url: string;
  embedType?: string;
}

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

function transformBlock(block: IBlock, order: number, columnIndex: number): EduViBlock {
  const content = block.content || {};
  const contentType = (content as { type?: string }).type || 'UNKNOWN';
  
  // Content already has type field, spread it
  const contentWithType = {
    ...content,
  };

  return {
    id: block.id,
    type: contentType,
    columnIndex,
    order,
    content: contentWithType as EduViBlockContent,
  };
}

/**
 * Get column count for a layout variant
 */
function getColumnCount(variant: string): number {
  switch (variant) {
    case 'two-column':
    case 'sidebar-left':
    case 'sidebar-right':
      return 2;
    case 'three-column':
      return 3;
    default:
      return 1;
  }
}

function transformLayout(layout: ILayout, order: number): EduViLayout {
  const columnCount = getColumnCount(layout.variant);
  
  // Map blocks with their calculated column index
  const blocks = layout.children.map((block, idx) => {
    // Column index is determined by position: index % columnCount
    const columnIndex = idx % columnCount;
    return transformBlock(block as IBlock, idx, columnIndex);
  });

  return {
    id: layout.id,
    variant: layout.variant,
    order,
    blocks,
  };
}

function transformCard(card: ICard, order: number): EduViCard {
  // Filter and transform only layouts (not standalone blocks)
  const layouts = card.children
    .filter((child): child is ILayout => 'variant' in child)
    .map((layout, idx) => transformLayout(layout, idx));

  return {
    id: card.id,
    title: card.title,
    order,
    layouts,
  };
}

function transformDocument(document: IDocument): EduViFileSchema {
  return {
    version: EDUVI_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    metadata: {
      title: document.title,
      description: '', // IDocument doesn't have description yet
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
    cards: document.cards.map((card, idx) => transformCard(card, idx)),
  };
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

/**
 * Export the document to a .eduvi file
 * Triggers a browser download
 */
export function exportToEduvi(document: IDocument): void {
  // Transform to schema
  const eduViData = transformDocument(document);
  
  // Serialize to JSON with pretty printing for debugging
  const jsonString = JSON.stringify(eduViData, null, 2);
  
  // Create blob
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  
  // Generate filename from document title
  const safeTitle = document.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
  
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  link.download = `${safeTitle}-${timestamp}${EDUVI_FILE_EXTENSION}`;
  link.href = url;
  
  // Trigger download
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
  
  console.log('[EduVi] Exported document:', link.download);
}

/**
 * Export to JSON string without triggering download
 * Useful for testing or API submissions
 */
export function serializeToEduvi(document: IDocument): string {
  const eduViData = transformDocument(document);
  return JSON.stringify(eduViData, null, 2);
}

/**
 * Validate that a JSON object conforms to the EduVi schema
 * Returns validation errors if any
 */
export function validateEduViSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] };
  }

  const obj = data as Record<string, unknown>;

  // Check required top-level fields
  if (!obj.version) errors.push('Missing required field: version');
  if (!obj.metadata) errors.push('Missing required field: metadata');
  if (!obj.cards) errors.push('Missing required field: cards');
  if (!Array.isArray(obj.cards)) errors.push('cards must be an array');

  // Check metadata
  if (obj.metadata && typeof obj.metadata === 'object') {
    const meta = obj.metadata as Record<string, unknown>;
    if (!meta.title) errors.push('Missing required field: metadata.title');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default exportToEduvi;
