// src/components/ExportPanel.tsx
import React from 'react';
import { ExportFormat, ExportResolution } from '@/types/export';

// 定义所有导出选项的组合
const exportOptions = [
  {
    format: 'png',
    label: 'PNG',
    resolutions: [1, 2, 3],
    description: 'Lossless, supports transparency',
  },
  {
    format: 'jpeg',
    label: 'JPEG',
    resolutions: [1, 2, 3],
    description: 'Smaller file size, no transparency',
  },
];

interface ExportPanelProps {
  onExport: (format: ExportFormat, resolution: ExportResolution) => void;
  disabled: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport, disabled }) => {
  return (
    <div className="space-y-6">
      {exportOptions.map((optionGroup) => (
        <div key={optionGroup.format} className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Export as {optionGroup.label}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {optionGroup.resolutions.map((res) => (
              <button
                key={`${optionGroup.format}-${res}`}
                onClick={() => onExport(optionGroup.format as ExportFormat, res as ExportResolution)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg border-2 transition-colors duration-200
                  border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="text-sm font-medium">{optionGroup.label} ({res}x)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {res === 1 ? 'Standard' : res === 2 ? 'High' : 'Ultra'}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            • {optionGroup.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ExportPanel;