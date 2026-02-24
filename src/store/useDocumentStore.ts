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
// APP MODE
// ============================================================================

export type AppMode = 'EDITOR' | 'PRESENT';

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
  
  // History for undo/redo
  history: IDocument[];
  historyIndex: number;
  
  // Online users
  onlineUsers: Array<{ id: string; name: string; avatar: string; color: string }>;
  
  // App Mode State
  appMode: AppMode;
  presentationSlideIndex: number;

  // Document Actions
  loadDocument: () => Promise<void>;
  setDocument: (doc: IDocument) => void;
  
  // Undo/Redo Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Online Users Actions
  setOnlineUsers: (users: Array<{ id: string; name: string; avatar: string; color: string }>) => void;
  
  // App Mode Actions
  setAppMode: (mode: AppMode) => void;
  startPresentation: () => void;
  exitPresentation: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  
  // Navigation Actions
  setActiveCard: (cardId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  
  // Node CRUD Actions
  addCard: (title?: string) => void;
  addCardFromTemplate: (templateType: string) => void;
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
  reorderNodesInLayout: (cardId: string, layoutId: string, activeId: string, overId: string) => void;
  
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
    subscribeWithSelector((set, get) => {
      // Helper function to update document with history tracking
      const setDocumentWithHistory = (newDoc: IDocument, otherUpdates: Partial<Omit<DocumentState, 'document' | 'history' | 'historyIndex'>> = {}) => {
        const { document: currentDoc, history, historyIndex } = get();
        
        // Remove any future history if we're not at the end (for redo support)
        const newHistory = history.slice(0, historyIndex + 1);
        
        // Add CURRENT document to history ONLY if it's different from the NEW document
        if (currentDoc) {
          const currentDocJson = JSON.stringify(currentDoc);
          const newDocJson = JSON.stringify(newDoc);
          
          // Only add to history if the document has actually changed
          if (currentDocJson !== newDocJson) {
            newHistory.push(deepClone(currentDoc));
          }
        }
        
        // Limit history to 50 items
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        set({
          document: newDoc,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          ...otherUpdates,
        });
      };

      return {
      // Initial State
      document: null,
      activeCardId: null,
      selectedNodeId: null,
      isLoading: false,
      error: null,
      
      // History State
      history: [],
      historyIndex: -1,
      
      // Online Users State (mock data)
      onlineUsers: [
        { id: '1', name: 'You', avatar: 'P', color: 'bg-purple-500' },
        { id: '2', name: 'User 2', avatar: 'A', color: 'bg-blue-500' },
        { id: '3', name: 'User 3', avatar: 'B', color: 'bg-green-500' },
        { id: '4', name: 'User 4', avatar: 'C', color: 'bg-yellow-500' },
        { id: '5', name: 'User 5', avatar: 'D', color: 'bg-red-500' },
      ],
      
      // App Mode State
      appMode: 'EDITOR' as AppMode,
      presentationSlideIndex: 0,

      // ======================================================================
      // APP MODE ACTIONS
      // ======================================================================

      setAppMode: (mode: AppMode) => {
        set({ appMode: mode });
      },

      startPresentation: () => {
        const { document, activeCardId } = get();
        if (!document) return;

        // Find current slide index
        const slideIndex = activeCardId 
          ? document.cards.findIndex((c) => c.id === activeCardId)
          : 0;

        set({
          appMode: 'PRESENT',
          presentationSlideIndex: Math.max(0, slideIndex),
          selectedNodeId: null,
        });
      },

      exitPresentation: () => {
        const { document, presentationSlideIndex } = get();
        if (!document) return;

        // Set active card to the current slide
        const currentCard = document.cards[presentationSlideIndex];
        set({
          appMode: 'EDITOR',
          activeCardId: currentCard?.id || document.cards[0]?.id || null,
        });
      },

      nextSlide: () => {
        const { document, presentationSlideIndex } = get();
        if (!document) return;

        const maxIndex = document.cards.length - 1;
        if (presentationSlideIndex < maxIndex) {
          set({ presentationSlideIndex: presentationSlideIndex + 1 });
        }
      },

      previousSlide: () => {
        const { presentationSlideIndex } = get();
        if (presentationSlideIndex > 0) {
          set({ presentationSlideIndex: presentationSlideIndex - 1 });
        }
      },

      goToSlide: (index: number) => {
        const { document } = get();
        if (!document) return;

        const clampedIndex = Math.max(0, Math.min(index, document.cards.length - 1));
        set({ presentationSlideIndex: clampedIndex });
      },

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
          
          // Initialize history with the loaded document
          const newHistory = [deepClone(data)];
          
          set({
            document: data,
            activeCardId: data.activeCardId || data.cards[0]?.id || null,
            history: newHistory,
            historyIndex: 0,
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
        // Initialize history with the document
        const newHistory = [deepClone(doc)];
        
        set({
          document: doc,
          activeCardId: doc.activeCardId || doc.cards[0]?.id || null,
          history: newHistory,
          historyIndex: 0,
        });
      },

      // ======================================================================
      // UNDO/REDO ACTIONS
      // ======================================================================

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            document: deepClone(history[newIndex]),
            historyIndex: newIndex,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            document: deepClone(history[newIndex]),
            historyIndex: newIndex,
          });
        }
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      // ======================================================================
      // ONLINE USERS ACTIONS
      // ======================================================================

      setOnlineUsers: (users) => {
        set({ onlineUsers: users });
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

        const newDoc = {
          ...document,
          cards: [...document.cards, newCard],
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc, {
          activeCardId: newCard.id,
        });
      },

      addCardFromTemplate: (templateType: string) => {
        const { document } = get();
        if (!document) return;

        const cardId = `card-${uuidv4()}`;
        let cardChildren: (ILayout | IBlock)[] = [];

        // Template 1: Image left, Text right
        if (templateType === 'image-text-left') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.TWO_COLUMN,
              gap: 6,
              children: [
                createImageBlock(`block-${uuidv4()}`, 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop', 'Slide image'),
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
                    createTextBlock(`block-${uuidv4()}`, '<p>Add your description here...</p>'),
                  ],
                },
              ],
            } as ILayout,
          ];
        }
        // Template 2: Text left, Image right
        else if (templateType === 'text-image-right') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.TWO_COLUMN,
              gap: 6,
              children: [
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
                    createTextBlock(`block-${uuidv4()}`, '<p>Add your description here...</p>'),
                  ],
                },
                createImageBlock(`block-${uuidv4()}`, 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop', 'Slide image'),
              ],
            } as ILayout,
          ];
        }
        // Template 3: Two columns text
        else if (templateType === 'two-columns') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.TWO_COLUMN,
              gap: 6,
              children: [
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column 1 content...</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column 2 content...</p>'),
                  ],
                },
              ],
            } as ILayout,
          ];
        }
        // Template 4: Two columns text (alternative)
        else if (templateType === 'two-columns-alt') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.TWO_COLUMN,
              gap: 6,
              children: [
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column A content...</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column B content...</p>'),
                  ],
                },
              ],
            } as ILayout,
          ];
        }
        // Template 5: Three columns
        else if (templateType === 'three-columns') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.THREE_COLUMN,
              gap: 6,
              children: [
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column 1...</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column 2...</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Column 3...</p>'),
                  ],
                },
              ],
            } as ILayout,
          ];
        }
        // Template 6: Three columns (alternative)
        else if (templateType === 'three-columns-alt') {
          const layoutId = `layout-${uuidv4()}`;
          cardChildren = [
            createHeadingBlock(`block-${uuidv4()}`, 'Slide Title', 2),
            {
              id: layoutId,
              type: NodeType.LAYOUT,
              variant: LayoutVariant.THREE_COLUMN,
              gap: 6,
              children: [
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Point A</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Point B</p>'),
                  ],
                },
                {
                  id: `layout-${uuidv4()}`,
                  type: NodeType.LAYOUT,
                  variant: LayoutVariant.SINGLE,
                  gap: 4,
                  children: [
                    createTextBlock(`block-${uuidv4()}`, '<p>Point C</p>'),
                  ],
                },
              ],
            } as ILayout,
          ];
        }

        const newCard = createCard(
          cardId,
          `Slide ${document.cards.length + 1}`,
          cardChildren
        );

        const newDoc = {
          ...document,
          cards: [...document.cards, newCard],
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc, {
          activeCardId: newCard.id,
        });
      },

      addBlockToCard: (cardId: string, blockType: BlockType) => {
        const { document } = get();
        if (!document) return;

        const newBlock = createBlockByType(blockType);

        const newDoc = {
          ...document,
          cards: document.cards.map((card) =>
            card.id === cardId
              ? { ...card, children: [...card.children, newBlock] }
              : card
          ),
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc, {
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

        const newDoc = {
          ...document,
          cards: document.cards.map((card) =>
            card.id === cardId
              ? { ...card, children: [...card.children, newLayout] }
              : card
          ),
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc, {
          selectedNodeId: newLayout.id,
        });
      },

      addBlockToLayout: (layoutId: string, blockType: BlockType) => {
        const { document } = get();
        if (!document) return;

        const newBlock = createBlockByType(blockType);

        const newDoc = {
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
        };

        setDocumentWithHistory(newDoc, {
          selectedNodeId: newBlock.id,
        });
      },

      // ======================================================================
      // UPDATE ACTIONS
      // ======================================================================

      updateNode: (nodeId: string, updates: Partial<INode>) => {
        const { document } = get();
        if (!document) return;

        const newDoc = {
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
        };

        setDocumentWithHistory(newDoc);
      },

      updateBlockContent: (blockId: string, content: BlockContent) => {
        const { document } = get();
        if (!document) return;

        const newDoc = {
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
        };

        setDocumentWithHistory(newDoc);
      },

      updateCardTitle: (cardId: string, title: string) => {
        const { document } = get();
        if (!document) return;

        const newDoc = {
          ...document,
          cards: document.cards.map((card) =>
            card.id === cardId ? { ...card, title } : card
          ),
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc);
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

          const newDoc = {
            ...document,
            cards: newCards,
            updatedAt: new Date().toISOString(),
          };

          setDocumentWithHistory(newDoc, {
            activeCardId: newActiveId,
            selectedNodeId: null,
          });
        } else {
          // Delete node from within cards
          const newDoc = {
            ...document,
            cards: document.cards.map((card) => ({
              ...card,
              children: deleteNodeFromTree<ILayout | IBlock>(
                card.children,
                nodeId
              ),
            })),
            updatedAt: new Date().toISOString(),
          };

          setDocumentWithHistory(newDoc, {
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

        const newDoc = {
          ...document,
          cards: arrayMove(document.cards, oldIndex, newIndex),
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc);
      },

      reorderNodesInCard: (cardId: string, activeId: string, overId: string) => {
        const { document } = get();
        if (!document || activeId === overId) return;

        const newDoc = {
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
        };

        setDocumentWithHistory(newDoc);
      },

      reorderNodesInLayout: (cardId: string, layoutId: string, activeId: string, overId: string) => {
        const { document } = get();
        if (!document || activeId === overId) return;

        const newDoc = {
          ...document,
          cards: document.cards.map((card) => {
            if (card.id !== cardId) return card;

            return {
              ...card,
              children: updateNodeInTree<ILayout | IBlock>(
                card.children,
                layoutId,
                (layout) => {
                  // Only layouts can have children
                  if (!('children' in layout)) return layout;
                  
                  const children = layout.children;
                  const oldIndex = children.findIndex((n) => n.id === activeId);
                  const newIndex = children.findIndex((n) => n.id === overId);

                  if (oldIndex === -1 || newIndex === -1) return layout;

                  // Return layout with reordered children
                  return {
                    ...layout,
                    children: arrayMove(children, oldIndex, newIndex),
                  } as ILayout;
                }
              ),
            };
          }),
          updatedAt: new Date().toISOString(),
        };

        setDocumentWithHistory(newDoc);
      },

      // ======================================================================
      // STYLE UPDATE ACTIONS
      // ======================================================================

      updateBlockStyles: (blockId: string, styles: IBlockStyles) => {
        const { document } = get();
        if (!document) return;

        const newDoc = {
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
        };

        setDocumentWithHistory(newDoc);
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
          const newDoc = {
            ...document,
            cards: document.cards.map((card) =>
              card.id === parentId
                ? { ...card, children: [...card.children, newBlock] }
                : card
            ),
            updatedAt: new Date().toISOString(),
          };
          
          setDocumentWithHistory(newDoc, {
            selectedNodeId: newBlock.id,
          });
          return;
        }

        // Otherwise, try to find a layout with this ID and add to specific column
        const newDoc = {
          ...document,
          cards: document.cards.map((card) => ({
            ...card,
            children: updateNodeInTree<ILayout | IBlock>(
              card.children,
              parentId,
              (node) => {
                if (isLayout(node)) {
                  // Check if children are nested layouts (one layout per column)
                  const childrenAreLayouts = node.children.every(child => isLayout(child));
                  
                  // If columnIndex is specified and children are nested layouts
                  if (columnIndex !== undefined && childrenAreLayouts) {
                    // Add block to the specific nested layout (column)
                    const targetColumn = node.children[columnIndex] as ILayout;
                    if (targetColumn) {
                      const updatedChildren = [...node.children];
                      updatedChildren[columnIndex] = {
                        ...targetColumn,
                        children: [...targetColumn.children, newBlock],
                      };
                      return { ...node, children: updatedChildren };
                    }
                  }
                  
                  // If columnIndex is specified but children are blocks (old distribution logic)
                  if (columnIndex !== undefined && !childrenAreLayouts) {
                    const columnCount = getColumnCountForVariant(node.variant);
                    // Calculate insert position to place in correct column
                    const currentColCounts = Array(columnCount).fill(0);
                    node.children.forEach((_, idx) => {
                      currentColCounts[idx % columnCount]++;
                    });
                    
                    let insertPosition = 0;
                    for (let i = 0; i < node.children.length; i++) {
                      if (i % columnCount === columnIndex) {
                        insertPosition = i + columnCount;
                      }
                    }
                    if (currentColCounts[columnIndex] === 0) {
                      insertPosition = columnIndex;
                    } else {
                      insertPosition = Math.min(insertPosition, node.children.length);
                    }
                    
                    const newChildren = [...node.children];
                    newChildren.splice(insertPosition, 0, newBlock);
                    return { ...node, children: newChildren };
                  }
                  
                  // Default: add to end
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
        };
        
        setDocumentWithHistory(newDoc, {
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

        const newDoc = {
          ...document,
          cards: document.cards.map((card) =>
            card.id === cardId
              ? { ...card, children: [...card.children, newLayout] }
              : card
          ),
          updatedAt: new Date().toISOString(),
        };
        
        setDocumentWithHistory(newDoc, {
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

        const newDoc = {
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
        };
        
        setDocumentWithHistory(newDoc);
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
    };
    }),
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
