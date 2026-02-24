/**
 * EduVi Mock Data - BACKEND API CONTRACT
 * =======================================
 * 
 * ⚠️ IMPORTANT: This file defines the EXACT JSON structure that Backend API must return.
 * 
 * BACKEND API ENDPOINTS:
 * ----------------------
 * GET    /api/documents/:id      → Returns IDocument (this structure)
 * POST   /api/documents           → Creates document, returns IDocument
 * PUT    /api/documents/:id      → Updates document, returns IDocument
 * DELETE /api/documents/:id      → Returns { success: boolean }
 * GET    /api/documents?userId=X → Returns IDocument[]
 * 
 * DATA FORMAT REQUIREMENTS:
 * -------------------------
 * ✅ Pure JSON - NO helper functions like createCard(), createBlock()
 * ✅ All IDs must be UUID strings (use uuid library: uuid.v4())
 * ✅ Dates must be ISO 8601 format: "2026-02-24T10:00:00.000Z"
 * ✅ All enums must use string values: "CARD", "BLOCK", "TEXT", etc.
 * ✅ Node hierarchy: IDocument → ICard[] → (ILayout | IBlock)[] → IBlock[]
 * 
 * VALIDATION RULES:
 * -----------------
 * - document.id: required, UUID string
 * - document.title: required, max 255 chars
 * - document.cards: required, min 1 card
 * - card.type: must be "CARD"
 * - block.type: must be "BLOCK"
 * - layout.type: must be "LAYOUT"
 * - block.content.type: must be valid BlockType enum
 * 
 * DATABASE STORAGE:
 * -----------------
 * Recommended: Store as JSONB in PostgreSQL or MongoDB document
 * Alternative: Normalize into documents/cards/blocks/layouts tables
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
// FRONTEND HELPER FUNCTIONS (NOT FOR BACKEND)
// ============================================================================

/**
 * ⚠️ WARNING: These helper functions are ONLY for Frontend development.
 * Backend API should NOT use these - just return pure JSON.
 * 
 * These are convenience utilities for:
 * - Creating new blocks in the UI editor
 * - Testing components
 * - Seeding data
 */

/**
 * Creates a text block (Frontend helper only)
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
 * Creates a heading block (Frontend helper only)
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
 * Creates an image block (Frontend helper only)
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
 * Creates a video block (Frontend helper only)
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
 * Creates a layout node (Frontend helper only)
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
 * Creates a card/slide node (Frontend helper only)
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
    backgroundColor: options?.backgroundColor,
    backgroundImage: options?.backgroundImage,
  };
}

/**
 * Creates a Quiz block (Frontend helper only)
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
 * Creates a Flashcard block (Frontend helper only)
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
 * Creates a Fill-in-the-Blank block (Frontend helper only)
 */
export function createFillBlankBlock(
  id: string,
  sentence: string
): IBlock {
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
// MOCK API RESPONSE - FULL DOCUMENT EXAMPLE
// ============================================================================

/**
 * Example API Response: GET /api/documents/doc-001
 * 
 * This represents the EXACT JSON structure Backend must return.
 * Frontend will consume this directly without any transformation.
 */
export const mockDocument: IDocument = {
  id: 'doc-001',
  title: 'EduVi Product Launch',
  activeCardId: 'card-001',
  createdAt: '2026-01-31T10:00:00.000Z',
  updatedAt: '2026-01-31T14:30:00.000Z',
  cards: [
    // ========================================================================
    // CARD 1: Image and Text (Template 001)
    // ========================================================================
    {
      id: 'card-001',
      type: NodeType.CARD,
      templateId: 'template-001',
      title: 'Welcome',
      backgroundColor: '#f0f9ff',
      backgroundImage: undefined,
      children: [
        {
          id: 'layout-001',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.SIDEBAR_LEFT,
          gap: 6,
          children: [
            {
              id: 'block-001',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.IMAGE,
                src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                alt: 'EduVi Hero Image',
                caption: 'Transform your ideas into stunning presentations',
              },
              children: [],
            },
            {
              id: 'block-002',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h1>Welcome to EduVi</h1><p>The next generation of <strong>slide-based presentations</strong>. Create beautiful, dynamic content with our intuitive editor.</p>',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // ========================================================================
    // CARD 2: Two Columns (Template 003)
    // ========================================================================
    {
      id: 'card-002',
      type: NodeType.CARD,
      templateId: 'template-003',
      title: 'Key Features',
      backgroundColor: undefined,
      backgroundImage: undefined,
      children: [
        {
          id: 'block-003',
          type: NodeType.BLOCK,
          content: {
            type: BlockType.HEADING,
            html: '<h1>Why Choose EduVi?</h1>',
            level: 1,
          },
          children: [],
        },
        {
          id: 'layout-002',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.TWO_COLUMN,
          gap: 6,
          children: [
            {
              id: 'block-004',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h3>🚀 Lightning Fast</h3><p>Built with <em>Next.js 14</em> for optimal performance.</p><h3>📝 Rich Text Editing</h3><p>Powered by <em>Tiptap</em> editor. Format with ease.</p>',
              },
              children: [],
            },
            {
              id: 'block-005',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h3>🎨 Beautiful Design</h3><p>Professional templates with <strong>Tailwind CSS</strong>.</p><h3>🔄 Real-time Collaboration</h3><p>Work together, sync instantly.</p>',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // ========================================================================
    // CARD 3: Three Columns (Template 005)
    // ========================================================================
    {
      id: 'card-003',
      type: NodeType.CARD,
      templateId: 'template-005',
      title: 'Architecture',
      backgroundColor: '#fefce8',
      backgroundImage: undefined,
      children: [
        {
          id: 'block-006',
          type: NodeType.BLOCK,
          content: {
            type: BlockType.HEADING,
            html: '<h1>Node-Based Architecture</h1>',
            level: 1,
          },
          children: [],
        },
        {
          id: 'layout-003',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.THREE_COLUMN,
          gap: 4,
          children: [
            {
              id: 'block-007',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h4>Cards</h4><p>Navigate horizontally between slides. Self-contained units.</p>',
              },
              children: [],
            },
            {
              id: 'block-008',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h4>Layouts</h4><p>Define structure with grids and columns for organization.</p>',
              },
              children: [],
            },
            {
              id: 'block-009',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h4>Blocks</h4><p>Content elements: text, images, videos. Drag to reorder.</p>',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // ========================================================================
    // CARD 4: Text and Image (Template 002)
    // ========================================================================
    {
      id: 'card-004',
      type: NodeType.CARD,
      templateId: 'template-002',
      title: 'Demo',
      backgroundColor: undefined,
      backgroundImage: undefined,
      children: [
        {
          id: 'layout-004',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.SIDEBAR_RIGHT,
          gap: 6,
          children: [
            {
              id: 'block-010',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h1>See It In Action</h1><h3>Reflow Magic</h3><p>Watch how content <strong>automatically reflows</strong> when you edit. No manual repositioning!</p><p><em>Tip: Experiment with layouts!</em></p>',
              },
              children: [],
            },
            {
              id: 'block-011',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.IMAGE,
                src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
                alt: 'Team collaboration',
                caption: undefined,
              },
              children: [],
            },
          ],
        },
      ],
    },

    // ========================================================================
    // CARD 5: Two Column Text (Template 004)
    // ========================================================================
    {
      id: 'card-005',
      type: NodeType.CARD,
      templateId: 'template-004',
      title: 'Get Started',
      backgroundColor: '#f0fdf4',
      backgroundImage: undefined,
      children: [
        {
          id: 'block-012',
          type: NodeType.BLOCK,
          content: {
            type: BlockType.HEADING,
            html: '<h1>Ready to Create?</h1>',
            level: 1,
          },
          children: [],
        },
        {
          id: 'layout-005',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.TWO_COLUMN,
          gap: 8,
          children: [
            {
              id: 'block-013',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h3>Free Tier</h3><p>Start building presentations today.</p><ul><li>✅ 5 presentations</li><li>✅ Basic templates</li><li>✅ Export to PDF</li><li>❌ Team collaboration</li></ul>',
              },
              children: [],
            },
            {
              id: 'block-014',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<h3>Pro Tier</h3><p>Create <strong>professional</strong> content.</p><ul><li>✅ Unlimited presentations</li><li>✅ Premium templates</li><li>✅ All formats</li><li>✅ Collaboration</li></ul>',
              },
              children: [],
            },
          ],
        },
      ],
    },

    // ========================================================================
    // CARD 6: Three Column Text (Template 006) - Interactive
    // ========================================================================
    {
      id: 'card-006',
      type: NodeType.CARD,
      templateId: 'template-006',
      title: 'Interactive Demo',
      backgroundColor: '#fef3c7',
      backgroundImage: undefined,
      children: [
        {
          id: 'block-015',
          type: NodeType.BLOCK,
          content: {
            type: BlockType.HEADING,
            html: '<h1>Interactive Learning Widgets</h1>',
            level: 1,
          },
          children: [],
        },
        {
          id: 'layout-006',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.THREE_COLUMN,
          gap: 6,
          children: [
            {
              id: 'block-016',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.QUIZ,
                title: 'JavaScript Quiz',
                questions: [
                  {
                    id: 'q1',
                    question: 'What keyword declares a constant?',
                    options: [
                      { id: 'q1-a', text: 'var' },
                      { id: 'q1-b', text: 'let' },
                      { id: 'q1-c', text: 'const' },
                    ],
                    correctIndex: 2,
                    explanation: 'The "const" keyword declares a block-scoped constant.',
                  },
                ],
              },
              children: [],
            },
            {
              id: 'block-017',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.FLASHCARD,
                front: 'What is React?',
                back: 'React is a JavaScript library for building user interfaces, maintained by Meta.',
              },
              children: [],
            },
            {
              id: 'block-018',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.FILL_BLANK,
                sentence: 'In React, [useState] is a Hook that lets you add [state] to components.',
                blanks: ['useState', 'state'],
              },
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Example API Response: POST /api/documents (Create new document)
 * 
 * Minimal document template for new projects.
 * Backend should generate UUIDs and timestamps automatically.
 */
export const emptyDocument: IDocument = {
  id: 'doc-new',
  title: 'Untitled Presentation',
  activeCardId: 'card-new-001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [
    {
      id: 'card-new-001',
      type: NodeType.CARD,
      templateId: 'template-003',
      title: 'Slide 1',
      backgroundColor: undefined,
      backgroundImage: undefined,
      children: [
        {
          id: 'block-new-001',
          type: NodeType.BLOCK,
          content: {
            type: BlockType.HEADING,
            html: '<h1>Your Title Here</h1>',
            level: 1,
          },
          children: [],
        },
        {
          id: 'layout-new-001',
          type: NodeType.LAYOUT,
          variant: LayoutVariant.TWO_COLUMN,
          gap: 6,
          children: [
            {
              id: 'block-new-002',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<p>Start typing your content...</p>',
              },
              children: [],
            },
            {
              id: 'block-new-003',
              type: NodeType.BLOCK,
              content: {
                type: BlockType.TEXT,
                html: '<p>Add more content here...</p>',
              },
              children: [],
            },
          ],
        },
      ],
    },
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
