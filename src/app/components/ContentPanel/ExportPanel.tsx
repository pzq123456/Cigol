// src/components/ExportPanel.tsx
import React from 'react';
import { ExportFormat, ExportResolution } from '@/types/export';

interface ExportPanelProps {
  onExport: (format: ExportFormat, resolution: ExportResolution) => void;
  disabled: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport, disabled }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onExport('png', 1)}
          disabled={disabled}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          PNG (1x)
        </button>
        <button
          onClick={() => onExport('png', 2)}
          disabled={disabled}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          PNG (2x)
        </button>
        <button
          onClick={() => onExport('png', 3)}
          disabled={disabled}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          PNG (3x)
        </button>
        <button
          onClick={() => onExport('jpeg', 2)}
          disabled={disabled}
          className={`
            px-4 py-3 text-sm font-medium rounded-lg border transition-colors duration-200
            border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          JPEG (2x)
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• PNG format supports transparency</p>
        <p>• Higher resolution (2x, 3x) for better quality on high-DPI displays</p>
        <p>• JPEG format has smaller file size but no transparency</p>
      </div>
    </div>
  );
};

export default ExportPanel;