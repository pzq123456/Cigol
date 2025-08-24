import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { HighlightService } from '../types/services';
import { Theme, ThemeId } from '../types/theme';
import { LanguageInfo } from '../types/preview';

/**
 * Highlight service implementation using Shiki
 */
export class HighlightServiceImpl implements HighlightService {
  private static instance: HighlightServiceImpl;
  private highlighter: Highlighter | null = null;
  private loadedLanguages: Set<string> = new Set();
  private loadedThemes: Set<string> = new Set();
  private availableThemes: Map<ThemeId, Theme> = new Map();

  private constructor() {
    this.initializeDefaultThemes();
  }

  /**
   * Get singleton instance.
   * Ensures only one instance of the highlighter service is created.
   */
  public static getInstance(): HighlightServiceImpl {
    if (!HighlightServiceImpl.instance) {
      HighlightServiceImpl.instance = new HighlightServiceImpl();
    }
    return HighlightServiceImpl.instance;
  }

  /**
   * Initializes the Shiki highlighter with a default set of themes and languages.
   * This is a one-time operation.
   */
  private async initializeHighlighter(): Promise<void> {
    if (this.highlighter) return;

    try {
      this.highlighter = await createHighlighter({
        themes: ['dark-plus', 'light-plus'],
        langs: ['javascript', 'typescript', 'python', 'html', 'css', 'json']
      });

      // Mark initial languages and themes as loaded
      this.loadedLanguages.add('javascript');
      this.loadedLanguages.add('typescript');
      this.loadedLanguages.add('python');
      this.loadedLanguages.add('html');
      this.loadedLanguages.add('css');
      this.loadedLanguages.add('json');

      this.loadedThemes.add('dark-plus');
      this.loadedThemes.add('light-plus');
    } catch (error) {
      console.error('Failed to initialize highlighter:', error);
      throw new Error('Failed to initialize syntax highlighter');
    }
  }

  /**
   * Highlights code with the specified language and theme.
   * @param code The code to highlight.
   * @param language The programming language of the code.
   * @param theme The theme to use for highlighting.
   * @returns A promise that resolves with the highlighted HTML string.
   */
  public async highlightCode(code: string, language: string, theme: Theme): Promise<string> {
    await this.initializeHighlighter();

    if (!this.highlighter) {
      throw new Error('Highlighter not initialized');
    }

    try {
      // Ensure language is loaded before highlighting
      await this.loadLanguage(language);

      // Map our custom theme ID to Shiki's theme name
      const shikiTheme = this.mapThemeToShiki(theme);

      // Ensure the theme is loaded. If it fails, use a fallback.
      if (!this.loadedThemes.has(shikiTheme)) {
        try {
          await this.highlighter.loadTheme(shikiTheme as BundledTheme);
          this.loadedThemes.add(shikiTheme);
        } catch (error) {
          console.warn(`Failed to load theme ${shikiTheme}, using fallback`);
          const fallbackTheme = this.loadedThemes.values().next().value || 'dark-plus';
          return this.highlighter.codeToHtml(code, {
            lang: language as BundledLanguage,
            theme: fallbackTheme as BundledTheme
          });
        }
      }

      // Highlight the code
      return this.highlighter.codeToHtml(code, {
        lang: language as BundledLanguage,
        theme: shikiTheme as BundledTheme
      });

    } catch (error) {
      console.warn(`Failed to highlight code with language ${language}:`, error);

      // Fallback to a basic plain text display if Shiki fails
      return this.createFallbackHighlight(code, theme);
    }
  }

  /**
   * Gets a list of supported programming languages.
   * @returns A promise resolving to an array of LanguageInfo objects.
   */
  public async getSupportedLanguages(): Promise<LanguageInfo[]> {
    await this.initializeHighlighter();

    if (!this.highlighter) {
      return [];
    }

    const languages = this.highlighter.getLoadedLanguages();

    return languages.map(lang => ({
      id: lang,
      name: this.getLanguageDisplayName(lang),
      aliases: this.getLanguageAliases(lang),
      extensions: this.getLanguageExtensions(lang),
      mimeTypes: this.getLanguageMimeTypes(lang)
    }));
  }

  /**
   * Gets a list of available themes.
   * @returns A promise resolving to an array of Theme objects.
   */
  public async getAvailableThemes(): Promise<Theme[]> {
    return Array.from(this.availableThemes.values());
  }

  /**
   * Dynamically loads a language grammar.
   * @param language The language to load.
   */
  public async loadLanguage(language: string): Promise<void> {
    if (this.loadedLanguages.has(language)) {
      return;
    }

    await this.initializeHighlighter();

    if (!this.highlighter) {
      throw new Error('Highlighter not initialized');
    }

    try {
      await this.highlighter.loadLanguage(language as BundledLanguage);
      this.loadedLanguages.add(language);
    } catch (error) {
      console.warn(`Failed to load language ${language}:`, error);
    }
  }

  /**
   * Dynamically loads a theme.
   * @param themeId The ID of the theme to load.
   * @returns A promise resolving to the loaded Theme object.
   */
  public async loadTheme(themeId: ThemeId): Promise<Theme> {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    await this.initializeHighlighter();

    if (!this.highlighter) {
      throw new Error('Highlighter not initialized');
    }

    const shikiTheme = this.mapThemeToShiki(theme);

    if (!this.loadedThemes.has(shikiTheme)) {
      try {
        await this.highlighter.loadTheme(shikiTheme as BundledTheme);
        this.loadedThemes.add(shikiTheme);
      } catch (error) {
        console.warn(`Failed to load theme ${shikiTheme}:`, error);
      }
    }

    return theme;
  }

  /**
   * Checks if a language is supported.
   * @param language The language to check.
   * @returns True if the language is supported, otherwise false.
   */
  public isLanguageSupported(language: string): boolean {
    if (!language || language.trim() === '') {
      return false;
    }

    const supportedLanguages = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'csharp',
      'html', 'css', 'json', 'yaml', 'xml', 'sql', 'bash', 'shell',
      'markdown', 'plaintext', 'text'
    ];

    return supportedLanguages.includes(language) || this.loadedLanguages.has(language);
  }

  /**
   * Gets a theme by its ID.
   * @param themeId The ID of the theme.
   * @returns A promise resolving to the Theme object.
   */
  public async getTheme(themeId: ThemeId): Promise<Theme> {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    return theme;
  }

  /**
   * Initializes the default available themes.
   */
  private initializeDefaultThemes(): void {
    const themes: Array<[ThemeId, Theme]> = [
      ['vs-code-dark', {
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
          punctuation: '#d4d4d4'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['vs-code-light', {
        id: 'vs-code-light',
        name: 'VS Code Light',
        background: '#ffffff',
        foreground: '#000000',
        colors: {
          keyword: '#0000ff',
          string: '#a31515',
          comment: '#008000',
          number: '#098658',
          operator: '#000000',
          function: '#795e26',
          variable: '#001080',
          type: '#267f99',
          constant: '#0070c1',
          punctuation: '#000000'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['github-dark', {
        id: 'github-dark',
        name: 'GitHub Dark',
        background: '#0d1117',
        foreground: '#c9d1d9',
        colors: {
          keyword: '#ff7b72',
          string: '#a5c261',
          comment: '#8b949e',
          number: '#79c0ff',
          operator: '#c9d1d9',
          function: '#d2a8ff',
          variable: '#ffa657',
          type: '#7ee787',
          constant: '#79c0ff',
          punctuation: '#c9d1d9'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['github-light', {
        id: 'github-light',
        name: 'GitHub Light',
        background: '#ffffff',
        foreground: '#24292f',
        colors: {
          keyword: '#cf222e',
          string: '#032f62',
          comment: '#6e7781',
          number: '#0550ae',
          operator: '#24292f',
          function: '#8250df',
          variable: '#e36209',
          type: '#116329',
          constant: '#0550ae',
          punctuation: '#24292f'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['dracula', {
        id: 'dracula',
        name: 'Dracula',
        background: '#282a36',
        foreground: '#f8f8f2',
        colors: {
          keyword: '#ff79c6',
          string: '#f1fa8c',
          comment: '#6272a4',
          number: '#bd93f9',
          operator: '#ff79c6',
          function: '#50fa7b',
          variable: '#8be9fd',
          type: '#8be9fd',
          constant: '#bd93f9',
          punctuation: '#f8f8f2'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['monokai', {
        id: 'monokai',
        name: 'Monokai',
        background: '#272822',
        foreground: '#f8f8f2',
        colors: {
          keyword: '#f92672',
          string: '#e6db74',
          comment: '#75715e',
          number: '#ae81ff',
          operator: '#f92672',
          function: '#a6e22e',
          variable: '#f8f8f2',
          type: '#66d9ef',
          constant: '#ae81ff',
          punctuation: '#f8f8f2'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['solarized-dark', {
        id: 'solarized-dark',
        name: 'Solarized Dark',
        background: '#002b36',
        foreground: '#839496',
        colors: {
          keyword: '#859900',
          string: '#2aa198',
          comment: '#586e75',
          number: '#d33682',
          operator: '#859900',
          function: '#268bd2',
          variable: '#b58900',
          type: '#268bd2',
          constant: '#d33682',
          punctuation: '#839496'
        },
        windowStyle: 'macos',
        isPreset: true
      }],
      ['solarized-light', {
        id: 'solarized-light',
        name: 'Solarized Light',
        background: '#fdf6e3',
        foreground: '#657b83',
        colors: {
          keyword: '#859900',
          string: '#2aa198',
          comment: '#93a1a1',
          number: '#d33682',
          operator: '#859900',
          function: '#268bd2',
          variable: '#b58900',
          type: '#268bd2',
          constant: '#d33682',
          punctuation: '#657b83'
        },
        windowStyle: 'macos',
        isPreset: true
      }]
    ];

    themes.forEach(([id, theme]) => {
      this.availableThemes.set(id, theme);
    });
  }

  /**
   * Maps a custom theme ID to a Shiki theme name.
   */
  private mapThemeToShiki(theme: Theme): string {
    const themeMap: Record<string, string> = {
      'vs-code-dark': 'dark-plus',
      'vs-code-light': 'light-plus',
      'github-dark': 'github-dark',
      'github-light': 'github-light',
      'dracula': 'dracula',
      'monokai': 'monokai',
      'solarized-dark': 'solarized-dark',
      'solarized-light': 'solarized-light'
    };

    return themeMap[theme.id] || 'dark-plus';
  }

  /**
   * Creates a fallback highlight for when Shiki fails to load or highlight.
   * @param code The code to display.
   * @param theme The theme to use for fallback styling.
   * @returns An HTML string with basic formatting.
   */
  private createFallbackHighlight(code: string, theme: Theme): string {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return `
      <pre style="background-color: ${theme.background}; color: ${theme.foreground}; padding: 1rem; border-radius: 0.375rem; overflow-x: auto;">
        <code>${escapedCode}</code>
      </pre>
    `;
  }

  /**
   * Gets the display name for a language.
   * @param lang The language ID.
   * @returns The user-friendly name of the language.
   */
  private getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'csharp': 'C#',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'xml': 'XML',
      'sql': 'SQL',
      'bash': 'Bash',
      'shell': 'Shell',
      'markdown': 'Markdown',
      'plaintext': 'Plain Text'
    };

    return displayNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  /**
   * Gets aliases for a language.
   * @param lang The language ID.
   * @returns An array of string aliases.
   */
  private getLanguageAliases(lang: string): string[] {
    const aliases: Record<string, string[]> = {
      'javascript': ['js', 'jsx'],
      'typescript': ['ts', 'tsx'],
      'python': ['py'],
      'cpp': ['c++', 'cxx'],
      'csharp': ['cs', 'c#'],
      'bash': ['sh'],
      'plaintext': ['text', 'txt']
    };

    return aliases[lang] || [];
  }

  /**
   * Gets file extensions for a language.
   * @param lang The language ID.
   * @returns An array of file extensions.
   */
  private getLanguageExtensions(lang: string): string[] {
    const extensions: Record<string, string[]> = {
      'javascript': ['.js', '.jsx', '.mjs'],
      'typescript': ['.ts', '.tsx'],
      'python': ['.py', '.pyw'],
      'java': ['.java'],
      'cpp': ['.cpp', '.cxx', '.cc'],
      'c': ['.c', '.h'],
      'go': ['.go'],
      'rust': ['.rs'],
      'php': ['.php'],
      'ruby': ['.rb'],
      'swift': ['.swift'],
      'kotlin': ['.kt'],
      'csharp': ['.cs'],
      'html': ['.html', '.htm'],
      'css': ['.css'],
      'json': ['.json'],
      'yaml': ['.yaml', '.yml'],
      'xml': [''],
      'sql': ['.sql'],
      'bash': ['.sh', '.bash'],
      'markdown': ['.md', '.markdown']
    };

    return extensions[lang] || [];
  }

  /**
   * Gets MIME types for a language.
   * @param lang The language ID.
   * @returns An array of MIME types.
   */
  private getLanguageMimeTypes(lang: string): string[] {
    const mimeTypes: Record<string, string[]> = {
      'javascript': ['application/javascript', 'text/javascript'],
      'typescript': ['application/typescript'],
      'python': ['text/x-python'],
      'java': ['text/x-java-source'],
      'cpp': ['text/x-c++src'],
      'c': ['text/x-csrc'],
      'html': ['text/html'],
      'css': ['text/css'],
      'json': ['application/json'],
      'xml': ['application/xml', 'text/xml'],
      'sql': ['application/sql']
    };

    return mimeTypes[lang] || [];
  }
}

/**
 * Factory function to create the highlight service instance.
 */
export function createHighlightService(): HighlightService {
  return HighlightServiceImpl.getInstance();
}
