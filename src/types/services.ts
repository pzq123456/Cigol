import { Theme, ThemeId } from './theme';
import { LanguageInfo, LanguageDetectionResult } from './preview';
import { ExportOptions, ExportResult, ExportStatus, ExportProgress, ExportError } from './export';

/**
 * Highlight service for syntax highlighting
 */
export interface HighlightService {
  /**
   * Highlight code with specified language and theme
   */
  highlightCode(code: string, language: string, theme: Theme): Promise<string>;
  
  /**
   * Get list of supported programming languages
   */
  getSupportedLanguages(): Promise<LanguageInfo[]>;
  
  /**
   * Get available themes
   */
  getAvailableThemes(): Promise<Theme[]>;
  
  /**
   * Load language grammar dynamically
   */
  loadLanguage(language: string): Promise<void>;
  
  /**
   * Load theme dynamically
   */
  loadTheme(themeId: ThemeId): Promise<Theme>;
  
  /**
   * Check if language is supported
   */
  isLanguageSupported(language: string): boolean;
  
  /**
   * Get theme by ID
   */
  getTheme(themeId: ThemeId): Promise<Theme>;
}

/**
 * Language detection service
 */
export interface LanguageDetectionService {
  /**
   * Detect programming language from code
   */
  detectLanguage(code: string): Promise<LanguageDetectionResult>;
  
  /**
   * Get detection confidence for specific language
   */
  getDetectionConfidence(code: string, language: string): Promise<number>;
  
  /**
   * Get supported languages for detection
   */
  getSupportedLanguages(): string[];
}

/**
 * Export service for image generation
 */
export interface ExportService {
  /**
   * Export HTML element to image
   */
  exportToImage(element: HTMLElement, options: ExportOptions): Promise<ExportResult>;
  
  /**
   * Copy image to clipboard
   */
  copyToClipboard(blob: Blob): Promise<void>;
  
  /**
   * Download file to user's device
   */
  downloadFile(blob: Blob, filename: string): void;
  
  /**
   * Get current export status
   */
  getExportStatus(): ExportStatus;
  
  /**
   * Subscribe to export progress updates
   */
  onProgress(callback: (progress: ExportProgress) => void): () => void;
  
  /**
   * Subscribe to export errors
   */
  onError(callback: (error: ExportError) => void): () => void;
  
  /**
   * Cancel ongoing export operation
   */
  cancelExport(): void;
}

/**
 * Storage service for user preferences
 */
export interface StorageService {
  /**
   * Save user settings to local storage
   */
  saveSettings(settings: any): Promise<void>;
  
  /**
   * Load user settings from local storage
   */
  loadSettings<T>(): Promise<T | null>;
  
  /**
   * Save preset configuration
   */
  savePreset(name: string, preset: any): Promise<void>;
  
  /**
   * Load preset configuration
   */
  loadPreset<T>(name: string): Promise<T | null>;
  
  /**
   * Get all saved presets
   */
  getPresets(): Promise<string[]>;
  
  /**
   * Delete preset
   */
  deletePreset(name: string): Promise<void>;
  
  /**
   * Clear all stored data
   */
  clear(): Promise<void>;
}