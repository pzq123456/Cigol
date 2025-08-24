/**
 * Theme interface for code syntax highlighting
 */
export interface Theme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  colors: {
    keyword: string;
    string: string;
    comment: string;
    number: string;
    operator: string;
    function: string;
    variable: string;
    type: string;
    constant: string;
    punctuation: string;
  };
  windowStyle: WindowStyle;
  isPreset: boolean;
}

/**
 * Window style options for code preview
 */
export type WindowStyle = 'macos' | 'windows' | 'none';

/**
 * Predefined theme IDs
 */
export type ThemeId = 
  | 'vs-code-dark'
  | 'vs-code-light'
  | 'github-dark'
  | 'github-light'
  | 'dracula'
  | 'monokai'
  | 'solarized-dark'
  | 'solarized-light';

/**
 * Theme configuration for creating custom themes
 */
export interface ThemeConfig {
  name: string;
  background: string;
  foreground: string;
  colors: Partial<Theme['colors']>;
  windowStyle?: WindowStyle;
}