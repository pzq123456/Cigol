import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ControlPanel } from '../ControlPanel';
import { DEFAULT_PREVIEW_SETTINGS } from '../../../types/constants';

// Mock the theme manager
vi.mock('../../../services/theme-manager', () => ({
  createThemeManager: vi.fn(() => ({
    getAvailableThemes: vi.fn().mockResolvedValue([
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
          punctuation: '#d4d4d4',
        },
        windowStyle: 'macos',
        isPreset: true,
      }
    ]),
    getThemeCategories: vi.fn().mockResolvedValue({
      'VS Code': [
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
            punctuation: '#d4d4d4',
          },
          windowStyle: 'macos',
          isPreset: true,
        }
      ]
    })
  }))
}));

describe('ControlPanel - Simple Tests', () => {
  const defaultProps = {
    settings: DEFAULT_PREVIEW_SETTINGS,
    onSettingsChange: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Appearance')).toBeInTheDocument();
      });
    });

    it('renders all section tabs', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Appearance')).toBeInTheDocument();
        expect(screen.getByText('Layout')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('renders appearance section by default', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Background Color')).toBeInTheDocument();
        expect(screen.getByText('Font Family')).toBeInTheDocument();
        expect(screen.getByText('Font Size')).toBeInTheDocument();
        expect(screen.getByText('Line Height')).toBeInTheDocument();
      });
    });
  });

  describe('Section Navigation', () => {
    it('switches to layout section when clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Layout'));
      
      expect(screen.getByText('Window Style')).toBeInTheDocument();
      expect(screen.getByText('Show Window Controls')).toBeInTheDocument();
    });

    it('switches to content section when clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Content'));
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Filename')).toBeInTheDocument();
    });

    it('switches to export section when clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Export'));
      
      expect(screen.getByText('PNG (1x)')).toBeInTheDocument();
      expect(screen.getByText('PNG (2x)')).toBeInTheDocument();
      expect(screen.getByText('PNG (3x)')).toBeInTheDocument();
      expect(screen.getByText('JPEG (2x)')).toBeInTheDocument();
    });
  });

  describe('Font Settings', () => {
    it('updates font size when slider is moved', async () => {
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        const fontSizeSlider = screen.getByDisplayValue('14');
        expect(fontSizeSlider).toBeInTheDocument();
      });

      const fontSizeSlider = screen.getByDisplayValue('14');
      fireEvent.change(fontSizeSlider, { target: { value: '16' } });
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        fontSize: 16
      });
    });

    it('updates font family when changed', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('JetBrains Mono')).toBeInTheDocument();
      });

      const fontSelect = screen.getByDisplayValue('JetBrains Mono');
      await user.selectOptions(fontSelect, 'Fira Code');
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        fontFamily: 'Fira Code'
      });
    });
  });

  describe('Export Functionality', () => {
    it('calls onExport when PNG button is clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      
      render(<ControlPanel {...defaultProps} onExport={onExport} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Export'));
      await user.click(screen.getByText('PNG (2x)'));
      
      expect(onExport).toHaveBeenCalledWith('png', 2);
    });

    it('calls onExport with correct parameters for JPEG', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      
      render(<ControlPanel {...defaultProps} onExport={onExport} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Export'));
      await user.click(screen.getByText('JPEG (2x)'));
      
      expect(onExport).toHaveBeenCalledWith('jpeg', 2);
    });
  });

  describe('Content Settings', () => {
    it('updates title when input changes', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Content'));
      
      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'My Code Example');
      
      // Check that the function was called with the final value
      expect(onSettingsChange).toHaveBeenLastCalledWith({
        title: 'e' // Last character typed
      });
      
      // Check that it was called multiple times (once per character)
      expect(onSettingsChange).toHaveBeenCalledTimes(15);
    });

    it('updates filename when input changes', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Content'));
      
      const filenameInput = screen.getByLabelText('Filename');
      await user.type(filenameInput, 'example.js');
      
      // Check that the function was called with the final value
      expect(onSettingsChange).toHaveBeenLastCalledWith({
        filename: 's' // Last character typed
      });
      
      // Check that it was called multiple times (once per character)
      expect(onSettingsChange).toHaveBeenCalledTimes(10);
    });
  });

  describe('Layout Settings', () => {
    it('toggles window controls when switch is clicked', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Layout'));
      
      const windowControlsToggle = screen.getByRole('switch', { name: /show window controls/i });
      await user.click(windowControlsToggle);
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        showWindowControls: false
      });
    });

    it('toggles line numbers when switch is clicked', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Layout'));
      
      const lineNumbersToggle = screen.getByRole('switch', { name: /show line numbers/i });
      await user.click(lineNumbersToggle);
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        showLineNumbers: false
      });
    });
  });

  describe('Disabled State', () => {
    it('disables section navigation when disabled', async () => {
      render(<ControlPanel {...defaultProps} disabled={true} />);
      
      await waitFor(() => {
        const layoutTab = screen.getByText('Layout').closest('button');
        expect(layoutTab).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for controls', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Control panel sections' })).toBeInTheDocument();
      });
    });

    it('has proper role for toggle switches', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Layout'));
      
      const windowControlsToggle = screen.getByRole('switch', { name: /show window controls/i });
      expect(windowControlsToggle).toBeInTheDocument();
      expect(windowControlsToggle).toHaveAttribute('aria-checked', 'true');
    });
  });
});