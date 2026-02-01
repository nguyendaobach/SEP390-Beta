'use client';

/**
 * Interactive Widget Registry
 * ===========================
 * 
 * Registry for interactive learning widgets in EDIT MODE (Creator Tool).
 * These components provide forms/editors for creating learning content.
 * 
 * The Viewer (Flutter App) will consume the exported .eduvi data,
 * so this registry is focused on the CREATOR experience.
 * 
 * Widget Types:
 * - QUIZ: Multiple choice questions editor
 * - FLASHCARD: Front/back card editor
 * - FILL_BLANK: Sentence with bracketed blanks editor
 */

import React from 'react';
import { BlockType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface InteractiveWidgetProps {
  id: string;
  data: Record<string, unknown>;
  isSelected?: boolean;
  onUpdate: (data: Record<string, unknown>) => void;
}

export type InteractiveWidgetComponent = React.ComponentType<InteractiveWidgetProps>;

// ============================================================================
// REGISTRY CLASS
// ============================================================================

class InteractiveWidgetRegistryClass {
  private registry: Map<BlockType | string, InteractiveWidgetComponent> = new Map();

  /**
   * Register an interactive widget component
   */
  register(type: BlockType | string, component: InteractiveWidgetComponent): void {
    this.registry.set(type, component);
  }

  /**
   * Get a widget component by type
   */
  get(type: BlockType | string): InteractiveWidgetComponent | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a type is registered
   */
  has(type: BlockType | string): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered types
   */
  getRegisteredTypes(): (BlockType | string)[] {
    return Array.from(this.registry.keys());
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const InteractiveWidgetRegistry = new InteractiveWidgetRegistryClass();

// ============================================================================
// FALLBACK WIDGET
// ============================================================================

export function UnknownInteractiveWidget({ id, data }: InteractiveWidgetProps) {
  return (
    <div className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg text-center">
      <p className="text-sm font-medium text-yellow-700">Unknown Interactive Widget</p>
      <p className="text-xs text-yellow-600 mt-1">ID: {id}</p>
    </div>
  );
}

// ============================================================================
// RENDER HELPER
// ============================================================================

export function renderInteractiveWidget(
  type: BlockType | string,
  props: InteractiveWidgetProps
): React.ReactElement {
  const Component = InteractiveWidgetRegistry.get(type);
  
  if (Component) {
    return <Component {...props} />;
  }
  
  return <UnknownInteractiveWidget {...props} />;
}

export default InteractiveWidgetRegistry;
