import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager, createThemeManager } from '../theme-manager';
import { Theme, ThemeConfig } from '../../types/theme';

// Mock the HighlightService
vi.mock('../highlight', () => ({
  HighlightServiceImpl: {
    getInstance: vi.fn(() => ({
      getAvailableThemes: vi.fn(() => Promise.resolve([
        {
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
        },
        {
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
        }
      ])),
      getTheme: vi.fn((themeId: string) => Promise.resolve({
        id: themeId,
        name: 'Test Theme',
        background: '#000000',
        foreground: '#ffffff',
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
      })),
      loadTheme: vi.fn(() => Promise.resolve())
    }))
  }
}));

describe('ThemeManager', () => {
  let themeManager: ThemeManager;
  let mockTheme: Theme;

  beforeEach(() => {
    themeManager = ThemeManager.getInstance();
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

  describe('getAvailableThemes', () => {
    it('should return available themes', async () => {
      const themes = await themeManager.getAvailableThemes();
      
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toHaveProperty('id');
      expect(themes[0]).toHaveProperty('name');
    });
  });

  describe('getTheme', () => {
    it('should return theme by ID', async () => {
      const theme = await themeManager.getTheme('vs-code-dark');
      
      expect(theme).toBeDefined();
      expect(theme.id).toBe('vs-code-dark');
    });
  });

  describe('setCurrentTheme', () => {
    it('should set current theme and notify listeners', async () => {
      const mockCallback = vi.fn();
      themeManager.onThemeChange(mockCallback);
      
      await themeManager.setCurrentTheme('vs-code-dark');
      
      expect(themeManager.getCurrentTheme()).toBeDefined();
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('getCurrentTheme', () => {
    it('should return null initially', () => {
      const newManager = new (ThemeManager as any)();
      expect(newManager.getCurrentTheme()).toBeNull();
    });

    it('should return current theme after setting', async () => {
      await themeManager.setCurrentTheme('vs-code-dark');
      const currentTheme = themeManager.getCurrentTheme();
      
      expect(currentTheme).toBeDefined();
      expect(currentTheme?.id).toBe('vs-code-dark');
    });
  });

  describe('createCustomTheme', () => {
    it('should create custom theme from config', () => {
      const config: ThemeConfig = {
        name: 'My Custom Theme',
        background: '#000000',
        foreground: '#ffffff',
        colors: {
          keyword: '#ff0000',
          string: '#00ff00'
        },
        windowStyle: 'windows'
      };

      const customTheme = themeManager.createCustomTheme(config);
      
      expect(customTheme.name).toBe('My Custom Theme');
      expect(customTheme.background).toBe('#000000');
      expect(customTheme.foreground).toBe('#ffffff');
      expect(customTheme.colors.keyword).toBe('#ff0000');
      expect(customTheme.colors.string).toBe('#00ff00');
      expect(customTheme.windowStyle).toBe('windows');
      expect(customTheme.isPreset).toBe(false);
      expect(customTheme.id).toContain('custom-');
    });

    it('should use default colors for missing color properties', () => {
      const config: ThemeConfig = {
        name: 'Minimal Theme',
        background: '#000000',
        foreground: '#ffffff',
        colors: {}
      };

      const customTheme = themeManager.createCustomTheme(config);
      
      expect(customTheme.colors.keyword).toBe('#569cd6'); // default value
      expect(customTheme.colors.string).toBe('#ce9178'); // default value
    });
  });

  describe('applyThemeToPreview', () => {
    it('should apply theme styles to element', () => {
      const mockElement = {
        style: {
          backgroundColor: '',
          color: '',
          setProperty: vi.fn()
        },
        classList: {
          remove: vi.fn(),
          add: vi.fn()
        }
      } as any;

      themeManager.applyThemeToPreview(mockElement, mockTheme);
      
      expect(mockElement.style.backgroundColor).toBe('#1e1e1e');
      expect(mockElement.style.color).toBe('#d4d4d4');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--theme-background', '#1e1e1e');
      expect(mockElement.classList.add).toHaveBeenCalledWith('window-macos');
    });

    it('should handle null element gracefully', () => {
      expect(() => {
        themeManager.applyThemeToPreview(null as any, mockTheme);
      }).not.toThrow();
    });
  });

  describe('getThemeCategories', () => {
    it('should categorize themes correctly', async () => {
      const categories = await themeManager.getThemeCategories();
      
      expect(categories).toHaveProperty('VS Code');
      expect(categories).toHaveProperty('GitHub');
      expect(categories).toHaveProperty('Popular');
      expect(categories).toHaveProperty('Solarized');
      
      expect(Array.isArray(categories['VS Code'])).toBe(true);
      expect(Array.isArray(categories['GitHub'])).toBe(true);
    });
  });

  describe('getThemeContrastRatio', () => {
    it('should calculate contrast ratio', () => {
      const ratio = themeManager.getThemeContrastRatio(mockTheme);
      
      expect(typeof ratio).toBe('number');
      expect(ratio).toBeGreaterThan(0);
    });

    it('should handle high contrast themes', () => {
      const highContrastTheme: Theme = {
        ...mockTheme,
        background: '#000000',
        foreground: '#ffffff'
      };
      
      const ratio = themeManager.getThemeContrastRatio(highContrastTheme);
      expect(ratio).toBeGreaterThan(10); // High contrast
    });
  });

  describe('isThemeAccessible', () => {
    it('should return true for accessible themes', () => {
      const accessibleTheme: Theme = {
        ...mockTheme,
        background: '#000000',
        foreground: '#ffffff'
      };
      
      expect(themeManager.isThemeAccessible(accessibleTheme)).toBe(true);
    });

    it('should return false for low contrast themes', () => {
      const lowContrastTheme: Theme = {
        ...mockTheme,
        background: '#888888',
        foreground: '#999999'
      };
      
      expect(themeManager.isThemeAccessible(lowContrastTheme)).toBe(false);
    });
  });

  describe('onThemeChange', () => {
    it('should subscribe and unsubscribe to theme changes', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = themeManager.onThemeChange(mockCallback);
      
      await themeManager.setCurrentTheme('vs-code-dark');
      expect(mockCallback).toHaveBeenCalled();
      
      mockCallback.mockClear();
      unsubscribe();
      
      await themeManager.setCurrentTheme('github-light');
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle errors in listeners gracefully', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalCallback = vi.fn();
      
      themeManager.onThemeChange(errorCallback);
      themeManager.onThemeChange(normalCallback);
      
      await themeManager.setCurrentTheme('vs-code-dark');
      
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('getThemePreviewCSS', () => {
    it('should generate CSS for theme preview', () => {
      const css = themeManager.getThemePreviewCSS(mockTheme);
      
      expect(css).toContain('background-color: #1e1e1e');
      expect(css).toContain('color: #d4d4d4');
      expect(css).toContain('.keyword { color: #569cd6; }');
      expect(css).toContain('.string { color: #ce9178; }');
    });
  });

  describe('exportTheme', () => {
    it('should export theme as JSON string', () => {
      const exported = themeManager.exportTheme(mockTheme);
      
      expect(typeof exported).toBe('string');
      expect(() => JSON.parse(exported)).not.toThrow();
      
      const parsed = JSON.parse(exported);
      expect(parsed.id).toBe(mockTheme.id);
      expect(parsed.name).toBe(mockTheme.name);
    });
  });

  describe('importTheme', () => {
    it('should import theme from JSON string', () => {
      const themeJson = JSON.stringify(mockTheme);
      const imported = themeManager.importTheme(themeJson);
      
      expect(imported.id).toBe(mockTheme.id);
      expect(imported.name).toBe(mockTheme.name);
      expect(imported.background).toBe(mockTheme.background);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        themeManager.importTheme('invalid json');
      }).toThrow('Failed to import theme');
    });

    it('should throw error for invalid theme structure', () => {
      const invalidTheme = { id: 'test' }; // Missing required properties
      
      expect(() => {
        themeManager.importTheme(JSON.stringify(invalidTheme));
      }).toThrow('Failed to import theme');
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('factory function', () => {
    it('should create theme manager instance', () => {
      const manager = createThemeManager();
      
      expect(manager).toBeDefined();
      expect(typeof manager.getAvailableThemes).toBe('function');
      expect(typeof manager.setCurrentTheme).toBe('function');
      expect(typeof manager.createCustomTheme).toBe('function');
    });
  });
});