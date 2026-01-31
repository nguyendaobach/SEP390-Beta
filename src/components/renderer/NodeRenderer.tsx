'use client';

/**
 * NodeRenderer Component
 * ======================
 * 
 * The heart of EduVi's rendering system.
 * Recursively renders the node tree based on node.type.
 * 
 * Node Type Mapping:
 * ------------------
 * CARD   → CardRenderer (slide container)
 * LAYOUT → LayoutRenderer (structural container with Flex/Grid)
 * BLOCK  → BlockRenderer (content: Text, Image, Video)
 * 
 * Reflow Logic:
 * -------------
 * All content uses standard CSS Flow (Flex/Grid).
 * When a Tiptap block expands, it naturally pushes siblings down.
 * NO absolute positioning is used for content elements.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store';
import {
  INode,
  ICard,
  ILayout,
  IBlock,
  NodeType,
  BlockType,
  LayoutVariant,
  isCard,
  isLayout,
  isBlock,
  isTextContent,
  isHeadingContent,
  isImageContent,
  isVideoContent,
  isMaterialContent,
  isQuizContent,
  isFlashcardContent,
  isFillBlankContent,
  IBlockStyles,
} from '@/types';
import { TextBlock, HeadingBlock, ImageBlock, VideoBlock } from '@/components/blocks';
import { ResizableBlockWrapper } from '@/components/blocks/ResizableBlockWrapper';
import { renderWidget } from '@/components/widgets';
import { renderInteractiveWidget } from '@/components/interactive';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus } from 'lucide-react';

// ============================================================================
// PROPS INTERFACES
// ============================================================================

interface NodeRendererProps {
  node: INode;
  depth?: number;
}

interface SortableNodeProps {
  node: INode;
  depth?: number;
  children: React.ReactNode;
}

// ============================================================================
// SORTABLE WRAPPER
// ============================================================================

/**
 * SortableNode wraps content with drag-and-drop functionality
 */
function SortableNode({ node, depth = 0, children }: SortableNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const selectedNodeId = useDocumentStore((state) => state.selectedNodeId);
  const setSelectedNode = useDocumentStore((state) => state.setSelectedNode);
  const deleteNode = useDocumentStore((state) => state.deleteNode);

  const isSelected = selectedNodeId === node.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag handle and actions - only show for blocks and layouts */}
      {depth > 0 && (
        <div
          className={cn(
            'absolute -left-8 top-1/2 -translate-y-1/2',
            'flex items-center gap-1',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-150'
          )}
        >
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-gray-200 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node.id);
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// BLOCK RENDERER
// ============================================================================

/**
 * BlockRenderer handles leaf nodes (content blocks)
 */
function BlockRenderer({ node }: { node: IBlock }) {
  const selectedNodeId = useDocumentStore((state) => state.selectedNodeId);
  const setSelectedNode = useDocumentStore((state) => state.setSelectedNode);
  const updateBlockStyles = useDocumentStore((state) => state.updateBlockStyles);
  
  const isSelected = selectedNodeId === node.id;
  const { content, styles } = node;

  const handleSelect = () => setSelectedNode(node.id);

  // Handle style updates from ResizableBlockWrapper
  const handleStyleChange = (newStyles: Partial<IBlockStyles>) => {
    updateBlockStyles(node.id, newStyles);
  };

  // Render based on content type
  if (isTextContent(content)) {
    return (
      <TextBlock
        id={node.id}
        content={content}
        isSelected={isSelected}
        onSelect={handleSelect}
      />
    );
  }

  if (isHeadingContent(content)) {
    return (
      <HeadingBlock
        id={node.id}
        content={content}
        isSelected={isSelected}
        onSelect={handleSelect}
      />
    );
  }

  if (isImageContent(content)) {
    return (
      <ImageBlock
        id={node.id}
        content={content}
        isSelected={isSelected}
        onSelect={handleSelect}
      />
    );
  }

  if (isVideoContent(content)) {
    return (
      <VideoBlock
        id={node.id}
        content={content}
        isSelected={isSelected}
        onSelect={handleSelect}
      />
    );
  }

  // Handle Material blocks with Widget Registry
  if (isMaterialContent(content)) {
    const widgetElement = renderWidget(content.widgetType, content.data, {
      id: node.id,
      styles,
      isSelected,
      onSelect: handleSelect,
    });
    
    return (
      <ResizableBlockWrapper
        id={node.id}
        styles={styles}
        isSelected={isSelected}
        onStyleChange={handleStyleChange}
        onClick={handleSelect}
      >
        {widgetElement}
      </ResizableBlockWrapper>
    );
  }

  // Handle Interactive blocks (Quiz, Flashcard, Fill-in-Blank)
  if (isQuizContent(content)) {
    return renderInteractiveWidget(
      'QUIZ',
      {
        id: node.id,
        data: content,
        isSelected,
        onUpdate: (newData) => {
          // Update via store
          useDocumentStore.getState().updateBlockContent(node.id, {
            ...content,
            ...newData,
          });
        },
      }
    );
  }

  if (isFlashcardContent(content)) {
    return renderInteractiveWidget(
      'FLASHCARD',
      {
        id: node.id,
        data: content,
        isSelected,
        onUpdate: (newData) => {
          useDocumentStore.getState().updateBlockContent(node.id, {
            ...content,
            ...newData,
          });
        },
      }
    );
  }

  if (isFillBlankContent(content)) {
    return renderInteractiveWidget(
      'FILL_BLANK',
      {
        id: node.id,
        data: content,
        isSelected,
        onUpdate: (newData) => {
          useDocumentStore.getState().updateBlockContent(node.id, {
            ...content,
            ...newData,
          });
        },
      }
    );
  }

  // Fallback for unknown content types
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      Unknown block type: {(content as any).type}
    </div>
  );
}

// ============================================================================
// LAYOUT RENDERER
// ============================================================================

/**
 * Get column count for a layout variant
 */
function getColumnCount(variant: LayoutVariant): number {
  switch (variant) {
    case LayoutVariant.TWO_COLUMN:
    case LayoutVariant.SIDEBAR_LEFT:
    case LayoutVariant.SIDEBAR_RIGHT:
      return 2;
    case LayoutVariant.THREE_COLUMN:
      return 3;
    default:
      return 1;
  }
}

/**
 * ColumnDropZone - A droppable zone for a specific column in a layout
 */
function ColumnDropZone({ 
  layoutId, 
  columnIndex, 
  children 
}: { 
  layoutId: string; 
  columnIndex: number; 
  children: React.ReactNode[];
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `layout-${layoutId}-col-${columnIndex}`,
    data: {
      type: 'LAYOUT_COLUMN',
      layoutId,
      columnIndex,
      accepts: ['MATERIAL'],
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[120px] rounded-lg transition-all duration-200',
        isOver && 'bg-indigo-50 ring-2 ring-indigo-400 ring-inset',
        children.length === 0 && !isOver && 'border-2 border-dashed border-gray-200'
      )}
    >
      {children.length > 0 ? (
        <div className="flex flex-col gap-4">
          {children}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center h-full min-h-[120px]',
            isOver ? 'text-indigo-600' : 'text-gray-400'
          )}
        >
          <div className="text-center p-4">
            <Plus className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs">
              {isOver ? 'Drop here' : 'Drop widget'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * LayoutRenderer handles container nodes with Flex/Grid layouts.
 * Creates separate droppable zones for each column.
 */
function LayoutRenderer({ node, depth = 0 }: { node: ILayout; depth?: number }) {
  const selectedNodeId = useDocumentStore((state) => state.selectedNodeId);
  const setSelectedNode = useDocumentStore((state) => state.setSelectedNode);
  const isSelected = selectedNodeId === node.id;

  const columnCount = getColumnCount(node.variant);
  
  // Distribute children across columns
  // Children are assigned to columns based on their index position
  const childrenByColumn: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
  
  node.children.forEach((child, index) => {
    const columnIndex = index % columnCount;
    childrenByColumn[columnIndex].push(
      <div key={child.id} className="min-w-0">
        <NodeRenderer node={child as INode} depth={depth + 1} />
      </div>
    );
  });

  // Single column layout - simpler rendering
  if (columnCount === 1) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node.id);
        }}
        className={cn(
          'flex flex-col gap-4',
          isSelected && 'ring-2 ring-primary-300 ring-offset-2 rounded-lg',
          'transition-all duration-200'
        )}
      >
        <ColumnDropZone layoutId={node.id} columnIndex={0}>
          {childrenByColumn[0]}
        </ColumnDropZone>
      </div>
    );
  }

  // Multi-column layout
  const gridClasses = getGridClasses(node.variant, node.gap);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode(node.id);
      }}
      className={cn(
        'relative',
        gridClasses,
        isSelected && 'ring-2 ring-primary-300 ring-offset-2 rounded-lg',
        'transition-all duration-200'
      )}
    >
      {childrenByColumn.map((columnChildren, colIndex) => (
        <ColumnDropZone 
          key={colIndex} 
          layoutId={node.id} 
          columnIndex={colIndex}
        >
          {columnChildren}
        </ColumnDropZone>
      ))}
    </div>
  );
}

/**
 * Get CSS grid classes for layout variants
 */
function getGridClasses(variant: LayoutVariant, gap: number = 4): string {
  const gapClass = `gap-${gap}`;

  switch (variant) {
    case LayoutVariant.TWO_COLUMN:
      return cn('grid grid-cols-1 md:grid-cols-2', gapClass);

    case LayoutVariant.THREE_COLUMN:
      return cn('grid grid-cols-1 md:grid-cols-3', gapClass);

    case LayoutVariant.SIDEBAR_LEFT:
      return cn('grid grid-cols-1 md:grid-cols-[1fr_2fr]', gapClass);

    case LayoutVariant.SIDEBAR_RIGHT:
      return cn('grid grid-cols-1 md:grid-cols-[2fr_1fr]', gapClass);

    default:
      return cn('flex flex-col', gapClass);
  }
}

// ============================================================================
// CARD RENDERER
// ============================================================================

/**
 * CardRenderer handles slide-level nodes.
 * Acts as the main container for a slide's content.
 */
function CardRenderer({ node }: { node: ICard }) {
  return (
    <div
      className={cn(
        'w-full min-h-[600px]',
        'flex flex-col gap-6',
        'p-8 md:p-12',
        // Card styling
        'bg-white rounded-2xl shadow-stage',
        // Smooth transitions for layout shifts
        'transition-all duration-300 ease-out'
      )}
      style={{
        backgroundColor: node.backgroundColor || undefined,
        backgroundImage: node.backgroundImage
          ? `url(${node.backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Render children (layouts and blocks) */}
      {node.children.map((child) => (
        <SortableNode key={child.id} node={child as INode} depth={1}>
          <NodeRenderer node={child as INode} depth={1} />
        </SortableNode>
      ))}

      {/* Empty state */}
      {node.children.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>This slide is empty. Add some content using the toolbar above.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN NODE RENDERER
// ============================================================================

/**
 * NodeRenderer - Main recursive component
 * 
 * Determines the node type and delegates to the appropriate renderer.
 * This creates a clean separation of concerns and makes the code extensible.
 * 
 * @param node - The node to render
 * @param depth - Current depth in the tree (0 = card level)
 */
export function NodeRenderer({ node, depth = 0 }: NodeRendererProps) {
  // Type guard switch for proper TypeScript narrowing
  if (isCard(node)) {
    return <CardRenderer node={node} />;
  }

  if (isLayout(node)) {
    return <LayoutRenderer node={node} depth={depth} />;
  }

  if (isBlock(node)) {
    return <BlockRenderer node={node} />;
  }

  // Fallback for unknown node types (shouldn't happen with proper types)
  console.warn('Unknown node type:', node);
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
      Unknown node type: {(node as any).type}
    </div>
  );
}

export default NodeRenderer;
