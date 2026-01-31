'use client';

/**
 * TextBlock Component
 * ===================
 * 
 * Rich text editor block using Tiptap.
 * Implements the "Gamma Reflow" logic - content expands naturally
 * and pushes siblings down using standard CSS flow.
 * 
 * Features:
 * - Rich text editing (bold, italic, lists, etc.)
 * - Auto-growing height (no fixed height)
 * - Placeholder text for empty blocks
 * - Content sync with Zustand store
 */

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/store';
import { BlockType, ITextContent } from '@/types';

interface TextBlockProps {
  id: string;
  content: ITextContent;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function TextBlock({
  id,
  content,
  isSelected = false,
  onSelect,
}: TextBlockProps) {
  const updateBlockContent = useDocumentStore((state) => state.updateBlockContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content.html,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose max-w-none',
          'focus:outline-none',
          'min-h-[1.5em]', // Minimum height for empty state
          // Prose customizations
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-headings:font-semibold prose-headings:text-gray-900',
          'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:my-0',
          'prose-strong:font-semibold',
          'prose-em:italic'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      // Sync content to store on every update
      const html = editor.getHTML();
      updateBlockContent(id, {
        type: BlockType.TEXT,
        html,
      });
    },
    onFocus: () => {
      onSelect?.();
    },
  });

  // Update editor content when prop changes (e.g., undo/redo)
  useEffect(() => {
    if (editor && content.html !== editor.getHTML()) {
      editor.commands.setContent(content.html, false);
    }
  }, [editor, content.html]);

  return (
    <div
      className={cn(
        'relative group',
        'transition-all duration-200',
        // Selection state
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 rounded-lg'
      )}
      onClick={onSelect}
    >
      <EditorContent
        editor={editor}
        className={cn(
          'w-full',
          'px-3 py-2',
          'rounded-lg',
          'bg-white',
          'hover:bg-gray-50/50',
          'transition-colors duration-150'
        )}
      />
      
      {/* Formatting toolbar hint */}
      {isSelected && editor && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-white shadow-md rounded-md px-2 py-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'px-2 py-1 rounded hover:bg-gray-100',
              editor.isActive('bold') && 'bg-gray-200'
            )}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'px-2 py-1 rounded hover:bg-gray-100 italic',
              editor.isActive('italic') && 'bg-gray-200'
            )}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'px-2 py-1 rounded hover:bg-gray-100',
              editor.isActive('bulletList') && 'bg-gray-200'
            )}
          >
            •
          </button>
        </div>
      )}
    </div>
  );
}

export default TextBlock;
