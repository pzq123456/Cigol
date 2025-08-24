import { Theme, WindowStyle } from './theme';

/**
 * Preview settings for code display customization
 */
export interface PreviewSettings {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  title: string;
  filename: string;
  padding: number;
  backgroundColor: string;
  borderRadius: number;
  showWindowControls: boolean;
  windowStyle: WindowStyle;
  showLineNumbers: boolean;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Font family options
 */
export type FontFamily = 
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Source Code Pro'
  | 'Monaco'
  | 'Consolas'
  | 'Ubuntu Mono'
  | 'Roboto Mono'
  | 'Victor Mono'
  | 'Pacifico';

/**
 * Preview mode for responsive design
 */
export type PreviewMode = 'desktop' | 'mobile';

/**
 * Code language information
 */
export interface LanguageInfo {
  id: string;
  name: string;
  aliases: string[];
  extensions: string[];
  mimeTypes: string[];
}

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  alternatives: Array<{
    language: string;
    confidence: number;
  }>;
}