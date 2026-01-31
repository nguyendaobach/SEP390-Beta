/**
 * EduVi Document Store
 * ====================
 * 
 * Zustand store for managing the entire document tree.
 * Implements immutable updates for React compatibility.
 * 
 * Store Structure:
 * ----------------
 * - document: The complete document tree (IDocument)
 * - activeCardId: Currently selected card for editing
 * - selectedNodeId: Currently selected node (for highlighting)
 * - isLoading: Loading state for API calls
 * - error: Error state
 * 
 * Actions:
 * --------
 * - loadDocument: Fetch and load document from API
 * - setActiveCard: Change the active slide
 * - addNode: Add a new node to the tree
 * - updateNode: Update an existing node
 * - deleteNode: Remove a node from the tree
 * - moveNode: Reorder nodes (for drag & drop)
 * - updateBlockContent: Update block content (optimized for Tiptap)
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  IDocument,
  ICard,
  ILayout,
  IBlock,
  INode,
  NodeType,
  BlockType,
  BlockContent,
  LayoutVariant,
  IBlockStyles,
  IMaterial,
  WidgetType,
  isCard,
  isLayout,
  isBlock,
} from '@/types';
import {
  createTextBlock,
  createHeadingBlock,
  createImageBlock,
  createLayout,
  createCard,
} from '@/data/mock-data';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get column count for a layout variant
 */
function getColumnCountForVariant(variant: LayoutVariant): number {
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

// ============================================================================
// STORE TYPES
// ============================================================================

interface DocumentState {
  // State
  document: IDocument | null;
  activeCardId: string | null;
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  // Document Actions
  loadDocument: () => Promise<void>;
  setDocument: (doc: IDocument) => void;
  
  // Navigation Actions
  setActiveCard: (cardId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  
  // Node CRUD Actions
  addCard: (title?: string) => void;
  addBlockToCard: (cardId: string, blockType: BlockType) => void;
  addLayoutToCard: (cardId: string, variant: LayoutVariant) => void;
  addBlockToLayout: (layoutId: string, blockType: BlockType) => void;
  
  // Update Actions
  updateNode: (nodeId: string, updates: Partial<INode>) => void;
  updateBlockContent: (blockId: string, content: BlockContent) => void;
  updateBlockStyles: (blockId: string, styles: IBlockStyles) => void;
  updateCardTitle: (cardId: string, title: string) => void;
  
  // Delete Actions
  deleteNode: (nodeId: string) => void;
  
  // Reorder Actions (for drag & drop)
  reorderCards: (activeId: string, overId: string) => void;
  reorderNodesInCard: (cardId: string, activeId: string, overId: string) => void;
  
  // Material/Widget Actions
  dropMaterial: (parentId: string, material: IMaterial, columnIndex?: number, customData?: Record<string, unknown>) => void;
  createWidgetGroup: (cardId: string, variant: LayoutVariant, materials: IMaterial[]) => void;
  wrapBlocksInLayout: (cardId: string, blockIds: string[], variant: LayoutVariant) => void;
  
  // Utility
  getActiveCard: () => ICard | null;
  findNodeById: (nodeId: string) => INode | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Deep clone helper for immutable updates
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Find a node in the tree by ID (recursive)
 */
function findNode(nodes: INode[], nodeId: string): INode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children.length > 0) {
      const found = findNode(node.children as INode[], nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find parent of a node by ID
 */
function findParent(
  nodes: INode[],
  nodeId: string,
  parent: INode | null = null
): { parent: INode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === nodeId) {
      return { parent, index: i };
    }
    if (node.children.length > 0) {
      const found = findParent(node.children as INode[], nodeId, node);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Update a node in the tree immutably
 */
function updateNodeInTree<T extends INode>(
  nodes: T[],
  nodeId: string,
  updater: (node: INode) => INode
): T[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node) as T;
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: updateNodeInTree(node.children as INode[], nodeId, updater),
      } as T;
    }
    return node;
  }) as T[];
}

/**
 * Delete a node from the tree immutably
 */
function deleteNodeFromTree<T extends INode>(nodes: T[], nodeId: string): T[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.children.length > 0) {
        return {
          ...node,
          children: deleteNodeFromTree(node.children as INode[], nodeId),
        } as T;
      }
      return node;
    }) as T[];
}

/**
 * Reorder items in an array
 */
function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}

/**
 * Create a new block based on type
 */
function createBlockByType(blockType: BlockType): IBlock {
  const id = `block-${uuidv4()}`;
  
  switch (blockType) {
    case BlockType.TEXT:
      return createTextBlock(id, '<p>Start typing...</p>');
    case BlockType.HEADING:
      return createHeadingBlock(id, 'New Heading', 2);
    case BlockType.IMAGE:
      return createImageBlock(
        id,
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        'Placeholder image'
      );
    case BlockType.VIDEO:
      return {
        id,
        type: NodeType.BLOCK,
        content: {
          type: BlockType.VIDEO,
          src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
        },
        children: [],
      };
    default:
      return createTextBlock(id, '<p>New block</p>');
  }
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDocumentStore = create<DocumentState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      document: null,
      activeCardId: null,
      selectedNodeId: null,
      isLoading: false,
      error: null,

      // ======================================================================
      // DOCUMENT ACTIONS
      // ======================================================================

      loadDocument: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/project');
          if (!response.ok) {
            throw new Error(`Failed to load document: ${response.statusText}`);
          }
          
          const data: IDocument = await response.json();
          
          set({
            document: data,
            activeCardId: data.activeCardId || data.cards[0]?.id || null,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      setDocument: (doc: IDocument) => {
        set({
          document: doc,
          activeCardId: doc.activeCardId || doc.cards[0]?.id || null,
        });
      },

      // ======================================================================
      // NAVIGATION ACTIONS
      // ======================================================================

      setActiveCard: (cardId: string) => {
        const { document } = get();
        if (!document) return;

        const cardExists = document.cards.some((card) => card.id === cardId);
        if (cardExists) {
          set({
            activeCardId: cardId,
            selectedNodeId: null,
          });
        }
      },

      setSelectedNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },

      // ======================================================================
      // ADD ACTIONS
      // ======================================================================

      addCard: (title?: string) => {
        const { document } = get();
        if (!document) return;

        const newCard = createCard(
          `card-${uuidv4()}`,
          title || `Slide ${document.cards.length + 1}`,
          [createTextBlock(`block-${uuidv4()}`, '<p>New slide content...</p>')]
        );

        set({
          document: {
            ...document,
            cards: [...document.cards, newCard],
            updatedAt: new Date().toISOString(),
          },
          activeCardId: newCard.id,
        });
      },

      addBlockToCard: (cardId: string, blockType: BlockType) => {
        const { document } = get();
        if (!document) return;

        const newBlock = createBlockByType(blockType);

        set({
          document: {
            ...document,
            cards: document.cards.map((card) =>
              card.id === cardId
                ? { ...card, children: [...card.children, newBlock] }
                : card
            ),
            updatedAt: new Date().toISOString(),
          },
          selectedNodeId: newBlock.id,
        });
      },

      addLayoutToCard: (cardId: string, variant: LayoutVariant) => {
        const { document } = get();
        if (!document) return;

        // Create an empty layout - users will drag widgets into columns
        const newLayout = createLayout(
          `layout-${uuidv4()}`,
          variant,
          [], // Empty children - drop zones will show
          4
        );

        set({
          document: {
            ...document,
            cards: document.cards.map((card) =>
              card.id === cardId
                ? { ...card, children: [...card.children, newLayout] }
                : card
            ),
            updatedAt: new Date().toISOString(),
          },
          selectedNodeId: newLayout.id,
        });
      },

      addBlockToLayout: (layoutId: string, blockType: BlockType) => {
        const { document } = get();
        if (!document) return;

        const newBlock = createBlockByType(blockType);

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => ({
              ...card,
              children: updateNodeInTree<ILayout | IBlock>(
                card.children,
                layoutId,
                (node) => {
                  if (isLayout(node)) {
                    return {
                      ...node,
                      children: [...node.children, newBlock],
                    } as ILayout;
                  }
                  return node;
                }
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
          selectedNodeId: newBlock.id,
        });
      },

      // ======================================================================
      // UPDATE ACTIONS
      // ======================================================================

      updateNode: (nodeId: string, updates: Partial<INode>) => {
        const { document } = get();
        if (!document) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => {
              if (card.id === nodeId) {
                return { ...card, ...updates } as ICard;
              }
              return {
                ...card,
                children: updateNodeInTree<ILayout | IBlock>(
                  card.children,
                  nodeId,
                  (node) => ({ ...node, ...updates } as INode)
                ),
              };
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateBlockContent: (blockId: string, content: BlockContent) => {
        const { document } = get();
        if (!document) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => ({
              ...card,
              children: updateNodeInTree<ILayout | IBlock>(
                card.children,
                blockId,
                (node) => {
                  if (isBlock(node)) {
                    return { ...node, content };
                  }
                  return node;
                }
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateCardTitle: (cardId: string, title: string) => {
        const { document } = get();
        if (!document) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) =>
              card.id === cardId ? { ...card, title } : card
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // ======================================================================
      // DELETE ACTIONS
      // ======================================================================

      deleteNode: (nodeId: string) => {
        const { document, activeCardId } = get();
        if (!document) return;

        // Check if deleting a card
        const isCardNode = document.cards.some((card) => card.id === nodeId);
        
        if (isCardNode) {
          // Don't delete if it's the only card
          if (document.cards.length <= 1) return;

          const newCards = document.cards.filter((card) => card.id !== nodeId);
          const newActiveId =
            activeCardId === nodeId ? newCards[0]?.id || null : activeCardId;

          set({
            document: {
              ...document,
              cards: newCards,
              updatedAt: new Date().toISOString(),
            },
            activeCardId: newActiveId,
            selectedNodeId: null,
          });
        } else {
          // Delete node from within cards
          set({
            document: {
              ...document,
              cards: document.cards.map((card) => ({
                ...card,
                children: deleteNodeFromTree<ILayout | IBlock>(
                  card.children,
                  nodeId
                ),
              })),
              updatedAt: new Date().toISOString(),
            },
            selectedNodeId: null,
          });
        }
      },

      // ======================================================================
      // REORDER ACTIONS
      // ======================================================================

      reorderCards: (activeId: string, overId: string) => {
        const { document } = get();
        if (!document || activeId === overId) return;

        const oldIndex = document.cards.findIndex((c) => c.id === activeId);
        const newIndex = document.cards.findIndex((c) => c.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        set({
          document: {
            ...document,
            cards: arrayMove(document.cards, oldIndex, newIndex),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      reorderNodesInCard: (cardId: string, activeId: string, overId: string) => {
        const { document } = get();
        if (!document || activeId === overId) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => {
              if (card.id !== cardId) return card;

              const children = card.children;
              const oldIndex = children.findIndex((n) => n.id === activeId);
              const newIndex = children.findIndex((n) => n.id === overId);

              if (oldIndex === -1 || newIndex === -1) return card;

              return {
                ...card,
                children: arrayMove(children, oldIndex, newIndex),
              };
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // ======================================================================
      // STYLE UPDATE ACTIONS
      // ======================================================================

      updateBlockStyles: (blockId: string, styles: IBlockStyles) => {
        const { document } = get();
        if (!document) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => ({
              ...card,
              children: updateNodeInTree<ILayout | IBlock>(
                card.children,
                blockId,
                (node) => {
                  if (isBlock(node)) {
                    return {
                      ...node,
                      styles: { ...node.styles, ...styles },
                    };
                  }
                  return node;
                }
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // ======================================================================
      // MATERIAL/WIDGET ACTIONS
      // ======================================================================

      /**
       * Drop a material into the document
       * @param parentId - Can be a cardId or layoutId
       * @param material - The material being dropped
       * @param columnIndex - Optional column index for layout drops
       * @param customData - Optional custom data to override defaults
       */
      dropMaterial: (parentId: string, material: IMaterial, columnIndex?: number, customData?: Record<string, unknown>) => {
        const { document } = get();
        if (!document) return;

        // Create a new block with the material content
        const newBlock: IBlock = {
          id: `block-${uuidv4()}`,
          type: NodeType.BLOCK,
          content: {
            type: BlockType.MATERIAL,
            widgetType: material.widgetType,
            data: customData || material.defaultData,
          },
          children: [],
          styles: material.defaultStyles,
          isResizable: true,
        };

        // Check if parentId is a card
        const targetCard = document.cards.find((card) => card.id === parentId);
        
        if (targetCard) {
          // Drop directly into card
          set({
            document: {
              ...document,
              cards: document.cards.map((card) =>
                card.id === parentId
                  ? { ...card, children: [...card.children, newBlock] }
                  : card
              ),
              updatedAt: new Date().toISOString(),
            },
            selectedNodeId: newBlock.id,
          });
          return;
        }

        // Otherwise, try to find a layout with this ID and add to specific column
        set({
          document: {
            ...document,
            cards: document.cards.map((card) => ({
              ...card,
              children: updateNodeInTree<ILayout | IBlock>(
                card.children,
                parentId,
                (node) => {
                  if (isLayout(node)) {
                    // If columnIndex is specified, insert at position to maintain column order
                    if (columnIndex !== undefined) {
                      const columnCount = getColumnCountForVariant(node.variant);
                      // Calculate insert position to place in correct column
                      // Items are distributed: item 0 -> col 0, item 1 -> col 1, item 2 -> col 0, etc.
                      const currentColCounts = Array(columnCount).fill(0);
                      node.children.forEach((_, idx) => {
                        currentColCounts[idx % columnCount]++;
                      });
                      
                      // Find the position where we need to insert to add to the target column
                      // New item should go at: (currentColCounts[columnIndex] * columnCount) + columnIndex
                      let insertPosition = 0;
                      for (let i = 0; i < node.children.length; i++) {
                        if (i % columnCount === columnIndex) {
                          insertPosition = i + columnCount; // After the last item in this column
                        }
                      }
                      // If column is empty, insert at columnIndex position
                      if (currentColCounts[columnIndex] === 0) {
                        insertPosition = columnIndex;
                      } else {
                        insertPosition = Math.min(insertPosition, node.children.length);
                      }
                      
                      const newChildren = [...node.children];
                      newChildren.splice(insertPosition, 0, newBlock);
                      return { ...node, children: newChildren };
                    }
                    
                    return {
                      ...node,
                      children: [...node.children, newBlock],
                    };
                  }
                  return node;
                }
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
          selectedNodeId: newBlock.id,
        });
      },

      /**
       * Create a multi-column layout with widgets
       * Used to group multiple materials side-by-side
       */
      createWidgetGroup: (
        cardId: string,
        variant: LayoutVariant,
        materials: IMaterial[]
      ) => {
        const { document } = get();
        if (!document || materials.length === 0) return;

        // Create blocks for each material
        const blocks: IBlock[] = materials.map((material) => ({
          id: `block-${uuidv4()}`,
          type: NodeType.BLOCK,
          content: {
            type: BlockType.MATERIAL,
            widgetType: material.widgetType,
            data: material.defaultData,
          },
          children: [],
          styles: material.defaultStyles,
          isResizable: true,
        }));

        // Create a layout containing the blocks
        const newLayout: ILayout = {
          id: `layout-${uuidv4()}`,
          type: NodeType.LAYOUT,
          variant,
          gap: 4,
          children: blocks,
        };

        set({
          document: {
            ...document,
            cards: document.cards.map((card) =>
              card.id === cardId
                ? { ...card, children: [...card.children, newLayout] }
                : card
            ),
            updatedAt: new Date().toISOString(),
          },
          selectedNodeId: newLayout.id,
        });
      },

      /**
       * Wrap existing blocks in a layout (for grouping existing widgets)
       */
      wrapBlocksInLayout: (
        cardId: string,
        blockIds: string[],
        variant: LayoutVariant
      ) => {
        const { document } = get();
        if (!document || blockIds.length < 2) return;

        set({
          document: {
            ...document,
            cards: document.cards.map((card) => {
              if (card.id !== cardId) return card;

              // Find blocks to wrap
              const blocksToWrap: (ILayout | IBlock)[] = [];
              const remainingChildren: (ILayout | IBlock)[] = [];

              card.children.forEach((child) => {
                if (blockIds.includes(child.id)) {
                  blocksToWrap.push(child);
                } else {
                  remainingChildren.push(child);
                }
              });

              if (blocksToWrap.length < 2) return card;

              // Create wrapper layout
              const wrapperLayout: ILayout = {
                id: `layout-${uuidv4()}`,
                type: NodeType.LAYOUT,
                variant,
                gap: 4,
                children: blocksToWrap,
              };

              return {
                ...card,
                children: [...remainingChildren, wrapperLayout],
              };
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // ======================================================================
      // UTILITY METHODS
      // ======================================================================

      getActiveCard: () => {
        const { document, activeCardId } = get();
        if (!document || !activeCardId) return null;
        return document.cards.find((card) => card.id === activeCardId) || null;
      },

      findNodeById: (nodeId: string) => {
        const { document } = get();
        if (!document) return null;

        // Check cards first
        const card = document.cards.find((c) => c.id === nodeId);
        if (card) return card;

        // Search within cards
        for (const cardItem of document.cards) {
          const found = findNode(cardItem.children as INode[], nodeId);
          if (found) return found;
        }

        return null;
      },
    })),
    {
      name: 'eduvi-document-store',
    }
  )
);

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

export const selectDocument = (state: DocumentState) => state.document;
export const selectActiveCardId = (state: DocumentState) => state.activeCardId;
export const selectSelectedNodeId = (state: DocumentState) => state.selectedNodeId;
export const selectIsLoading = (state: DocumentState) => state.isLoading;
export const selectError = (state: DocumentState) => state.error;
export const selectCards = (state: DocumentState) => state.document?.cards || [];

export default useDocumentStore;
