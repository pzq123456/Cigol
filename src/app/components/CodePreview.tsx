'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CodePreviewProps } from '../../types/components';
import { createHighlightService } from '../../services/highlight';
import { WindowStyle } from '../../types/theme';

/**
 * Window controls component for different OS styles
 */
const WindowControls: React.FC<{ style: WindowStyle; className?: string }> = React.memo(({
  style,
  className = ''
}) => {
  if (style === 'none') return null;

  // Windows 按钮顺序调整：最小化、最大化/还原、关闭
  const windowsButtons = (
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
        title="Maximize/Restore"
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
        <svg className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </>
  );

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
      {style === 'windows' && windowsButtons}
    </div>
  );
});

WindowControls.displayName = 'WindowControls';

/**
 * Window header component with title, filename and controls
 */
const WindowHeader: React.FC<{
  title?: string;
  filename?: string;
  windowStyle: WindowStyle;
  showControls: boolean;
  backgroundColor: string;
  isTabbed?: boolean;
}> = React.memo(({ title, filename, windowStyle, showControls, backgroundColor, isTabbed = false }) => {
  if (!showControls && !title && !filename) return null;

  return (
    <header
      className="flex items-center px-4 py-3 border-b border-opacity-20 border-gray-500 select-none"
      style={{ backgroundColor }}
      role="banner"
      aria-label="Code preview header"
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* macOS 控制按钮保持在左侧 */}
        {showControls && windowStyle === 'macos' && (
          <WindowControls style={windowStyle} />
        )}
        <div className="flex-shrink-0">
          {isTabbed && filename ? (
            <div
              className="px-2 py-1 max-w-[150px] bg-gray-700 dark:bg-gray-200 rounded-md border-b-0 border-gray-500 border-opacity-20 text-sm flex items-center"
            >
              <div
                className="text-gray-200 dark:text-gray-700 truncate font-mono"
                title={filename}
                aria-label={`Filename tab: ${filename}`}
              >
                {filename}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      {/* Windows 控制按钮移到右侧 */}
      {showControls && windowStyle === 'windows' && (
        <WindowControls style={windowStyle} className="ml-2" />
      )}
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
        fontSize: `${fontSize}px`,
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
          style={{ lineHeight: lineHeight }}
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
          {settings.windowStyle === 'macos' && (
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            </div>
          )}
          <div className="h-4 bg-gray-400 rounded w-24"></div>
        </div>
        {settings.windowStyle === 'windows' && (
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-gray-400"></div>
            <div className="w-4 h-4 bg-gray-400"></div>
            <div className="w-4 h-4 bg-gray-400"></div>
          </div>
        )}
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
  dynamicFontClass: string;
}> = ({ error, code, settings, onRetry, dynamicFontClass }) => (
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
    <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
      <pre
        className={`font-mono text-sm whitespace-pre-wrap break-words ${dynamicFontClass}`}
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

// 确保 props 类型包含 dynamicFontClass
interface CodePreviewWithFontProps extends CodePreviewProps {
  dynamicFontClass: string;
}

/**
 * CodePreview component for displaying beautified code with syntax highlighting
 */
export const CodePreview: React.FC<CodePreviewWithFontProps> = ({
  code,
  language,
  theme,
  settings,
  isExporting = false,
  className = '',
  onPreviewReady,
  dynamicFontClass
}) => {
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const previewRef = useRef<HTMLDivElement>(null);
  const highlightService = createHighlightService();

  // Highlight code with dynamic font class
  const highlightCode = useCallback(async () => {
    if (!code.trim()) {
      setHighlightedCode('');
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const highlighted = await highlightService.highlightCode(code, language, theme, dynamicFontClass);
      setHighlightedCode(highlighted);

      if (onPreviewReady) {
        setTimeout(onPreviewReady, 100);
      }
    } catch (err) {
      console.error('Failed to highlight code:', err);
      setError(err instanceof Error ? err : new Error('Unknown highlighting error'));
    } finally {
      setIsLoading(false);
    }
  }, [code, language, theme, highlightService, onPreviewReady, dynamicFontClass]);

  // Retry highlighting
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    highlightCode();
  }, [highlightCode]);

  // Effect to trigger highlighting
  useEffect(() => {
    highlightCode();
  }, [highlightCode, retryCount]);

  // Calculate dynamic styles
  const containerStyle = useMemo(() => ({
    backgroundColor: settings.backgroundColor,
    padding: `${Math.max(8, settings.padding)}px`,
    borderRadius: `${settings.borderRadius}px`,
    maxWidth: settings.maxWidth ? `${settings.maxWidth}px` : undefined,
    maxHeight: settings.maxHeight ? `${settings.maxHeight}px` : undefined,
    overflow: settings.maxHeight ? 'auto' : 'visible'
  }), [settings.backgroundColor, settings.padding, settings.borderRadius, settings.maxWidth, settings.maxHeight]);

  const codeStyle = useMemo(() => ({
    fontSize: `${Math.max(10, settings.fontSize)}px`,
    lineHeight: settings.lineHeight,
    tabSize: settings.tabSize,
    whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
    wordBreak: (settings.wordWrap ? 'break-word' : 'normal') as React.CSSProperties['wordBreak'],
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale'
  }), [settings.fontSize, settings.lineHeight, settings.tabSize, settings.wordWrap]);

  // Show loading skeleton
  if (isLoading && !highlightedCode) {
    return (
      <div className={className}>
        <div
          data-export-target="true"
          className={`relative rounded-lg overflow-hidden shadow-lg ${dynamicFontClass}`}
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
          className={`relative rounded-lg overflow-hidden shadow-lg ${dynamicFontClass}`}
          style={containerStyle}
          role="region"
          aria-label="Code preview error"
        >
          <ErrorFallback
            error={error}
            code={code}
            settings={settings}
            onRetry={handleRetry}
            dynamicFontClass={dynamicFontClass}
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
          className={`rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors hover:border-gray-400 dark:hover:border-gray-500 ${dynamicFontClass}`}
          style={{
            ...containerStyle,
            height: '256px',
            backgroundColor: 'transparent'
          }}
          role="region"
          aria-label="Code preview empty state"
        >
          <div className="text-center text-gray-500 dark:text-gray-400 px-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-sm font-medium">Start typing to see your code snippet here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={className}>
      <div
        ref={previewRef}
        data-export-target="true"
        className={`relative rounded-lg overflow-hidden shadow-lg ${dynamicFontClass}`}
        style={containerStyle}
        role="region"
        aria-label="Code preview"
      >
        <WindowHeader
          title={settings.title}
          filename={settings.filename}
          windowStyle={settings.windowStyle}
          showControls={settings.showWindowControls}
          backgroundColor={settings.backgroundColor}
          isTabbed={true}
        />
        <div className="flex flex-1 overflow-auto">
          {settings.showLineNumbers && (
            <LineNumbers
              code={code}
              fontSize={settings.fontSize}
              lineHeight={settings.lineHeight}
              theme={theme}
            />
          )}
          <div
            className="flex-1 overflow-x-auto p-4"
            style={{
              backgroundColor: theme.background,
              color: theme.foreground
            }}
          >
            <div
              className={`shiki-container ${dynamicFontClass}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              style={codeStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};