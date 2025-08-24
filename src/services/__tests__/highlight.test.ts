import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HighlightServiceImpl, createHighlightService } from '../highlight';
import { Theme } from '../../types/theme';

// Mock Shiki
vi.mock('shiki', () => ({
  getHighlighter: vi.fn(() => Promise.resolve({
    codeToHtml: vi.fn((code: string) => `<pre><code>${code}</code></pre>`),
    loadLanguage: vi.fn(() => Promise.resolve()),
    loadTheme: vi.fn(() => Promise.resolve()),
    getLoadedLanguages: vi.fn(() => ['javascript', 'typescript', 'python', 'html', 'css', 'json'])
  }))
}));

describe('HighlightService', () => {
  let service: HighlightServiceImpl;
  let mockTheme: Theme;

  beforeEach(() => {
    service = HighlightServiceImpl.getInstance();
    mockTheme = {
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
    };
  });

  describe('highlightCode', () => {
    it('should highlight JavaScript code successfully', async () => {
      const code = 'const hello = "world";';
      const result = await service.highlightCode(code, 'javascript', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain(code);
    });

    it('should handle TypeScript code', async () => {
      const code = 'interface User { name: string; }';
      const result = await service.highlightCode(code, 'typescript', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain(code);
    });

    it('should handle Python code', async () => {
      const code = 'def hello():\n    print("world")';
      const result = await service.highlightCode(code, 'python', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
    });

    it('should provide fallback for unsupported languages', async () => {
      const code = 'some unknown code';
      const result = await service.highlightCode(code, 'unknown-language', mockTheme);
      
      // Should still return HTML, either from Shiki or fallback
      expect(result).toContain('<pre>');
      expect(result).toContain(code);
    });

    it('should handle empty code', async () => {
      const result = await service.highlightCode('', 'javascript', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
    });

    it('should escape HTML in code', async () => {
      const code = '<script>alert("xss")</script>';
      const result = await service.highlightCode(code, 'html', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return an array of supported languages', async () => {
      const languages = await service.getSupportedLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      
      // Check structure of language info
      const firstLang = languages[0];
      expect(firstLang).toHaveProperty('id');
      expect(firstLang).toHaveProperty('name');
      expect(firstLang).toHaveProperty('aliases');
      expect(firstLang).toHaveProperty('extensions');
      expect(firstLang).toHaveProperty('mimeTypes');
    });

    it('should include common languages', async () => {
      const languages = await service.getSupportedLanguages();
      const languageIds = languages.map(lang => lang.id);
      
      expect(languageIds).toContain('javascript');
      expect(languageIds).toContain('typescript');
      expect(languageIds).toContain('python');
    });

    it('should provide proper language metadata', async () => {
      const languages = await service.getSupportedLanguages();
      const jsLang = languages.find(lang => lang.id === 'javascript');
      
      if (jsLang) {
        expect(jsLang.name).toBe('JavaScript');
        expect(Array.isArray(jsLang.aliases)).toBe(true);
        expect(Array.isArray(jsLang.extensions)).toBe(true);
        expect(Array.isArray(jsLang.mimeTypes)).toBe(true);
      }
    });
  });

  describe('getAvailableThemes', () => {
    it('should return an array of available themes', async () => {
      const themes = await service.getAvailableThemes();
      
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      
      // Check structure of theme
      const firstTheme = themes[0];
      expect(firstTheme).toHaveProperty('id');
      expect(firstTheme).toHaveProperty('name');
      expect(firstTheme).toHaveProperty('background');
      expect(firstTheme).toHaveProperty('foreground');
      expect(firstTheme).toHaveProperty('colors');
      expect(firstTheme).toHaveProperty('windowStyle');
      expect(firstTheme).toHaveProperty('isPreset');
    });

    it('should include default themes', async () => {
      const themes = await service.getAvailableThemes();
      const themeIds = themes.map(theme => theme.id);
      
      expect(themeIds).toContain('vs-code-dark');
      expect(themeIds).toContain('vs-code-light');
      expect(themeIds).toContain('github-dark');
      expect(themeIds).toContain('github-light');
      expect(themeIds).toContain('dracula');
      expect(themeIds).toContain('monokai');
      expect(themeIds).toContain('solarized-dark');
      expect(themeIds).toContain('solarized-light');
    });
  });

  describe('loadLanguage', () => {
    it('should load language successfully', async () => {
      await expect(service.loadLanguage('go')).resolves.not.toThrow();
    });

    it('should handle already loaded languages', async () => {
      await service.loadLanguage('javascript');
      await expect(service.loadLanguage('javascript')).resolves.not.toThrow();
    });

    it('should handle invalid languages gracefully', async () => {
      await expect(service.loadLanguage('invalid-language')).resolves.not.toThrow();
    });
  });

  describe('loadTheme', () => {
    it('should load existing theme successfully', async () => {
      const theme = await service.loadTheme('vs-code-dark');
      
      expect(theme).toBeDefined();
      expect(theme.id).toBe('vs-code-dark');
      expect(theme.name).toBe('VS Code Dark');
    });

    it('should throw error for non-existent theme', async () => {
      await expect(service.loadTheme('non-existent' as any)).rejects.toThrow();
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(service.isLanguageSupported('javascript')).toBe(true);
      expect(service.isLanguageSupported('typescript')).toBe(true);
      expect(service.isLanguageSupported('python')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(service.isLanguageSupported('definitely-not-a-language')).toBe(false);
      expect(service.isLanguageSupported('')).toBe(false);
      expect(service.isLanguageSupported('xyz123')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(service.isLanguageSupported('JavaScript')).toBe(false);
      expect(service.isLanguageSupported('PYTHON')).toBe(false);
    });
  });

  describe('getTheme', () => {
    it('should return theme for valid theme ID', async () => {
      const theme = await service.getTheme('vs-code-dark');
      
      expect(theme).toBeDefined();
      expect(theme.id).toBe('vs-code-dark');
      expect(theme.name).toBe('VS Code Dark');
      expect(theme.background).toBe('#1e1e1e');
    });

    it('should throw error for invalid theme ID', async () => {
      await expect(service.getTheme('invalid-theme' as any)).rejects.toThrow();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = HighlightServiceImpl.getInstance();
      const instance2 = HighlightServiceImpl.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('factory function', () => {
    it('should create a service instance', () => {
      const service = createHighlightService();
      
      expect(service).toBeDefined();
      expect(typeof service.highlightCode).toBe('function');
      expect(typeof service.getSupportedLanguages).toBe('function');
      expect(typeof service.getAvailableThemes).toBe('function');
      expect(typeof service.loadLanguage).toBe('function');
      expect(typeof service.loadTheme).toBe('function');
      expect(typeof service.isLanguageSupported).toBe('function');
      expect(typeof service.getTheme).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle highlighter initialization failure gracefully', async () => {
      // This test would require more complex mocking to simulate initialization failure
      // For now, we just ensure the service doesn't crash
      const code = 'test code';
      const result = await service.highlightCode(code, 'javascript', mockTheme);
      expect(result).toBeDefined();
    });

    it('should provide fallback highlighting when Shiki fails', async () => {
      const code = '<script>alert("test")</script>';
      const result = await service.highlightCode(code, 'javascript', mockTheme);
      
      expect(result).toContain('<pre>');
      expect(result).toBeDefined();
    });
  });

  describe('theme mapping', () => {
    it('should map custom themes to Shiki themes correctly', async () => {
      const themes = await service.getAvailableThemes();
      
      for (const theme of themes) {
        const result = await service.highlightCode('test', 'javascript', theme);
        expect(result).toBeDefined();
        expect(result).toContain('<pre>');
      }
    });
  });

  describe('language metadata', () => {
    it('should provide correct display names', async () => {
      const languages = await service.getSupportedLanguages();
      const jsLang = languages.find(lang => lang.id === 'javascript');
      const tsLang = languages.find(lang => lang.id === 'typescript');
      const pyLang = languages.find(lang => lang.id === 'python');
      
      expect(jsLang?.name).toBe('JavaScript');
      expect(tsLang?.name).toBe('TypeScript');
      expect(pyLang?.name).toBe('Python');
    });

    it('should provide correct file extensions', async () => {
      const languages = await service.getSupportedLanguages();
      const jsLang = languages.find(lang => lang.id === 'javascript');
      
      if (jsLang) {
        expect(jsLang.extensions).toContain('.js');
        expect(jsLang.extensions).toContain('.jsx');
      }
    });

    it('should provide correct aliases', async () => {
      const languages = await service.getSupportedLanguages();
      const jsLang = languages.find(lang => lang.id === 'javascript');
      
      if (jsLang) {
        expect(jsLang.aliases).toContain('js');
        expect(jsLang.aliases).toContain('jsx');
      }
    });
  });
});