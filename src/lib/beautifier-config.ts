// Code Beautifier Configuration
// This file contains configuration constants and type definitions for the code beautifier

// Export formats supported by the application
export const EXPORT_FORMATS = ['png', 'jpeg'] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];

// Resolution multipliers for different quality exports
export const RESOLUTION_OPTIONS = [1, 2, 3] as const;
export type ResolutionOption = typeof RESOLUTION_OPTIONS[number];

// Default themes that will be available
export const DEFAULT_THEMES = [
  'vs-code-dark',
  'vs-code-light', 
  'github-dark',
  'github-light',
  'dracula',
  'monokai',
  'solarized-dark',
  'solarized-light'
] as const;

// Window styles for code preview
export const WINDOW_STYLES = ['macos', 'windows', 'none'] as const;
export type WindowStyle = typeof WINDOW_STYLES[number];

// Default settings for the code beautifier
export const DEFAULT_SETTINGS = {
  theme: 'vs-code-dark',
  fontSize: 14,
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  lineNumbers: true,
  title: '',
  filename: '',
  padding: 32,
  backgroundColor: '#1e1e1e',
  borderRadius: 8,
  showWindowControls: true,
  windowStyle: 'macos' as WindowStyle,
  showLineNumbers: true
} as const;

// Language detection confidence threshold
export const LANGUAGE_DETECTION_THRESHOLD = 0.7;

// Maximum code length for processing (to prevent performance issues)
export const MAX_CODE_LENGTH = 50000;

// Export quality settings
export const EXPORT_QUALITY = {
  png: 1.0,
  jpeg: 0.9
} as const;

// Canvas export settings
export const CANVAS_OPTIONS = {
  allowTaint: false,
  useCORS: true,
  scale: 1,
  backgroundColor: null,
  logging: false
} as const;