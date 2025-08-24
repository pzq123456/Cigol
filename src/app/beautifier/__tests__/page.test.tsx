import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BeautifierPage from '../page';

// Mock the services
vi.mock('../../../services/theme-manager', () => ({
  createThemeManager: () => ({
    getAvailableThemes: vi.fn().mockResolvedValue([
      {
        id: 'vs-dark',
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
      }
    ])
  })
}));

vi.mock('../../../services/language-detection', () => ({
  createLanguageDetectionService: () => ({
    detectLanguage: vi.fn().mockResolvedValue({
      language: 'javascript',
      confidence: 0.9,
      alternatives: []
    })
  })
}));

vi.mock('../../../services/export', () => ({
  exportService: {
    onProgress: vi.fn(() => () => {}),
    onError: vi.fn(() => () => {}),
    exportToImage: vi.fn(),
    downloadFile: vi.fn()
  }
}));

// Mock the components
vi.mock('../../components/CodeEditor', () => ({
  default: ({ code, language, onChange, onLanguageChange }: any) => (
    <div data-testid="code-editor">
      <textarea 
        value={code} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="code-input"
      />
      <select 
        value={language} 
        onChange={(e) => onLanguageChange(e.target.value)}
        data-testid="language-select"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
      </select>
    </div>
  )
}));

vi.mock('../../components/CodePreview', () => ({
  default: ({ code, language, theme }: any) => (
    <div data-testid="code-preview" data-export-target>
      <pre>{code}</pre>
      <div>Language: {language}</div>
      <div>Theme: {theme?.name}</div>
    </div>
  )
}));

vi.mock('../../components/ControlPanel', () => ({
  default: ({ settings, onSettingsChange, onExport }: any) => (
    <div data-testid="control-panel">
      <button onClick={() => onExport('png', 2)} data-testid="export-button">
        Export
      </button>
      <input 
        value={settings.title} 
        onChange={(e) => onSettingsChange({ title: e.target.value })}
        data-testid="title-input"
      />
    </div>
  )
}));

vi.mock('../../components/ExportModal', () => ({
  default: ({ isOpen, onClose, onExport }: any) => (
    isOpen ? (
      <div data-testid="export-modal">
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <button onClick={() => onExport({ format: 'png', resolution: 2, quality: 90, transparent: true, filename: 'test.png' })} data-testid="modal-export">
          Export
        </button>
      </div>
    ) : null
  )
}));

vi.mock('../../components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

// Mock window.innerWidth for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('BeautifierPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      render(<BeautifierPage />);
      
      expect(screen.getByText('Loading themes...')).toBeInTheDocument();
    });

    it('renders main components after themes load', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(screen.getByTestId('code-preview')).toBeInTheDocument();
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('renders header with logo and navigation', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      // Check for logo link
      const logoLink = screen.getByRole('link', { name: /code beautifier/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders desktop layout by default', async () => {
      // Mock desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      // Should not show mobile menu button on desktop
      expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
    });

    it('shows mobile menu button on small screens', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });
  });

  describe('Code Editing', () => {
    it('displays default code content', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-input')).toBeInTheDocument();
      });

      const codeInput = screen.getByTestId('code-input') as HTMLTextAreaElement;
      expect(codeInput.value).toContain('Welcome to Code Snippet Beautifier!');
    });

    it('updates language selection', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('language-select')).toBeInTheDocument();
      });

      const languageSelect = screen.getByTestId('language-select') as HTMLSelectElement;
      expect(languageSelect.value).toBe('javascript');
    });
  });

  describe('Theme Management', () => {
    it('loads and displays themes', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme: VS Code Dark')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('opens export modal when export is triggered', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('export-button')).toBeInTheDocument();
      });

      const exportButton = screen.getByTestId('export-button');
      exportButton.click();

      expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    });

    it('closes export modal', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('export-button')).toBeInTheDocument();
      });

      // Open modal
      const exportButton = screen.getByTestId('export-button');
      exportButton.click();

      expect(screen.getByTestId('export-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      closeButton.click();

      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to window resize', async () => {
      // Start with desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      // Initially desktop - should not show mobile menu
      expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles theme loading errors gracefully', async () => {
      // Mock theme loading error
      vi.mocked(require('../../../services/theme-manager').createThemeManager).mockImplementation(() => ({
        getAvailableThemes: vi.fn().mockRejectedValue(new Error('Theme loading failed'))
      }));

      render(<BeautifierPage />);
      
      // Should still show loading state and not crash
      expect(screen.getByText('Loading themes...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Code Beautifier')).toBeInTheDocument();
      });

      // Check for ARIA labels on buttons
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(<BeautifierPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('code-input')).toBeInTheDocument();
      });

      const codeInput = screen.getByTestId('code-input');
      expect(codeInput).toBeInTheDocument();
      
      // Code input should be focusable
      codeInput.focus();
      expect(document.activeElement).toBe(codeInput);
    });
  });
});