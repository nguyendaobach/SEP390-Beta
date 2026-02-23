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
  ICardOutline,
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

// ============================================================================
// PROMPT EDITOR MOCK DATA
// ============================================================================

/**
 * Sample prompts for testing Prompt Editor
 * These represent typical user input before AI generation
 */
export const mockPrompts = {
  eduViLaunch: {
    mainPrompt: 'Tạo bài thuyết trình về sản phẩm EduVi - nền tảng tạo slide thế hệ mới',
    additionalInstructions: 'Tập trung vào các tính năng công nghệ, kiến trúc hệ thống, và lợi ích cho người dùng. Thêm ví dụ tương tác.',
  },
  jsBasics: {
    mainPrompt: 'Tạo bài giảng JavaScript cơ bản cho sinh viên',
    additionalInstructions: 'Bao gồm biến, hàm, vòng lặp và ví dụ thực tế',
  },
  reactIntro: {
    mainPrompt: 'Giới thiệu React framework cho developer',
    additionalInstructions: 'Giải thích components, hooks, state management',
  },
};

/**
 * Generated card outlines for Prompt Editor
 * This represents what the AI would return after processing a prompt
 * Based on the mockDocument slides content
 */
export const mockCardOutlines: ICardOutline[] = [
  {
    id: 'outline-001',
    title: 'Welcome',
    bullets: [
      'Giới thiệu EduVi - nền tảng slide thế hệ mới',
      'Tạo nội dung đẹp và động với trình soạn thảo trực quan',
      'Hình ảnh hero với caption "Transform your ideas into stunning presentations"',
    ],
    order: 0,
  },
  {
    id: 'outline-002',
    title: 'Key Features',
    bullets: [
      '🚀 Lightning Fast - Xây dựng với Next.js 14, tối ưu hiệu suất',
      '🎨 Beautiful Design - Template chuyên nghiệp với Tailwind CSS',
      '📝 Rich Text Editing - Trình soạn thảo Tiptap mạnh mẽ',
      '🔄 Real-time Collaboration - Làm việc nhóm, đồng bộ tức thì',
    ],
    order: 1,
  },
  {
    id: 'outline-003',
    title: 'Architecture',
    bullets: [
      'Kiến trúc Node-Based với cấu trúc cây đệ quy',
      'Card Node - Đại diện cho một slide (trục X)',
      'Layout Node - Container cấu trúc (trục Y)',
      'Block Node - Phần tử nội dung (độ sâu Z)',
      'Layout linh hoạt: Grid, Column, Masonry',
    ],
    order: 2,
  },
  {
    id: 'outline-004',
    title: 'Demo',
    bullets: [
      'Xem EduVi hoạt động thực tế',
      'Nội dung tự động reflow khi chỉnh sửa',
      'Không cần điều chỉnh vị trí thủ công',
      'Thử mở rộng block và xem các phần tử khác tự động điều chỉnh',
    ],
    order: 3,
  },
  {
    id: 'outline-005',
    title: 'Get Started',
    bullets: [
      'Sẵn sàng tạo bài thuyết trình của bạn',
      'Free Tier: 5 presentations, basic templates, PDF export',
      'Pro Tier: Unlimited presentations, premium templates, all formats, collaboration',
      'EduVi giúp tạo nội dung chuyên nghiệp, hấp dẫn và động',
    ],
    order: 4,
  },
  {
    id: 'outline-006',
    title: 'Interactive Demo',
    bullets: [
      'Widget học tập tương tác',
      'Quiz: Câu hỏi trắc nghiệm JavaScript với giải thích',
      'Flashcard: Thẻ ghi nhớ lật hai mặt',
      'Fill-in-Blank: Điền vào chỗ trống',
      'Hoạt động mượt mà trên Flutter Viewer app',
    ],
    order: 5,
  },
];

/**
 * Alternative outline examples for different topics
 */
export const mockJavaScriptOutline: ICardOutline[] = [
  {
    id: 'js-outline-001',
    title: 'Giới thiệu JavaScript',
    bullets: [
      'JavaScript là ngôn ngữ lập trình phổ biến nhất',
      'Chạy trên mọi trình duyệt web',
      'Sử dụng cho cả Frontend và Backend (Node.js)',
    ],
    order: 0,
  },
  {
    id: 'js-outline-002',
    title: 'Biến và Kiểu dữ liệu',
    bullets: [
      'var, let, const - cách khai báo biến',
      'Kiểu dữ liệu: String, Number, Boolean, Object, Array',
      'Template literals với backticks',
      'Ví dụ thực tế về khai báo và sử dụng biến',
    ],
    order: 1,
  },
  {
    id: 'js-outline-003',
    title: 'Hàm (Functions)',
    bullets: [
      'Function declaration vs Function expression',
      'Arrow functions (ES6+)',
      'Parameters và return values',
      'Callback functions',
    ],
    order: 2,
  },
  {
    id: 'js-outline-004',
    title: 'Vòng lặp và Điều kiện',
    bullets: [
      'if/else statements',
      'Switch case',
      'for loop, while loop, forEach',
      'map, filter, reduce cho arrays',
    ],
    order: 3,
  },
  {
    id: 'js-outline-005',
    title: 'DOM Manipulation',
    bullets: [
      'querySelector và getElementById',
      'Thay đổi nội dung HTML',
      'Thêm/xóa CSS classes',
      'Event listeners',
    ],
    order: 4,
  },
];

export const mockReactOutline: ICardOutline[] = [
  {
    id: 'react-outline-001',
    title: 'React là gì?',
    bullets: [
      'Thư viện JavaScript để xây dựng giao diện',
      'Được phát triển bởi Meta (Facebook)',
      'Component-based architecture',
      'Virtual DOM để tối ưu hiệu suất',
    ],
    order: 0,
  },
  {
    id: 'react-outline-002',
    title: 'Components',
    bullets: [
      'Function Components vs Class Components',
      'Props - truyền dữ liệu giữa components',
      'Children và composition',
      'Component lifecycle',
    ],
    order: 1,
  },
  {
    id: 'react-outline-003',
    title: 'Hooks',
    bullets: [
      'useState - quản lý state',
      'useEffect - side effects',
      'useContext - global state',
      'Custom hooks',
    ],
    order: 2,
  },
  {
    id: 'react-outline-004',
    title: 'State Management',
    bullets: [
      'Local state vs Global state',
      'Context API',
      'Redux Toolkit',
      'Zustand (lightweight alternative)',
    ],
    order: 3,
  },
  {
    id: 'react-outline-005',
    title: 'Best Practices',
    bullets: [
      'Component composition',
      'Avoid prop drilling',
      'Memoization với useMemo và useCallback',
      'Code splitting và lazy loading',
    ],
    order: 4,
  },
];

export default mockDocument;
