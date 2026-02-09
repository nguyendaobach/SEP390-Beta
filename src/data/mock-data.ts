/**
 * EduVi Mock Data
 * ===============
 * 
 * This file contains mock data that demonstrates the exact JSON structure
 * the Backend team should return from their API endpoints.
 * 
 * BACKEND CONTRACT:
 * -----------------
 * GET /api/project → Returns IDocument
 * POST /api/project → Creates new document, returns IDocument
 * PUT /api/project/:id → Updates document, returns IDocument
 * 
 * JSON Structure Example:
 * -----------------------
 * {
 *   "id": "uuid",
 *   "title": "Presentation Title",
 *   "cards": [
 *     {
 *       "id": "uuid",
 *       "type": "CARD",
 *       "title": "Slide 1",
 *       "children": [
 *         {
 *           "id": "uuid",
 *           "type": "BLOCK",
 *           "content": { "type": "TEXT", "html": "<p>Content</p>" },
 *           "children": []
 *         }
 *       ]
 *     }
 *   ],
 *   "activeCardId": "uuid",
 *   "createdAt": "ISO-8601",
 *   "updatedAt": "ISO-8601"
 * }
 */

import {
  IDocument,
  ICard,
  ILayout,
  IBlock,
  NodeType,
  BlockType,
  LayoutVariant,
} from '@/types';

// ============================================================================
// HELPER FUNCTIONS FOR CREATING NODES
// ============================================================================

/**
 * Creates a text block node
 */
export function createTextBlock(id: string, html: string): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.TEXT,
      html,
    },
    children: [],
  };
}

/**
 * Creates a heading block node
 */
export function createHeadingBlock(
  id: string,
  html: string,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1
): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.HEADING,
      html,
      level,
    },
    children: [],
  };
}

/**
 * Creates an image block node
 */
export function createImageBlock(
  id: string,
  src: string,
  alt: string,
  caption?: string
): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.IMAGE,
      src,
      alt,
      caption,
    },
    children: [],
  };
}

/**
 * Creates a video block node
 */
export function createVideoBlock(
  id: string,
  src: string,
  provider: 'youtube' | 'vimeo' | 'direct' = 'youtube'
): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.VIDEO,
      src,
      provider,
    },
    children: [],
  };
}

/**
 * Creates a layout node
 */
export function createLayout(
  id: string,
  variant: LayoutVariant,
  children: IBlock[] = [],
  gap: number = 4
): ILayout {
  return {
    id,
    type: NodeType.LAYOUT,
    variant,
    gap,
    children,
  };
}

/**
 * Creates a card (slide) node
 */
export function createCard(
  id: string,
  title: string,
  children: (ILayout | IBlock)[] = [],
  options?: { backgroundColor?: string; backgroundImage?: string }
): ICard {
  return {
    id,
    type: NodeType.CARD,
    title,
    children,
    ...options,
  };
}

// ============================================================================
// INTERACTIVE BLOCK HELPERS
// ============================================================================

/**
 * Creates a Quiz block node
 */
export function createQuizBlock(
  id: string,
  title: string,
  questions: Array<{
    id: string;
    question: string;
    options: Array<{ id: string; text: string }>;
    correctIndex: number;
    explanation?: string;
  }>
): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.QUIZ,
      title,
      questions,
    },
    children: [],
  };
}

/**
 * Creates a Flashcard block node
 */
export function createFlashcardBlock(
  id: string,
  front: string,
  back: string
): IBlock {
  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.FLASHCARD,
      front,
      back,
    },
    children: [],
  };
}

/**
 * Creates a Fill-in-the-Blank block node
 */
export function createFillBlankBlock(
  id: string,
  sentence: string
): IBlock {
  // Extract blanks from sentence using [bracket] syntax
  const regex = /\[([^\]]+)\]/g;
  const blanks: string[] = [];
  let match;
  while ((match = regex.exec(sentence)) !== null) {
    blanks.push(match[1]);
  }

  return {
    id,
    type: NodeType.BLOCK,
    content: {
      type: BlockType.FILL_BLANK,
      sentence,
      blanks,
    },
    children: [],
  };
}

// ============================================================================
// MOCK DOCUMENT DATA
// ============================================================================

/**
 * Sample document demonstrating the full node hierarchy
 */
export const mockDocument: IDocument = {
  id: 'doc-001',
  title: 'EduVi Product Launch',
  activeCardId: 'card-001',
  createdAt: '2026-01-31T10:00:00.000Z',
  updatedAt: '2026-01-31T14:30:00.000Z',
  cards: [
    // ========================================================================
    // CARD 1: Title Slide
    // ========================================================================
    createCard(
      'card-001',
      'Welcome',
      [
        createHeadingBlock(
          'block-001',
          'Welcome to EduVi',
          1
        ),
        createTextBlock(
          'block-002',
          '<p>The next generation of <strong>slide-based presentations</strong>. Create beautiful, dynamic content with our intuitive editor.</p>'
        ),
        createImageBlock(
          'block-003',
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
          'EduVi Hero Image',
          'Transform your ideas into stunning presentations'
        ),
      ],
      { backgroundColor: '#f0f9ff' }
    ),

    // ========================================================================
    // CARD 2: Features with 2-Column Layout
    // ========================================================================
    createCard(
      'card-002',
      'Key Features',
      [
        createHeadingBlock(
          'block-004',
          '<h1>Why Choose EduVi?</h1>',
          1
        ),
        createLayout(
          'layout-001',
          LayoutVariant.TWO_COLUMN,
          [
            createTextBlock(
              'block-005',
              '<h3>🚀 Lightning Fast</h3><p>Built with <em>Next.js 14</em> for optimal performance. Server-side rendering ensures your presentations load instantly.</p>'
            ),
            createTextBlock(
              'block-006',
              '<h3>🎨 Beautiful Design</h3><p>Professional templates and <strong>Tailwind CSS</strong> styling. Your content always looks polished and modern.</p>'
            ),
          ],
          6
        ),
        createLayout(
          'layout-002',
          LayoutVariant.TWO_COLUMN,
          [
            createTextBlock(
              'block-007',
              '<h3>📝 Rich Text Editing</h3><p>Powered by <em>Tiptap</em> editor. Format your text with ease - bold, italic, lists, and more.</p>'
            ),
            createTextBlock(
              'block-008',
              '<h3>🔄 Real-time Collaboration</h3><p>Work together with your team. Changes sync instantly across all connected devices.</p>'
            ),
          ],
          6
        ),
      ]
    ),

    // ========================================================================
    // CARD 3: Technical Architecture
    // ========================================================================
    createCard(
      'card-003',
      'Architecture',
      [
        createHeadingBlock(
          'block-009',
          '<h1>Node-Based Architecture</h1>',
          1
        ),
        createTextBlock(
          'block-010',
          '<p>EduVi uses a <strong>recursive tree structure</strong> for maximum flexibility:</p><ul><li><strong>Card Node</strong> - Represents a slide (X-axis)</li><li><strong>Layout Node</strong> - Structural containers (Y-axis)</li><li><strong>Block Node</strong> - Content elements (Z-axis depth)</li></ul>'
        ),
        createLayout(
          'layout-003',
          LayoutVariant.THREE_COLUMN,
          [
            createTextBlock(
              'block-011',
              '<h4>Cards</h4><p>Navigate horizontally between slides. Each card is a self-contained presentation unit.</p>'
            ),
            createTextBlock(
              'block-012',
              '<h4>Layouts</h4><p>Define structure with grids, columns, and masonry patterns for visual organization.</p>'
            ),
            createTextBlock(
              'block-013',
              '<h4>Blocks</h4><p>The building blocks: text, images, videos. Drag and drop to reorder.</p>'
            ),
          ],
          4
        ),
      ],
      { backgroundColor: '#fefce8' }
    ),

    // ========================================================================
    // CARD 4: Demo Content with Mixed Layouts
    // ========================================================================
    createCard(
      'card-004',
      'Demo',
      [
        createHeadingBlock(
          'block-014',
          '<h1>See It In Action</h1>',
          1
        ),
        createLayout(
          'layout-004',
          LayoutVariant.SIDEBAR_LEFT,
          [
            createImageBlock(
              'block-015',
              'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
              'Team collaboration',
            ),
            createTextBlock(
              'block-016',
              '<h3>Reflow Magic</h3><p>Watch how content <strong>automatically reflows</strong> when you add or edit text. No manual repositioning needed!</p><p>Try expanding this text block and see how siblings adjust their position smoothly.</p>'
            ),
          ],
          6
        ),
        createTextBlock(
          'block-017',
          '<p><em>Tip: Use the toolbar above to add new blocks and experiment with different layouts!</em></p>'
        ),
      ]
    ),

    // ========================================================================
    // CARD 5: Call to Action
    // ========================================================================
    createCard(
      'card-005',
      'Get Started',
      [
        createHeadingBlock(
          'block-018',
          '<h1>Ready to Create?</h1>',
          1
        ),
        createTextBlock(
          'block-019',
          '<p>Start building your presentation today. EduVi makes it easy to create <strong>professional</strong>, <strong>engaging</strong>, and <strong>dynamic</strong> content.</p>'
        ),
        createLayout(
          'layout-005',
          LayoutVariant.TWO_COLUMN,
          [
            createTextBlock(
              'block-020',
              '<h3>Free Tier</h3><ul><li>✅ 5 presentations</li><li>✅ Basic templates</li><li>✅ Export to PDF</li><li>❌ Team collaboration</li></ul>'
            ),
            createTextBlock(
              'block-021',
              '<h3>Pro Tier</h3><ul><li>✅ Unlimited presentations</li><li>✅ Premium templates</li><li>✅ Export to all formats</li><li>✅ Real-time collaboration</li></ul>'
            ),
          ],
          8
        ),
      ],
      { backgroundColor: '#f0fdf4' }
    ),

    // ========================================================================
    // CARD 6: Interactive Learning Demo
    // ========================================================================
    createCard(
      'card-006',
      'Interactive Demo',
      [
        createHeadingBlock(
          'block-022',
          '<h1>Interactive Learning Widgets</h1>',
          1
        ),
        createTextBlock(
          'block-023',
          '<p>EduVi supports <strong>interactive learning content</strong> that engages students. These widgets work seamlessly in the Flutter Viewer app!</p>'
        ),
        // Quiz Example
        createQuizBlock(
          'block-024',
          'JavaScript Basics Quiz',
          [
            {
              id: 'q1',
              question: 'What keyword is used to declare a constant in JavaScript?',
              options: [
                { id: 'q1-a', text: 'var' },
                { id: 'q1-b', text: 'let' },
                { id: 'q1-c', text: 'const' },
                { id: 'q1-d', text: 'constant' },
              ],
              correctIndex: 2,
              explanation: 'The "const" keyword declares a block-scoped constant that cannot be reassigned.',
            },
            {
              id: 'q2',
              question: 'Which method converts a JSON string to a JavaScript object?',
              options: [
                { id: 'q2-a', text: 'JSON.stringify()' },
                { id: 'q2-b', text: 'JSON.parse()' },
                { id: 'q2-c', text: 'JSON.toObject()' },
              ],
              correctIndex: 1,
              explanation: 'JSON.parse() parses a JSON string and returns the corresponding JavaScript value or object.',
            },
          ]
        ),
        createLayout(
          'layout-006',
          LayoutVariant.TWO_COLUMN,
          [
            // Flashcard Example
            createFlashcardBlock(
              'block-025',
              'What is React?',
              'React is a JavaScript library for building user interfaces, maintained by Meta. It uses a component-based architecture and virtual DOM for efficient updates.'
            ),
            // Fill-in-Blank Example
            createFillBlankBlock(
              'block-026',
              'In React, [useState] is a Hook that lets you add [state] to functional components.'
            ),
          ],
          6
        ),
      ],
      { backgroundColor: '#fef3c7' }
    ),
  ],
};

/**
 * Empty document template for new projects
 */
export const emptyDocument: IDocument = {
  id: 'doc-new',
  title: 'Untitled Presentation',
  activeCardId: 'card-new-001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    createCard(
      'card-new-001',
      'Slide 1',
      [
        createHeadingBlock('block-new-001', '<h1>Your Title Here</h1>', 1),
        createTextBlock('block-new-002', '<p>Start typing your content...</p>'),
      ]
    ),
  ],
};

export default mockDocument;
