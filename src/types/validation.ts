/**
 * Type validation file to ensure all types are correctly defined
 * This file will cause TypeScript compilation errors if types are incorrect
 */

import {
  // Theme types
  Theme,
  ThemeId,
  WindowStyle,
  ThemeConfig,
  
  // Preview types
  PreviewSettings,
  FontFamily,
  PreviewMode,
  LanguageInfo,
  LanguageDetectionResult,
  
  // Export types
  ExportFormat,
  ExportResolution,
  ExportOptions,
  ExportStatus,
  ExportResult,
  ExportError,
  ExportProgress,
  
  // Service interfaces
  HighlightService,
  LanguageDetectionService,
  ExportService,
  StorageService,
  
  // App state types
  AppState,
  AppAction,
  UserPreferences,
  PresetConfig,
  
  // Component types
  CodeEditorProps,
  CodePreviewProps,
  ControlPanelProps,
  ExportModalProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  
  // Utility types
  DeepPartial,
  RequiredFields,
  EventHandler,
  AsyncFunction,
  ApiResponse,
  Dimensions,
  AppError,
  
  // Constants
  DEFAULT_PREVIEW_SETTINGS,
  DEFAULT_EXPORT_OPTIONS,
  FONT_FAMILIES,
  THEME_IDS,
  ERROR_MESSAGES,
} from './index';

// Type validation - these assignments will cause TypeScript errors if types are wrong

// Theme validation
const validTheme: Theme = {
  id: 'test-theme',
  name: 'Test Theme',
  background: '#000000',
  foreground: '#ffffff',
  colors: {
    keyword: '#ff0000',
    string: '#00ff00',
    comment: '#0000ff',
    number: '#ffff00',
    operator: '#ff00ff',
    function: '#00ffff',
    variable: '#ffffff',
    type: '#000000',
    constant: '#888888',
    punctuation: '#444444',
  },
  windowStyle: 'macos',
  isPreset: false,
};

const validThemeId: ThemeId = 'vs-code-dark';
const validWindowStyle: WindowStyle = 'macos';

// Preview validation
const validPreviewSettings: PreviewSettings = {
  ...DEFAULT_PREVIEW_SETTINGS,
  fontSize: 16,
  fontFamily: 'Fira Code',
};

const validFontFamily: FontFamily = 'JetBrains Mono';
const validPreviewMode: PreviewMode = 'desktop';

const validLanguageInfo: LanguageInfo = {
  id: 'javascript',
  name: 'JavaScript',
  aliases: ['js'],
  extensions: ['.js'],
  mimeTypes: ['text/javascript'],
};

const validDetectionResult: LanguageDetectionResult = {
  language: 'javascript',
  confidence: 0.95,
  alternatives: [
    { language: 'typescript', confidence: 0.85 },
  ],
};

// Export validation
const validExportFormat: ExportFormat = 'png';
const validExportResolution: ExportResolution = 2;
const validExportStatus: ExportStatus = 'idle';

const validExportOptions: ExportOptions = {
  format: 'png',
  resolution: 2,
  quality: 90,
  transparent: false,
  filename: 'test.png',
};

const validExportResult: ExportResult = {
  blob: new Blob(),
  filename: 'test.png',
  format: 'png',
  resolution: 2,
  size: { width: 800, height: 600 },
};

const validExportError: ExportError = {
  code: 'EXPORT_FAILED',
  message: 'Export failed',
};

const validExportProgress: ExportProgress = {
  stage: 'rendering',
  progress: 50,
  message: 'Rendering image...',
};

// Service interface validation
const validHighlightService: HighlightService = {
  highlightCode: async () => '',
  getSupportedLanguages: async () => [],
  getAvailableThemes: async () => [],
  loadLanguage: async () => {},
  loadTheme: async () => validTheme,
  isLanguageSupported: () => true,
  getTheme: async () => validTheme,
};

const validLanguageDetectionService: LanguageDetectionService = {
  detectLanguage: async () => validDetectionResult,
  getDetectionConfidence: async () => 0.95,
  getSupportedLanguages: () => ['javascript', 'typescript'],
};

const validExportService: ExportService = {
  exportToImage: async () => validExportResult,
  copyToClipboard: async () => {},
  downloadFile: () => {},
  getExportStatus: () => 'idle',
  onProgress: () => () => {},
  onError: () => () => {},
  cancelExport: () => {},
};

const validStorageService: StorageService = {
  saveSettings: async () => {},
  loadSettings: async () => null,
  savePreset: async () => {},
  loadPreset: async () => null,
  getPresets: async () => [],
  deletePreset: async () => {},
  clear: async () => {},
};

// App state validation
const validAppAction: AppAction = {
  type: 'SET_CODE',
  payload: 'console.log("Hello, World!");',
};

const validUserPreferences: UserPreferences = {
  settings: {
    fontSize: 16,
    fontFamily: 'Fira Code',
  },
  ui: {
    sidebarOpen: true,
  },
  lastUsedLanguage: 'javascript',
};

const validPresetConfig: PresetConfig = {
  name: 'My Preset',
  description: 'Custom preset',
  settings: validPreviewSettings,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validAppState: AppState = {
  code: '',
  language: 'javascript',
  isLanguageDetected: false,
  settings: validPreviewSettings,
  isExporting: false,
  exportStatus: 'idle',
  exportModal: {
    isOpen: false,
    options: validExportOptions,
  },
  ui: {
    sidebarOpen: false,
    previewMode: 'desktop',
    isLoading: false,
    activeTab: 'editor',
    showLineNumbers: true,
    wordWrap: false,
  },
};

// Component props validation
const validCodeEditorProps: CodeEditorProps = {
  code: 'const x = 1;',
  language: 'javascript',
  onChange: () => {},
  onLanguageChange: () => {},
};

const validCodePreviewProps: CodePreviewProps = {
  code: 'test',
  language: 'javascript',
  theme: validTheme,
  settings: validPreviewSettings,
};

const validControlPanelProps: ControlPanelProps = {
  settings: validPreviewSettings,
  onSettingsChange: () => {},
  onExport: () => {},
};

const validExportModalProps: ExportModalProps = {
  isOpen: false,
  onClose: () => {},
  onExport: () => {},
  isExporting: false,
};

const validErrorBoundaryState: ErrorBoundaryState = {
  hasError: false,
  error: null,
};

// Utility types validation
type PartialTheme = DeepPartial<Theme>;
type RequiredTheme = RequiredFields<Partial<Theme>, 'id' | 'name'>;

const validEventHandler: EventHandler = () => {};
const validAsyncFunction: AsyncFunction = async () => {};

const validApiResponse: ApiResponse<string> = {
  success: true,
  data: 'test',
};

const validDimensions: Dimensions = {
  width: 100,
  height: 200,
};

const validAppError: AppError = {
  name: 'TestError',
  message: 'Test error message',
  code: 'TEST_ERROR',
};

// Constants validation
const _constantsValidation = {
  defaultSettings: DEFAULT_PREVIEW_SETTINGS,
  defaultExportOptions: DEFAULT_EXPORT_OPTIONS,
  fontFamilies: FONT_FAMILIES,
  themeIds: THEME_IDS,
  errorMessages: ERROR_MESSAGES,
};

// Export all validated types to prevent unused variable warnings
export {
  validTheme,
  validThemeId,
  validWindowStyle,
  validPreviewSettings,
  validFontFamily,
  validPreviewMode,
  validLanguageInfo,
  validDetectionResult,
  validExportFormat,
  validExportResolution,
  validExportStatus,
  validExportOptions,
  validExportResult,
  validExportError,
  validExportProgress,
  validHighlightService,
  validLanguageDetectionService,
  validExportService,
  validStorageService,
  validAppAction,
  validUserPreferences,
  validPresetConfig,
  validAppState,
  validCodeEditorProps,
  validCodePreviewProps,
  validControlPanelProps,
  validExportModalProps,
  validErrorBoundaryState,
  validEventHandler,
  validAsyncFunction,
  validApiResponse,
  validDimensions,
  validAppError,
};

// Type-only exports
export type {
  PartialTheme,
  RequiredTheme,
};