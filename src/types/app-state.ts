import { PreviewSettings, PreviewMode } from './preview';
import { ExportOptions, ExportStatus, ExportProgress, ExportError } from './export';

/**
 * Main application state
 */
export interface AppState {
  // Code editor state
  code: string;
  language: string;
  isLanguageDetected: boolean;
  
  // Preview settings
  settings: PreviewSettings;
  
  // Export state
  isExporting: boolean;
  exportStatus: ExportStatus;
  exportProgress?: ExportProgress;
  exportError?: ExportError;
  
  // Export modal state
  exportModal: {
    isOpen: boolean;
    options: ExportOptions;
  };
  
  // UI state
  ui: {
    sidebarOpen: boolean;
    previewMode: PreviewMode;
    isLoading: boolean;
    activeTab: 'editor' | 'preview' | 'settings';
    showLineNumbers: boolean;
    wordWrap: boolean;
  };
  
  // Error state
  error?: {
    type: 'highlight' | 'export' | 'storage' | 'network';
    message: string;
    details?: any;
  };
}

/**
 * Action types for state management
 */
export type AppAction =
  | { type: 'SET_CODE'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_LANGUAGE_DETECTED'; payload: boolean }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PreviewSettings> }
  | { type: 'SET_EXPORT_STATUS'; payload: ExportStatus }
  | { type: 'SET_EXPORT_PROGRESS'; payload: ExportProgress }
  | { type: 'SET_EXPORT_ERROR'; payload: ExportError }
  | { type: 'OPEN_EXPORT_MODAL'; payload?: Partial<ExportOptions> }
  | { type: 'CLOSE_EXPORT_MODAL' }
  | { type: 'UPDATE_EXPORT_OPTIONS'; payload: Partial<ExportOptions> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_PREVIEW_MODE'; payload: PreviewMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['ui']['activeTab'] }
  | { type: 'TOGGLE_LINE_NUMBERS' }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'SET_ERROR'; payload: AppState['error'] }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

/**
 * Default application state
 */
export interface DefaultAppState extends AppState {
  code: '';
  language: 'javascript';
  isLanguageDetected: false;
}

/**
 * State persistence options
 */
export interface StatePersistenceConfig {
  key: string;
  version: number;
  whitelist?: (keyof AppState)[];
  blacklist?: (keyof AppState)[];
}

/**
 * User preferences that can be saved
 */
export interface UserPreferences {
  settings: Partial<PreviewSettings>;
  ui: Partial<AppState['ui']>;
  lastUsedLanguage?: string;
  favoriteThemes?: string[];
}

/**
 * Preset configuration
 */
export interface PresetConfig {
  name: string;
  description?: string;
  settings: PreviewSettings;
  createdAt: Date;
  updatedAt: Date;
}