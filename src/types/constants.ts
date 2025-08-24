import { PreviewSettings, FontFamily } from './preview';
import { ExportOptions } from './export';
import { ThemeId } from './theme';

/**
 * Default preview settings
 */
export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = {
  theme: {
    id: 'vs-code-dark',
    name: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    colors: {
      keyword: '#569cd6',
      string: '#ce9178',
      comment: '#6a9955',
      number: '#b5cea8',
      operator: '#d4d4d4',
      function: '#dcdcaa',
      variable: '#9cdcfe',
      type: '#4ec9b0',
      constant: '#4fc1ff',
      punctuation: '#d4d4d4',
    },
    windowStyle: 'macos',
    isPreset: true,
  },
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  lineNumbers: true,
  title: '',
  filename: '',
  padding: 32,
  backgroundColor: '#1e1e1e',
  borderRadius: 8,
  showWindowControls: true,
  windowStyle: 'macos',
  showLineNumbers: true,
  lineHeight: 1.5,
  tabSize: 2,
  wordWrap: false,
  maxWidth: 800,
  maxHeight: 600,
};

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  resolution: 2,
  quality: 90,
  transparent: false,
  filename: 'code-snippet',
};

/**
 * Supported font families
 */
export const FONT_FAMILIES: FontFamily[] = [
  'JetBrains Mono',
  'Fira Code',
  'Source Code Pro',
  'Monaco',
  'Consolas',
  'Ubuntu Mono',
  'Roboto Mono',
];

/**
 * Supported theme IDs
 */
export const THEME_IDS: ThemeId[] = [
  'vs-code-dark',
  'vs-code-light',
  'github-dark',
  'github-light',
  'dracula',
  'monokai',
  'solarized-dark',
  'solarized-light',
];

/**
 * Font size range
 */
export const FONT_SIZE_RANGE = {
  min: 8,
  max: 32,
  default: 14,
} as const;

/**
 * Padding range
 */
export const PADDING_RANGE = {
  min: 0,
  max: 64,
  default: 32,
} as const;

/**
 * Border radius range
 */
export const BORDER_RADIUS_RANGE = {
  min: 0,
  max: 24,
  default: 8,
} as const;

/**
 * Line height range
 */
export const LINE_HEIGHT_RANGE = {
  min: 1.0,
  max: 2.0,
  default: 1.5,
  step: 0.1,
} as const;

/**
 * Tab size options
 */
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

/**
 * Export quality range
 */
export const EXPORT_QUALITY_RANGE = {
  min: 10,
  max: 100,
  default: 90,
} as const;

/**
 * Maximum code length for processing
 */
export const MAX_CODE_LENGTH = 50000;

/**
 * Maximum export dimensions
 */
export const MAX_EXPORT_DIMENSIONS = {
  width: 4000,
  height: 4000,
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  code_change: 300,
  settings_change: 150,
  resize: 100,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  user_preferences: 'code-beautifier-preferences',
  presets: 'code-beautifier-presets',
  recent_languages: 'code-beautifier-recent-languages',
} as const;

/**
 * API endpoints (if needed for future extensions)
 */
export const API_ENDPOINTS = {
  // Placeholder for future API integrations
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  LANGUAGE_DETECTION_FAILED: 'Failed to detect programming language',
  SYNTAX_HIGHLIGHTING_FAILED: 'Failed to apply syntax highlighting',
  EXPORT_FAILED: 'Failed to export image',
  CLIPBOARD_FAILED: 'Failed to copy to clipboard',
  STORAGE_FAILED: 'Failed to save settings',
  THEME_LOAD_FAILED: 'Failed to load theme',
  INVALID_CODE_LENGTH: `Code length exceeds maximum limit of ${MAX_CODE_LENGTH} characters`,
} as const;