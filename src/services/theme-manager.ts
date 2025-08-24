import { Theme, ThemeId, ThemeConfig } from '../types/theme';
import { HighlightServiceImpl } from './highlight';

/**
 * Theme manager for handling theme operations and real-time preview updates
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme | null = null;
  private highlightService: HighlightServiceImpl;
  private themeChangeListeners: Array<(theme: Theme) => void> = [];

  private constructor() {
    this.highlightService = HighlightServiceImpl.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Get all available themes
   */
  public async getAvailableThemes(): Promise<Theme[]> {
    return await this.highlightService.getAvailableThemes();
  }

  /**
   * Get theme by ID
   */
  public async getTheme(themeId: ThemeId): Promise<Theme> {
    return await this.highlightService.getTheme(themeId);
  }

  /**
   * Set current theme and notify listeners
   */
  public async setCurrentTheme(themeId: ThemeId): Promise<void> {
    const theme = await this.getTheme(themeId);
    this.currentTheme = theme;
    
    // Load theme in highlight service
    await this.highlightService.loadTheme(themeId);
    
    // Notify all listeners for real-time preview updates
    this.notifyThemeChange(theme);
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * Create custom theme from configuration
   */
  public createCustomTheme(config: ThemeConfig): Theme {
    const customTheme: Theme = {
      id: `custom-${Date.now()}`,
      name: config.name,
      background: config.background,
      foreground: config.foreground,
      colors: {
        keyword: config.colors.keyword || '#569cd6',
        string: config.colors.string || '#ce9178',
        comment: config.colors.comment || '#6a9955',
        number: config.colors.number || '#b5cea8',
        operator: config.colors.operator || '#d4d4d4',
        function: config.colors.function || '#dcdcaa',
        variable: config.colors.variable || '#9cdcfe',
        type: config.colors.type || '#4ec9b0',
        constant: config.colors.constant || '#4fc1ff',
        punctuation: config.colors.punctuation || '#d4d4d4'
      },
      windowStyle: config.windowStyle || 'macos',
      isPreset: false
    };

    return customTheme;
  }

  /**
   * Apply theme to preview element
   */
  public applyThemeToPreview(element: HTMLElement, theme: Theme): void {
    if (!element) return;

    // Apply background and foreground colors
    element.style.backgroundColor = theme.background;
    element.style.color = theme.foreground;

    // Apply theme-specific CSS custom properties
    element.style.setProperty('--theme-background', theme.background);
    element.style.setProperty('--theme-foreground', theme.foreground);
    element.style.setProperty('--theme-keyword', theme.colors.keyword);
    element.style.setProperty('--theme-string', theme.colors.string);
    element.style.setProperty('--theme-comment', theme.colors.comment);
    element.style.setProperty('--theme-number', theme.colors.number);
    element.style.setProperty('--theme-operator', theme.colors.operator);
    element.style.setProperty('--theme-function', theme.colors.function);
    element.style.setProperty('--theme-variable', theme.colors.variable);
    element.style.setProperty('--theme-type', theme.colors.type);
    element.style.setProperty('--theme-constant', theme.colors.constant);
    element.style.setProperty('--theme-punctuation', theme.colors.punctuation);

    // Apply window style classes
    element.classList.remove('window-macos', 'window-windows', 'window-none');
    element.classList.add(`window-${theme.windowStyle}`);
  }

  /**
   * Get theme categories for organization
   */
  public async getThemeCategories(): Promise<Record<string, Theme[]>> {
    const themes = await this.getAvailableThemes();
    
    const categories: Record<string, Theme[]> = {
      'VS Code': [],
      'GitHub': [],
      'Popular': [],
      'Solarized': []
    };

    themes.forEach(theme => {
      if (theme.id.startsWith('vs-code')) {
        categories['VS Code'].push(theme);
      } else if (theme.id.startsWith('github')) {
        categories['GitHub'].push(theme);
      } else if (theme.id === 'dracula' || theme.id === 'monokai') {
        categories['Popular'].push(theme);
      } else if (theme.id.startsWith('solarized')) {
        categories['Solarized'].push(theme);
      }
    });

    return categories;
  }

  /**
   * Get theme contrast ratio for accessibility
   */
  public getThemeContrastRatio(theme: Theme): number {
    // Simple contrast ratio calculation
    const bgLuminance = this.getLuminance(theme.background);
    const fgLuminance = this.getLuminance(theme.foreground);
    
    const lighter = Math.max(bgLuminance, fgLuminance);
    const darker = Math.min(bgLuminance, fgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if theme meets WCAG accessibility standards
   */
  public isThemeAccessible(theme: Theme): boolean {
    const contrastRatio = this.getThemeContrastRatio(theme);
    return contrastRatio >= 4.5; // WCAG AA standard
  }

  /**
   * Subscribe to theme changes for real-time updates
   */
  public onThemeChange(callback: (theme: Theme) => void): () => void {
    this.themeChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.themeChangeListeners.indexOf(callback);
      if (index > -1) {
        this.themeChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get theme preview CSS for styling
   */
  public getThemePreviewCSS(theme: Theme): string {
    return `
      .theme-preview {
        background-color: ${theme.background};
        color: ${theme.foreground};
        border-radius: 8px;
        padding: 16px;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }
      
      .theme-preview .keyword { color: ${theme.colors.keyword}; }
      .theme-preview .string { color: ${theme.colors.string}; }
      .theme-preview .comment { color: ${theme.colors.comment}; }
      .theme-preview .number { color: ${theme.colors.number}; }
      .theme-preview .operator { color: ${theme.colors.operator}; }
      .theme-preview .function { color: ${theme.colors.function}; }
      .theme-preview .variable { color: ${theme.colors.variable}; }
      .theme-preview .type { color: ${theme.colors.type}; }
      .theme-preview .constant { color: ${theme.colors.constant}; }
      .theme-preview .punctuation { color: ${theme.colors.punctuation}; }
    `;
  }

  /**
   * Export theme configuration
   */
  public exportTheme(theme: Theme): string {
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from configuration
   */
  public importTheme(themeJson: string): Theme {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      
      // Validate theme structure
      if (!this.isValidTheme(theme)) {
        throw new Error('Invalid theme structure');
      }
      
      return theme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyThemeChange(theme: Theme): void {
    this.themeChangeListeners.forEach(callback => {
      try {
        callback(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Calculate luminance for contrast ratio
   */
  private getLuminance(color: string): number {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Validate theme structure
   */
  private isValidTheme(theme: any): theme is Theme {
    return (
      typeof theme === 'object' &&
      typeof theme.id === 'string' &&
      typeof theme.name === 'string' &&
      typeof theme.background === 'string' &&
      typeof theme.foreground === 'string' &&
      typeof theme.colors === 'object' &&
      typeof theme.windowStyle === 'string' &&
      typeof theme.isPreset === 'boolean'
    );
  }
}

/**
 * Factory function to create theme manager
 */
export function createThemeManager(): ThemeManager {
  return ThemeManager.getInstance();
}