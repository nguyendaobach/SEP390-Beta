# EduVi - Slide-Based Presentation Tool

A Next.js 14 frontend prototype for a slide-based presentation tool similar to Gamma.app.

## 🏗️ Architecture

### Node-Based System (X, Y, Z Logic)

The application renders data based on a recursive tree structure:

```
Document
└── Cards (X-axis: Horizontal navigation between slides)
    └── Layouts / Blocks (Y-axis: Vertical stacking within a slide)
        └── Children (Z-axis: Nesting depth)
```

**Node Types:**
- **CARD** (Root/Slide): Represents a single slide
- **LAYOUT** (Container): Structural arrangement (2-column grid, masonry, etc.)
- **BLOCK** (Content): Leaf nodes containing actual content (Text, Image, Video)

### Gamma Reflow Logic

Content uses standard CSS Flow (Flex/Grid). When text in a Tiptap block expands:
- The Block Node grows in height naturally
- Siblings are pushed down automatically (Layout Shift)
- NO absolute positioning for content

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **Icons**: Lucide-react
- **State**: Zustand
- **Rich Text**: Tiptap (Starter Kit)
- **Drag & Drop**: @dnd-kit/core & @dnd-kit/sortable
- **Mocking**: Next.js Route Handlers

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── project/
│   │       └── route.ts      # Mock API endpoint
│   ├── globals.css           # Global styles + Tiptap styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main editor page
├── components/
│   ├── blocks/
│   │   ├── TextBlock.tsx     # Tiptap rich text editor
│   │   ├── HeadingBlock.tsx  # Editable headings
│   │   ├── ImageBlock.tsx    # Image display
│   │   └── VideoBlock.tsx    # Video embeds
│   ├── layout/
│   │   ├── Sidebar.tsx       # Slide list (sortable)
│   │   ├── Toolbar.tsx       # Add content buttons
│   │   └── MainStage.tsx     # Active slide canvas
│   └── renderer/
│       └── NodeRenderer.tsx  # Recursive node renderer
├── data/
│   └── mock-data.ts          # Sample document data
├── lib/
│   └── utils.ts              # Utility functions (cn, etc.)
├── store/
│   └── useDocumentStore.ts   # Zustand state management
└── types/
    └── nodes.ts              # TypeScript interfaces
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📋 Backend API Contract

### GET /api/project

Returns the document structure:

```json
{
  "id": "doc-001",
  "title": "Presentation Title",
  "cards": [
    {
      "id": "card-001",
      "type": "CARD",
      "title": "Slide 1",
      "backgroundColor": "#f0f9ff",
      "children": [
        {
          "id": "block-001",
          "type": "BLOCK",
          "content": {
            "type": "HEADING",
            "text": "Welcome",
            "level": 1
          },
          "children": []
        },
        {
          "id": "block-002",
          "type": "BLOCK",
          "content": {
            "type": "TEXT",
            "html": "<p>Rich text content here</p>"
          },
          "children": []
        },
        {
          "id": "layout-001",
          "type": "LAYOUT",
          "variant": "TWO_COLUMN",
          "gap": 4,
          "children": [
            {
              "id": "block-003",
              "type": "BLOCK",
              "content": { "type": "TEXT", "html": "<p>Column 1</p>" },
              "children": []
            },
            {
              "id": "block-004",
              "type": "BLOCK",
              "content": { "type": "TEXT", "html": "<p>Column 2</p>" },
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "activeCardId": "card-001",
  "createdAt": "2026-01-31T10:00:00.000Z",
  "updatedAt": "2026-01-31T14:30:00.000Z"
}
```

### Node Type Enums

```typescript
// Node Types
enum NodeType {
  CARD = 'CARD',
  LAYOUT = 'LAYOUT',
  BLOCK = 'BLOCK',
}

// Block Content Types
enum BlockType {
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

// Layout Variants
enum LayoutVariant {
  SINGLE = 'SINGLE',
  TWO_COLUMN = 'TWO_COLUMN',
  THREE_COLUMN = 'THREE_COLUMN',
  SIDEBAR_LEFT = 'SIDEBAR_LEFT',
  SIDEBAR_RIGHT = 'SIDEBAR_RIGHT',
  MASONRY = 'MASONRY',
}
```

### Content Structures

**Text Block:**
```json
{
  "type": "TEXT",
  "html": "<p>HTML content from <strong>Tiptap</strong></p>"
}
```

**Heading Block:**
```json
{
  "type": "HEADING",
  "text": "Plain text heading",
  "level": 1
}
```

**Image Block:**
```json
{
  "type": "IMAGE",
  "src": "https://example.com/image.jpg",
  "alt": "Description",
  "caption": "Optional caption"
}
```

**Video Block:**
```json
{
  "type": "VIDEO",
  "src": "https://youtube.com/watch?v=...",
  "provider": "youtube"
}
```

## 🔧 Key Components

### NodeRenderer

The recursive component that renders the node tree:

```typescript
function NodeRenderer({ node, depth }) {
  if (isCard(node)) return <CardRenderer node={node} />;
  if (isLayout(node)) return <LayoutRenderer node={node} depth={depth} />;
  if (isBlock(node)) return <BlockRenderer node={node} />;
}
```

### Zustand Store

Key actions available:
- `loadDocument()` - Fetch from API
- `setActiveCard(cardId)` - Switch slides
- `addBlockToCard(cardId, blockType)` - Add content
- `addLayoutToCard(cardId, variant)` - Add layout
- `updateBlockContent(blockId, content)` - Edit content
- `deleteNode(nodeId)` - Remove node
- `reorderCards(activeId, overId)` - Drag & drop slides
- `reorderNodesInCard(cardId, activeId, overId)` - Reorder within slide

## 📝 Notes for Backend Team

1. **All IDs must be unique** across the entire document
2. **Block nodes always have `children: []`** (empty array for leaf nodes)
3. **HTML in TEXT blocks** should be sanitized before storage
4. **Timestamps** should be ISO-8601 format
5. **Layout children** can only be BLOCK nodes (no nested layouts)
6. **Card children** can be LAYOUT or BLOCK nodes

## 🎨 Features Implemented

- [x] Recursive node rendering
- [x] Tiptap rich text editing
- [x] Drag-and-drop slide reordering
- [x] Drag-and-drop block reordering within slides
- [x] Add new slides
- [x] Add text/heading/image/video blocks
- [x] Add 2-column/3-column/sidebar layouts
- [x] Delete nodes
- [x] Auto-reflow when content expands
- [x] Mock API with realistic data

## 📄 License

MIT
