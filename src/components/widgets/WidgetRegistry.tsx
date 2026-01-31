'use client';

/**
 * Widget Registry
 * ===============
 * 
 * Central registry for mapping widget types to their React components.
 * This pattern allows easy extension of material types without modifying
 * the core renderer logic.
 * 
 * Usage:
 * ------
 * const Component = WidgetRegistry.get('MATERIAL_PDF');
 * if (Component) {
 *   return <Component data={data} styles={styles} />;
 * }
 * 
 * Adding New Widgets:
 * -------------------
 * 1. Create the widget component in /components/widgets/
 * 2. Add the WidgetType enum value in types/nodes.ts
 * 3. Register it here: WidgetRegistry.register('WIDGET_TYPE', Component)
 */

import React from 'react';
import { WidgetType, IBlockStyles } from '@/types';

// ============================================================================
// WIDGET PROPS INTERFACE
// ============================================================================

/**
 * Common props interface for all widget components
 */
export interface WidgetProps {
  id: string;
  data: Record<string, unknown>;
  styles?: IBlockStyles;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Widget component type definition
 */
export type WidgetComponent = React.ComponentType<WidgetProps>;

// ============================================================================
// WIDGET REGISTRY CLASS
// ============================================================================

class WidgetRegistryClass {
  private registry: Map<WidgetType | string, WidgetComponent> = new Map();

  /**
   * Register a widget component for a given type
   */
  register(type: WidgetType | string, component: WidgetComponent): void {
    this.registry.set(type, component);
  }

  /**
   * Get a widget component by type
   */
  get(type: WidgetType | string): WidgetComponent | undefined {
    return this.registry.get(type);
  }

  /**
   * Check if a widget type is registered
   */
  has(type: WidgetType | string): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered widget types
   */
  getRegisteredTypes(): (WidgetType | string)[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Unregister a widget type
   */
  unregister(type: WidgetType | string): boolean {
    return this.registry.delete(type);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const WidgetRegistry = new WidgetRegistryClass();

// ============================================================================
// FALLBACK WIDGET
// ============================================================================

/**
 * Fallback widget shown when a widget type is not registered
 */
export function UnknownWidget({ id, data }: WidgetProps) {
  return (
    <div className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg text-center">
      <div className="text-yellow-600 mb-2">
        <svg
          className="w-10 h-10 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-yellow-700">Unknown Widget Type</p>
      <p className="text-xs text-yellow-600 mt-1">
        Widget ID: {id}
      </p>
    </div>
  );
}

// ============================================================================
// RENDER HELPER
// ============================================================================

/**
 * Helper function to render a widget by type
 * Returns the appropriate component or fallback
 */
export function renderWidget(
  type: WidgetType | string,
  data: Record<string, unknown>,
  options?: {
    id?: string;
    styles?: IBlockStyles;
    isSelected?: boolean;
    onSelect?: () => void;
  }
): React.ReactElement {
  const Component = WidgetRegistry.get(type);
  const props: WidgetProps = {
    id: options?.id ?? `widget-${Date.now()}`,
    data,
    styles: options?.styles,
    isSelected: options?.isSelected,
    onSelect: options?.onSelect,
  };
  
  if (Component) {
    return <Component {...props} />;
  }
  
  return <UnknownWidget {...props} />;
}

export default WidgetRegistry;
