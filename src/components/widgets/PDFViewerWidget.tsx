'use client';

/**
 * PDF Viewer Widget
 * =================
 * 
 * Displays PDF documents with basic navigation.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { WidgetProps } from './WidgetRegistry';
import { FileText, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';

interface PDFData {
  src: string;
  title?: string;
  totalPages?: number;
}

export function PDFViewerWidget({ id, data, styles, isSelected, onSelect }: WidgetProps) {
  const pdfData = data as unknown as PDFData;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = pdfData.totalPages || 1;

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      style={styles}
      onClick={onSelect}
    >
      {/* PDF Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {pdfData.title || 'PDF Document'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={pdfData.src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-700 rounded"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={pdfData.src}
            download
            className="p-1 hover:bg-gray-700 rounded"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="relative aspect-[3/4] bg-white flex items-center justify-center">
        {/* In production, use react-pdf or similar */}
        <iframe
          src={`${pdfData.src}#page=${currentPage}`}
          className="w-full h-full border-0"
          title={pdfData.title || 'PDF Viewer'}
        />
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 px-4 py-2 bg-gray-100 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PDFViewerWidget;
