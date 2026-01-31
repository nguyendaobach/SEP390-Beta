'use client';

/**
 * Chart Widget
 * ============
 * 
 * Displays various chart types (bar, line, pie).
 * Uses a simple canvas-based visualization for demo purposes.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { BarChart3 } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartData {
  title?: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartDataPoint[];
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function ChartWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const chartData = data as unknown as ChartData;
  const maxValue = Math.max(...(chartData.data?.map((d) => d.value) || [0]));
  const total = chartData.data?.reduce((sum, d) => sum + d.value, 0) || 0;

  if (!chartData.data || chartData.data.length === 0) {
    return (
      <div
        className={cn(
          'p-6 bg-gray-100 rounded-lg text-center',
          isSelected && 'ring-2 ring-primary-500 ring-offset-2'
        )}
        style={styles}
        onClick={onSelect}
      >
        <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border shadow-sm p-4',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={styles}
      onClick={onSelect}
    >
      {/* Title */}
      {chartData.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {chartData.title}
        </h3>
      )}

      {/* Bar Chart */}
      {(chartData.type === 'bar' || !chartData.type) && (
        <div className="space-y-3">
          {chartData.data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-20 text-sm text-gray-600 truncate">{item.label}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                  }}
                >
                  <span className="text-xs font-medium text-white">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pie / Doughnut Chart */}
      {(chartData.type === 'pie' || chartData.type === 'doughnut') && (
        <div className="flex items-center gap-6">
          {/* SVG Pie Chart */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {chartData.data.reduce<{ offset: number; elements: React.ReactNode[] }>(
                (acc, item, index) => {
                  const percentage = (item.value / total) * 100;
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
                  const strokeDashoffset = -(acc.offset * circumference) / 100;

                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      strokeWidth={chartData.type === 'doughnut' ? '15' : '40'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );

                  acc.offset += percentage;
                  return acc;
                },
                { offset: 0, elements: [] }
              ).elements}
            </svg>
            {chartData.type === 'doughnut' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">{total}</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {chartData.data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                  }}
                />
                <span className="text-sm text-gray-600 truncate">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 ml-auto">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Line Chart (simplified) */}
      {chartData.type === 'line' && (
        <div className="relative h-40">
          <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={50 - y / 2}
                x2="100"
                y2={50 - y / 2}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            ))}

            {/* Line path */}
            <polyline
              fill="none"
              stroke={DEFAULT_COLORS[0]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartData.data
                .map((item, index) => {
                  const x = (index / (chartData.data.length - 1)) * 100;
                  const y = 50 - (item.value / maxValue) * 45;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Data points */}
            {chartData.data.map((item, index) => {
              const x = (index / (chartData.data.length - 1)) * 100;
              const y = 50 - (item.value / maxValue) * 45;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="white"
                  stroke={DEFAULT_COLORS[0]}
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2">
            {chartData.data.map((item, index) => (
              <span key={index} className="text-xs text-gray-500 truncate max-w-[60px]">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartWidget;
