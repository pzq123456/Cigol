'use client';

import React, { useState, useEffect } from 'react';
import { ExportModalProps } from '../../types/components';
import { ExportOptions, ExportFormat, ExportResolution, ExportProgress } from '../../types/export';

/**
 * ExportModal component for configuring and initiating image exports
 */
export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  exportProgress = 0,
  className = ''
}: ExportModalProps) {
  // Form state
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution, setResolution] = useState<ExportResolution>(2);
  const [quality, setQuality] = useState(90);
  const [transparent, setTransparent] = useState(true);
  const [filename, setFilename] = useState('code-snippet');
  
  // Progress state
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormat('png');
      setResolution(2);
      setQuality(90);
      setTransparent(true);
      setFilename('code-snippet');
      setProgress(null);
      setShowAdvanced(false);
    }
  }, [isOpen]);

  // Handle export
  const handleExport = () => {
    const options: ExportOptions = {
      format,
      resolution,
      quality,
      transparent: format === 'png' ? transparent : false,
      filename: `${filename}.${format}`
    };
    
    onExport(options);
  };

  // Handle format change
  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    // Reset transparent for JPEG
    if (newFormat === 'jpeg') {
      setTransparent(false);
    }
  };

  // Generate filename with timestamp
  const generateFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    setFilename(`code-snippet-${timestamp}`);
  };

  // Close modal
  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isExporting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Export Image
          </h2>
          {!isExporting && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress?.message || 'Exporting...'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(exportProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              {progress?.stage && (
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  Stage: {progress.stage}
                </div>
              )}
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleFormatChange('png')}
                disabled={isExporting}
                className={`p-3 rounded-lg border-2 transition-all ${
                  format === 'png'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-sm font-medium">PNG</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lossless, supports transparency
                </div>
              </button>
              <button
                onClick={() => handleFormatChange('jpeg')}
                disabled={isExporting}
                className={`p-3 rounded-lg border-2 transition-all ${
                  format === 'jpeg'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-sm font-medium">JPEG</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Smaller file size
                </div>
              </button>
            </div>
          </div>

          {/* Resolution Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([1, 2, 3] as ExportResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  disabled={isExporting}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    resolution === res
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-sm font-medium">{res}x</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {res === 1 ? 'Standard' : res === 2 ? 'High' : 'Ultra'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <label htmlFor="filename-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filename
            </label>
            <div className="flex space-x-2">
              <input
                id="filename-input"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isExporting}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter filename"
              />
              <button
                onClick={generateFilename}
                disabled={isExporting}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate timestamp filename"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 4v4m4-8h4m-4 0H8" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              File will be saved as: {filename}.{format}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isExporting}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Advanced Options</span>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* JPEG Quality */}
              {format === 'jpeg' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={isExporting}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}

              {/* PNG Transparency */}
              {format === 'png' && (
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="transparent"
                    checked={transparent}
                    onChange={(e) => setTransparent(e.target.checked)}
                    disabled={isExporting}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label 
                    htmlFor="transparent" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Transparent background
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}