import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers';
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

  public static getInstance(): HighlightServiceImpl {
    if (!HighlightServiceImpl.instance) {
      HighlightServiceImpl.instance = new HighlightServiceImpl();
    }
    return HighlightServiceImpl.instance;
  }

  private async initializeHighlighter(): Promise<void> {
    if (this.highlighter) return;

    try {
      this.highlighter = await createHighlighter({
        themes: ['dark-plus', 'light-plus', 'github-dark', 'github-light', 'dracula', 'monokai', 'solarized-dark', 'solarized-light'],
        langs: ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'markdown', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'csharp']
      });

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

  public async highlightCode(code: string, language: string, theme: Theme, dynamicFontClass?: string): Promise<string> {
    await this.initializeHighlighter();

    if (!this.highlighter) {
      throw new Error('Highlighter not initialized');
    }

    try {
      await this.loadLanguage(language);
      const shikiTheme = this.mapThemeToShiki(theme);

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

      // 增强 transformer，移除所有内联 font-family 样式并确保 dynamicFontClass 应用到 <pre> 和 <code>
      const fontRemoverTransformer = {
        name: 'font-style-remover',
        pre: (ast: any) => {
          if (ast.properties.style) {
            ast.properties.style = ast.properties.style.replace(/font-family:[^;]+;/g, '');
          }
          // 确保 dynamicFontClass 添加到 <pre> 标签
          if (dynamicFontClass) {
            ast.properties.class = ast.properties.class
              ? `${ast.properties.class} ${dynamicFontClass}`
              : dynamicFontClass;
          }
        },
        code: (ast: any) => {
          // 移除 <code> 标签上的内联 font-family 样式
          if (ast.properties.style) {
            ast.properties.style = ast.properties.style.replace(/font-family:[^;]+;/g, '');
          }
          // 将 dynamicFontClass 添加到 <code> 标签
          if (dynamicFontClass) {
            ast.properties.class = ast.properties.class
              ? `${ast.properties.class} ${dynamicFontClass}`
              : dynamicFontClass;
          }
        },
        span: (ast: any) => {
          // 移除 <span> 标签上的内联 font-family 样式
          if (ast.properties.style) {
            ast.properties.style = ast.properties.style.replace(/font-family:[^;]+;/g, '');
          }
        }
      };

      return this.highlighter.codeToHtml(code, {
        lang: language as BundledLanguage,
        theme: shikiTheme as BundledTheme,
        transformers: [
          transformerNotationDiff(),
          transformerNotationHighlight(),
          transformerNotationWordHighlight(),
          fontRemoverTransformer
        ]
      });

    } catch (error) {
      console.warn(`Failed to highlight code with language ${language}:`, error);
      return this.createFallbackHighlight(code, theme, dynamicFontClass);
    }
  }

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

  public async getAvailableThemes(): Promise<Theme[]> {
    return Array.from(this.availableThemes.values());
  }

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

  public async getTheme(themeId: ThemeId): Promise<Theme> {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    return theme;
  }

  private initializeDefaultThemes(): void {
    const themes: Array<[ThemeId, Theme]> = [
      ['vs-code-dark', { id: 'vs-code-dark', name: 'VS Code Dark', background: '#1e1e1e', foreground: '#d4d4d4', colors: { keyword: '#569cd6', string: '#ce9178', comment: '#6a9955', number: '#b5cea8', operator: '#d4d4d4', function: '#dcdcaa', variable: '#9cdcfe', type: '#4ec9b0', constant: '#4fc1ff', punctuation: '#d4d4d4' }, windowStyle: 'macos', isPreset: true }],
      ['vs-code-light', { id: 'vs-code-light', name: 'VS Code Light', background: '#ffffff', foreground: '#000000', colors: { keyword: '#0000ff', string: '#a31515', comment: '#008000', number: '#098658', operator: '#000000', function: '#795e26', variable: '#001080', type: '#267f99', constant: '#0070c1', punctuation: '#000000' }, windowStyle: 'macos', isPreset: true }],
      ['github-dark', { id: 'github-dark', name: 'GitHub Dark', background: '#0d1117', foreground: '#c9d1d9', colors: { keyword: '#ff7b72', string: '#a5c261', comment: '#8b949e', number: '#79c0ff', operator: '#c9d1d9', function: '#d2a8ff', variable: '#ffa657', type: '#7ee787', constant: '#79c0ff', punctuation: '#c9d1d9' }, windowStyle: 'macos', isPreset: true }],
      ['github-light', { id: 'github-light', name: 'GitHub Light', background: '#ffffff', foreground: '#24292f', colors: { keyword: '#cf222e', string: '#032f62', comment: '#6e7781', number: '#0550ae', operator: '#24292f', function: '#8250df', variable: '#e36209', type: '#116329', constant: '#0550ae', punctuation: '#24292f' }, windowStyle: 'macos', isPreset: true }],
      ['dracula', { id: 'dracula', name: 'Dracula', background: '#282a36', foreground: '#f8f8f2', colors: { keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', number: '#bd93f9', operator: '#ff79c6', function: '#50fa7b', variable: '#8be9fd', type: '#8be9fd', constant: '#bd93f9', punctuation: '#f8f8f2' }, windowStyle: 'macos', isPreset: true }],
      ['monokai', { id: 'monokai', name: 'Monokai', background: '#272822', foreground: '#f8f8f2', colors: { keyword: '#f92672', string: '#e6db74', comment: '#75715e', number: '#ae81ff', operator: '#f92672', function: '#a6e22e', variable: '#f8f8f2', type: '#66d9ef', constant: '#ae81ff', punctuation: '#f8f8f2' }, windowStyle: 'macos', isPreset: true }],
      ['solarized-dark', { id: 'solarized-dark', name: 'Solarized Dark', background: '#002b36', foreground: '#839496', colors: { keyword: '#859900', string: '#2aa198', comment: '#586e75', number: '#d33682', operator: '#859900', function: '#268bd2', variable: '#b58900', type: '#268bd2', constant: '#d33682', punctuation: '#839496' }, windowStyle: 'macos', isPreset: true }],
      ['solarized-light', { id: 'solarized-light', name: 'Solarized Light', background: '#fdf6e3', foreground: '#657b83', colors: { keyword: '#859900', string: '#2aa198', comment: '#93a1a1', number: '#d33682', operator: '#859900', function: '#268bd2', variable: '#b58900', type: '#268bd2', constant: '#d33682', punctuation: '#657b83' }, windowStyle: 'macos', isPreset: true }]
    ];
    themes.forEach(([id, theme]) => {
      this.availableThemes.set(id, theme);
    });
  }

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

  private createFallbackHighlight(code: string, theme: Theme, dynamicFontClass?: string): string {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const classAttribute = dynamicFontClass ? `class="${dynamicFontClass}"` : '';
    
    return `
      <pre ${classAttribute} style="background-color: ${theme.background}; color: ${theme.foreground}; padding: 1rem; border-radius: 0.375rem;">
        <code ${classAttribute}>${escapedCode}</code>
      </pre>
    `;
  }

  private getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
      'javascript': 'JavaScript', 'typescript': 'TypeScript', 'python': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'go': 'Go', 'rust': 'Rust', 'php': 'PHP', 'ruby': 'Ruby', 'swift': 'Swift', 'kotlin': 'Kotlin', 'csharp': 'C#', 'html': 'HTML', 'css': 'CSS', 'json': 'JSON', 'yaml': 'YAML', 'xml': 'XML', 'sql': 'SQL', 'bash': 'Bash', 'shell': 'Shell', 'markdown': 'Markdown', 'plaintext': 'Plain Text'
    };
    return displayNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  private getLanguageAliases(lang: string): string[] {
    const aliases: Record<string, string[]> = {
      'javascript': ['js', 'jsx'], 'typescript': ['ts', 'tsx'], 'python': ['py'], 'cpp': ['c++', 'cxx'], 'csharp': ['cs', 'c#'], 'bash': ['sh'], 'plaintext': ['text', 'txt']
    };
    return aliases[lang] || [];
  }

  private getLanguageExtensions(lang: string): string[] {
    const extensions: Record<string, string[]> = {
      'javascript': ['.js', '.jsx', '.mjs'], 'typescript': ['.ts', '.tsx'], 'python': ['.py', '.pyw'], 'java': ['.java'], 'cpp': ['.cpp', '.cxx', '.cc'], 'c': ['.c', '.h'], 'go': ['.go'], 'rust': ['.rs'], 'php': ['.php'], 'ruby': ['.rb'], 'swift': ['.swift'], 'kotlin': ['.kt'], 'csharp': ['.cs'], 'html': ['.html', '.htm'], 'css': ['.css'], 'json': ['.json'], 'yaml': ['.yaml', '.yml'], 'xml': [''], 'sql': ['.sql'], 'bash': ['.sh', '.bash'], 'markdown': ['.md', '.markdown']
    };
    return extensions[lang] || [];
  }

  private getLanguageMimeTypes(lang: string): string[] {
    const mimeTypes: Record<string, string[]> = {
      'javascript': ['application/javascript', 'text/javascript'], 'typescript': ['application/typescript'], 'python': ['text/x-python'], 'java': ['text/x-java-source'], 'cpp': ['text/x-c++src'], 'c': ['text/x-csrc'], 'go': ['text/x-go'], 'rust': ['text/rust'], 'php': ['application/x-httpd-php'], 'ruby': ['application/x-ruby'], 'swift': ['text/swift'], 'kotlin': ['text/x-kotlin'], 'csharp': ['text/x-csharp'], 'html': ['text/html'], 'css': ['text/css'], 'json': ['application/json'], 'yaml': ['text/x-yaml'], 'xml': ['application/xml'], 'sql': ['application/sql'], 'bash': ['application/x-sh'], 'markdown': ['text/markdown']
    };
    return mimeTypes[lang] || [];
  }
}

export function createHighlightService(): HighlightService {
  return HighlightServiceImpl.getInstance();
}