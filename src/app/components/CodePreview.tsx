'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CodePreviewProps } from '../../types/components';
import { createHighlightService } from '../../services/highlight';
import { WindowStyle } from '../../types/theme';

/**
 * A marker to identify this component for homepage rendering.
 * @type {string}
 */
// const data-export-targt = 'data-export-target';

/**
 * Window controls component for different OS styles
 */
const WindowControls: React.FC<{ style: WindowStyle; className?: string }> = React.memo(({
  style,
  className = ''
}) => {
  if (style === 'none') return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`} role="presentation" aria-label="Window controls">
      {style === 'macos' && (
        <>
          <div
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
            title="Close"
            role="button"
            tabIndex={-1}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer"
            title="Minimize"
            role="button"
            tabIndex={-1}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
            title="Maximize"
            role="button"
            tabIndex={-1}
          ></div>
        </>
      )}
      {style === 'windows' && (
        <>
          <div
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Minimize"
            role="button"
            tabIndex={-1}
          >
            <div className="w-2 h-0.5 bg-gray-600 dark:bg-gray-400"></div>
          </div>
          <div
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Maximize"
            role="button"
            tabIndex={-1}
          >
            <div className="w-2 h-2 border border-gray-600 dark:border-gray-400"></div>
          </div>
          <div
            className="w-4 h-4 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
            title="Close"
            role="button"
            tabIndex={-1}
          >
            <div className="w-2 h-2 relative">
              <div className="absolute inset-0 border border-gray-600 dark:border-gray-400"></div>
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border border-gray-600 dark:border-gray-400"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

WindowControls.displayName = 'WindowControls';

/**
 * Window header component with title and controls
 */
const WindowHeader: React.FC<{
  title?: string;
  filename?: string;
  windowStyle: WindowStyle;
  showControls: boolean;
  backgroundColor: string;
}> = React.memo(({ title, filename, windowStyle, showControls, backgroundColor }) => {
  if (!showControls && !title && !filename) return null;

  return (
    <header
      className="flex items-center justify-between px-4 py-3 border-b border-opacity-20 border-gray-500 select-none"
      style={{ backgroundColor }}
      role="banner"
      aria-label="Code preview header"
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {showControls && <WindowControls style={windowStyle} />}
        <div className="flex flex-col min-w-0 flex-1">
          {title && (
            <div
              className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate"
              title={title}
              aria-label={`Code title: ${title}`}
            >
              {title}
            </div>
          )}
          {filename && (
            <div
              className="text-xs text-gray-500 dark:text-gray-400 truncate"
              title={filename}
              aria-label={`Filename: ${filename}`}
            >
              {filename}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-friendly spacing */}
      <div className="flex-shrink-0 ml-2 sm:ml-4">
        {/* Reserved space for future actions */}
      </div>
    </header>
  );
});

WindowHeader.displayName = 'WindowHeader';

/**
 * Line numbers component
 */
const LineNumbers: React.FC<{
  code: string;
  fontSize: number;
  lineHeight: number;
  theme: any;
}> = React.memo(({ code, fontSize, lineHeight, theme }) => {
  const lines = useMemo(() => code.split('\n'), [code]);
  const lineNumberWidth = useMemo(() => Math.max(2, lines.length.toString().length), [lines.length]);

  return (
    <div
      className="flex flex-col text-right pr-2 sm:pr-4 py-4 border-r border-opacity-20 border-gray-500 select-none flex-shrink-0"
      style={{
        fontSize: `${fontSize}px`, // Use the same font size as the code content
        lineHeight: lineHeight,
        color: theme.colors.comment,
        minWidth: `${lineNumberWidth * 0.6 + 0.5}rem`
      }}
      role="presentation"
      aria-label="Line numbers"
    >
      {lines.map((_, index) => (
        <span
          key={index + 1}
          className="font-mono leading-none"
          style={{ lineHeight: lineHeight }} // Ensure line height consistency
          aria-hidden="true"
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
});

LineNumbers.displayName = 'LineNumbers';

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC<{ settings: any }> = ({ settings }) => (
  <div
    className="rounded-lg overflow-hidden animate-pulse"
    style={{
      backgroundColor: settings.backgroundColor,
      padding: `${settings.padding}px`,
      borderRadius: `${settings.borderRadius}px`
    }}
  >
    {settings.showWindowControls && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-opacity-20 border-gray-500 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          </div>
          <div className="h-4 bg-gray-400 rounded w-24"></div>
        </div>
      </div>
    )}
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {settings.showLineNumbers && (
            <div className="w-8 h-4 bg-gray-400 rounded"></div>
          )}
          <div
            className="h-4 bg-gray-400 rounded"
            style={{ width: `${Math.random() * 60 + 20}%` }}
          ></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Error fallback component
 */
const ErrorFallback: React.FC<{
  error: Error;
  code: string;
  settings: any;
  onRetry: () => void;
}> = ({ error, code, settings, onRetry }) => (
  <div
    className="rounded-lg overflow-hidden border-2 border-red-300 dark:border-red-700"
    style={{
      backgroundColor: settings.backgroundColor,
      padding: `${settings.padding}px`,
      borderRadius: `${settings.borderRadius}px`
    }}
  >
    <div className="text-center py-8">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm font-medium">Failed to render code preview</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {error.message}
        </p>
      </div>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Try Again
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing plain text fallback below
        </div>
      </div>
    </div>

    {/* Plain text fallback */}
    <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
      <pre
        className="font-mono text-sm whitespace-pre-wrap break-words"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          color: settings.theme.foreground
        }}
      >
        {code}
      </pre>
    </div>
  </div>
);

/**
 * CodePreview component for displaying beautified code with syntax highlighting
 */
export const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language,
  theme,
  settings,
  isExporting = false,
  className = '',
  onPreviewReady
}) => {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const previewRef = useRef<HTMLDivElement>(null);
  const highlightService = createHighlightService();

  // Highlight code when dependencies change
  const highlightCode = useCallback(async () => {
    if (!code.trim()) {
      setHighlightedCode('');
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const highlighted = await highlightService.highlightCode(code, language, theme);
      setHighlightedCode(highlighted);

      // Notify parent that preview is ready
      if (onPreviewReady) {
        setTimeout(onPreviewReady, 100); // Small delay to ensure DOM is updated
      }
    } catch (err) {
      console.error('Failed to highlight code:', err);
      setError(err instanceof Error ? err : new Error('Unknown highlighting error'));

      // Create fallback highlighted code
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      setHighlightedCode(`<pre><code>${escapedCode}</code></pre>`);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, theme, highlightService, onPreviewReady]);

  // Retry highlighting
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    highlightCode();
  }, [highlightCode]);

  // Effect to trigger highlighting
  useEffect(() => {
    highlightCode();
  }, [highlightCode]);

  // Calculate dynamic styles with mobile responsiveness
  const containerStyle = useMemo(() => ({
    backgroundColor: settings.backgroundColor,
    padding: `${Math.max(8, settings.padding)}px`, // Minimum padding for mobile
    borderRadius: `${settings.borderRadius}px`,
    maxWidth: settings.maxWidth ? `${settings.maxWidth}px` : undefined,
    maxHeight: settings.maxHeight ? `${settings.maxHeight}px` : undefined,
    overflow: settings.maxHeight ? 'auto' : 'visible'
  }), [settings.backgroundColor, settings.padding, settings.borderRadius, settings.maxWidth, settings.maxHeight]);

  const codeStyle = useMemo(() => ({
    fontSize: `${Math.max(10, settings.fontSize)}px`, // Minimum font size for readability
    fontFamily: settings.fontFamily,
    lineHeight: settings.lineHeight,
    tabSize: settings.tabSize,
    whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
    wordBreak: (settings.wordWrap ? 'break-word' : 'normal') as React.CSSProperties['wordBreak'],
    // Better mobile text rendering
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale'
  }), [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.tabSize, settings.wordWrap]);

  // Show loading skeleton
  if (isLoading && !highlightedCode) {
    return (
      <div className={`${className}`}>
        <div 
          data-export-target="true" 
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={containerStyle}
          role="region"
          aria-label="Code preview loading"
        >
          <LoadingSkeleton settings={settings} />
        </div>
      </div>
    );
  }

  // Show error fallback
  if (error && !highlightedCode) {
    return (
      <div className={className}>
        <div 
          data-export-target="true" 
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={containerStyle}
          role="region"
          aria-label="Code preview error"
        >
          <ErrorFallback
            error={error}
            code={code}
            settings={settings}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (!code.trim()) {
    return (
      <div className={className}>
        <div
          data-export-target="true"
          className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors hover:border-gray-400 dark:hover:border-gray-500"
          style={containerStyle}
          role="region"
          aria-label="Empty code preview"
        >
          <div className="text-center py-8 sm:py-12 px-4">
            <svg
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Enter some code to see the preview
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 hidden sm:block">
              Paste your code in the editor to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={previewRef}
        className={`
          relative rounded-lg overflow-hidden shadow-lg transition-all duration-200
          ${isExporting ? 'export-preview' : ''}
          ${error ? 'border-2 border-yellow-300 dark:border-yellow-700' : ''}
        `}
        style={containerStyle}
        role="region"
        aria-label="Code preview"
        aria-live="polite"
        aria-busy={isLoading}
        data-export-target="true"
      >
        {/* Window header */}
        <WindowHeader
          title={settings.title}
          filename={settings.filename}
          windowStyle={settings.windowStyle}
          showControls={settings.showWindowControls}
          backgroundColor={theme.background}
        />

        {/* Code content */}
        <div className="flex min-h-0">
          {/* Line numbers */}
          {settings.showLineNumbers && (
            <LineNumbers
              code={code}
              fontSize={settings.fontSize}
              lineHeight={settings.lineHeight}
              theme={theme}
            />
          )}

          {/* Code content */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <div
              className="p-2 sm:p-4 font-mono"
              style={codeStyle}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              role="code"
              aria-label={`Code in ${language}`}
              tabIndex={0}
            />
          </div>
        </div>

        {/* Loading overlay for updates */}
        {isLoading && highlightedCode && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Updating...</span>
            </div>
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Fallback mode</span>
            </div>
          </div>
        )}

        {/* Export indicator */}
        {isExporting && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
            <div className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow-lg flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Generating image...</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview info */}
      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">Language:</span>
            <span className="font-medium">{language}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">Theme:</span>
            <span className="font-medium">{theme.name}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">Lines:</span>
            <span className="font-medium">{code.split('\n').length}</span>
          </span>
        </div>
        {error && (
          <button
            onClick={handleRetry}
            className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5 transition-colors"
            aria-label={`Retry highlighting (attempt ${retryCount + 1})`}
          >
            Retry ({retryCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
