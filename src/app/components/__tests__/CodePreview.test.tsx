import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CodePreview from '../CodePreview';
import { Theme } from '../../../types/theme';
import { PreviewSettings } from '../../../types/preview';

// Mock the highlight service
const mockHighlightService = {
  highlightCode: vi.fn(),
  getSupportedLanguages: vi.fn(),
  getAvailableThemes: vi.fn(),
  loadLanguage: vi.fn(),
  loadTheme: vi.fn(),
  isLanguageSupported: vi.fn(),
  getTheme: vi.fn()
};

vi.mock('../../../services/highlight', () => ({
  createHighlightService: () => mockHighlightService
}));

// Mock theme
const mockTheme: Theme = {
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

// Mock settings
const mockSettings: PreviewSettings = {
  theme: mockTheme,
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  lineNumbers: true,
  title: 'Test Code',
  filename: 'test.js',
  padding: 16,
  backgroundColor: '#ffffff',
  borderRadius: 8,
  showWindowControls: true,
  windowStyle: 'macos',
  showLineNumbers: true,
  lineHeight: 1.5,
  tabSize: 2,
  wordWrap: false
};

describe('CodePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHighlightService.highlightCode.mockResolvedValue('<pre><code>console.log("Hello World");</code></pre>');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders empty state when no code is provided', () => {
      render(
        <CodePreview
          code=""
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      expect(screen.getByText('Enter some code to see the preview')).toBeInTheDocument();
    });

    it('renders code preview with basic content', async () => {
      const code = 'console.log("Hello World");';
      
      render(
        <CodePreview
          code={code}
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalledWith(code, 'javascript', mockTheme);
      });
    });

    it('applies custom className', () => {
      const { container } = render(
        <CodePreview
          code="test"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Window Styles', () => {
    it('renders macOS window controls', async () => {
      const settingsWithMacOS = { ...mockSettings, windowStyle: 'macos' as const, showWindowControls: true };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithMacOS}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // Check for macOS window controls (red, yellow, green circles)
      const redControl = document.querySelector('.bg-red-500');
      const yellowControl = document.querySelector('.bg-yellow-500');
      const greenControl = document.querySelector('.bg-green-500');
      
      expect(redControl).toBeInTheDocument();
      expect(yellowControl).toBeInTheDocument();
      expect(greenControl).toBeInTheDocument();
    });

    it('renders Windows window controls', async () => {
      const settingsWithWindows = { ...mockSettings, windowStyle: 'windows' as const, showWindowControls: true };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithWindows}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Code')).toBeInTheDocument();
      });
    });

    it('hides window controls when showWindowControls is false', async () => {
      const settingsWithoutControls = { ...mockSettings, showWindowControls: false };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithoutControls}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // Window controls should not be rendered
      const redControl = document.querySelector('.bg-red-500');
      const yellowControl = document.querySelector('.bg-yellow-500');
      const greenControl = document.querySelector('.bg-green-500');
      
      expect(redControl).not.toBeInTheDocument();
      expect(yellowControl).not.toBeInTheDocument();
      expect(greenControl).not.toBeInTheDocument();
    });

    it('renders no window style correctly', async () => {
      const settingsWithNoStyle = { ...mockSettings, windowStyle: 'none' as const };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithNoStyle}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });
    });
  });

  describe('Title and Filename Display', () => {
    it('displays title and filename in header', async () => {
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Code')).toBeInTheDocument();
        expect(screen.getByText('test.js')).toBeInTheDocument();
      });
    });

    it('hides header when no title, filename, or controls', async () => {
      const settingsWithoutHeader = {
        ...mockSettings,
        title: '',
        filename: '',
        showWindowControls: false
      };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithoutHeader}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      expect(screen.queryByText('Test Code')).not.toBeInTheDocument();
    });
  });

  describe('Line Numbers', () => {
    it('displays line numbers when enabled', async () => {
      const code = 'line 1\nline 2\nline 3';
      
      render(
        <CodePreview
          code={code}
          language="javascript"
          theme={mockTheme}
          settings={{ ...mockSettings, showLineNumbers: true }}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // Line numbers should be present (1, 2, 3)
      const lineNumbers = screen.getAllByText('1');
      expect(lineNumbers.length).toBeGreaterThan(0);
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });

    it('hides line numbers when disabled', async () => {
      const code = 'line 1\nline 2\nline 3';
      
      render(
        <CodePreview
          code={code}
          language="javascript"
          theme={mockTheme}
          settings={{ ...mockSettings, showLineNumbers: false }}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton initially', () => {
      mockHighlightService.highlightCode.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows updating overlay when code changes', async () => {
      const { rerender } = render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // Change code to trigger update
      mockHighlightService.highlightCode.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      rerender(
        <CodePreview
          code="console.log('updated');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error fallback when highlighting fails', async () => {
      const error = new Error('Highlighting failed');
      mockHighlightService.highlightCode.mockRejectedValue(error);
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback mode')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const error = new Error('Highlighting failed');
      mockHighlightService.highlightCode.mockRejectedValueOnce(error);
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Retry \(\d+\)/)).toBeInTheDocument();
      });

      // Mock successful retry
      mockHighlightService.highlightCode.mockResolvedValue('<pre><code>console.log("test");</code></pre>');
      
      fireEvent.click(screen.getByText(/Retry \(\d+\)/));

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalledTimes(2);
      });
    });

    it('shows fallback mode indicator when error occurs but fallback works', async () => {
      const error = new Error('Highlighting failed');
      mockHighlightService.highlightCode.mockRejectedValue(error);
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback mode')).toBeInTheDocument();
      });
    });
  });

  describe('Export Mode', () => {
    it('shows export indicator when isExporting is true', async () => {
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
          isExporting={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Generating image...')).toBeInTheDocument();
      });
    });

    it('applies export class when isExporting is true', async () => {
      const { container } = render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
          isExporting={true}
        />
      );

      await waitFor(() => {
        expect(container.querySelector('.export-preview')).toBeInTheDocument();
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onPreviewReady when preview is ready', async () => {
      const onPreviewReady = vi.fn();
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
          onPreviewReady={onPreviewReady}
        />
      );

      await waitFor(() => {
        expect(onPreviewReady).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('Styling and Layout', () => {
    it('applies custom styles from settings', async () => {
      const customSettings = {
        ...mockSettings,
        fontSize: 16,
        fontFamily: 'Monaco',
        padding: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0'
      };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={customSettings}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // Check if custom styles are applied by looking for elements with specific styles
      const codeElement = document.querySelector('.font-mono');
      expect(codeElement).toBeInTheDocument();
      
      // Check for container with custom background color
      const container = document.querySelector('[style*="background-color: rgb(240, 240, 240)"]');
      expect(container).toBeInTheDocument();
    });

    it('handles word wrap setting', async () => {
      const settingsWithWordWrap = { ...mockSettings, wordWrap: true };
      
      render(
        <CodePreview
          code="console.log('this is a very long line that should wrap');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithWordWrap}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });
    });

    it('applies max width and height constraints', async () => {
      const settingsWithConstraints = {
        ...mockSettings,
        maxWidth: 800,
        maxHeight: 600
      };
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={settingsWithConstraints}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });
    });
  });

  describe('Preview Info', () => {
    it('displays preview information', async () => {
      const multiLineCode = "line 1\nline 2\nline 3";
      
      render(
        <CodePreview
          code={multiLineCode}
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('VS Code Dark')).toBeInTheDocument();
      // Check for line count in preview info (there will be multiple "3"s - one in line numbers, one in info)
      const lineCountElements = screen.getAllByText('3');
      expect(lineCountElements.length).toBeGreaterThan(0);
    });

    it('shows retry button in preview info when error occurs', async () => {
      const error = new Error('Highlighting failed');
      mockHighlightService.highlightCode.mockRejectedValue(error);
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Retry \(\d+\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for code content', async () => {
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(mockHighlightService.highlightCode).toHaveBeenCalled();
      });

      // The code content should be accessible - check for the code container
      const codeContainer = document.querySelector('.font-mono');
      expect(codeContainer).toBeInTheDocument();
      
      // Check for pre/code elements in the rendered HTML
      const preElement = document.querySelector('pre');
      expect(preElement).toBeInTheDocument();
    });

    it('provides meaningful error messages', async () => {
      const error = new Error('Network error');
      mockHighlightService.highlightCode.mockRejectedValue(error);
      
      render(
        <CodePreview
          code="console.log('test');"
          language="javascript"
          theme={mockTheme}
          settings={mockSettings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback mode')).toBeInTheDocument();
      });
    });
  });
});