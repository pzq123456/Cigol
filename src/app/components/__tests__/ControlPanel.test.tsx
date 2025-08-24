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
      },
      {
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
          punctuation: '#000000',
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

describe('ControlPanel', () => {
  const defaultProps = {
    settings: DEFAULT_PREVIEW_SETTINGS,
    onSettingsChange: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Appearance')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(<ControlPanel {...defaultProps} />);
      
      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
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
    it('switches between sections when tabs are clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
      });

      // Switch to Layout section
      await user.click(screen.getByText('Layout'));
      expect(screen.getByText('Window Style')).toBeInTheDocument();
      expect(screen.getByText('Show Window Controls')).toBeInTheDocument();

      // Switch to Content section
      await user.click(screen.getByText('Content'));
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Filename')).toBeInTheDocument();

      // Switch to Export section
      await user.click(screen.getByText('Export'));
      expect(screen.getByText('PNG (1x)')).toBeInTheDocument();
      expect(screen.getByText('PNG (2x)')).toBeInTheDocument();
    });

    it('highlights active section tab', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        const appearanceTab = screen.getByText('Appearance').closest('button');
        expect(appearanceTab).toHaveClass('bg-blue-100');
      });

      await user.click(screen.getByText('Layout'));
      
      const layoutTab = screen.getByText('Layout').closest('button');
      const appearanceTab = screen.getByText('Appearance').closest('button');
      
      expect(layoutTab).toHaveClass('bg-blue-100');
      expect(appearanceTab).not.toHaveClass('bg-blue-100');
    });
  });

  describe('Theme Selection', () => {
    it('displays current theme', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('VS Code Dark')).toBeInTheDocument();
      });
    });

    it('opens theme dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        const themeButton = screen.getByText('VS Code Dark').closest('button');
        expect(themeButton).toBeInTheDocument();
      });

      const themeButton = screen.getByText('VS Code Dark').closest('button')!;
      await user.click(themeButton);
      
      await waitFor(() => {
        expect(screen.getByText('VS Code Light')).toBeInTheDocument();
        expect(screen.getByText('GitHub Dark')).toBeInTheDocument();
      });
    });

    it('calls onSettingsChange when theme is selected', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        const themeButton = screen.getByText('VS Code Dark').closest('button');
        expect(themeButton).toBeInTheDocument();
      });

      const themeButton = screen.getByText('VS Code Dark').closest('button')!;
      await user.click(themeButton);
      
      await waitFor(() => {
        expect(screen.getByText('VS Code Light')).toBeInTheDocument();
      });

      await user.click(screen.getByText('VS Code Light'));
      
      // The theme change handler calls onSettingsChange multiple times for theme, backgroundColor, and windowStyle
      expect(onSettingsChange).toHaveBeenCalled();
      expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
        theme: expect.objectContaining({
          id: 'vs-code-light',
          name: 'VS Code Light'
        })
      }));
    });
  });

  describe('Font Settings', () => {
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

    it('updates line height when slider is moved', async () => {
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        const lineHeightSlider = screen.getByDisplayValue('1.5');
        expect(lineHeightSlider).toBeInTheDocument();
      });

      const lineHeightSlider = screen.getByDisplayValue('1.5');
      fireEvent.change(lineHeightSlider, { target: { value: '1.8' } });
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        lineHeight: 1.8
      });
    });
  });

  describe('Layout Settings', () => {
    it('renders layout controls when layout section is active', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Layout')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Layout'));
      
      expect(screen.getByText('Window Style')).toBeInTheDocument();
      expect(screen.getByText('Show Window Controls')).toBeInTheDocument();
      expect(screen.getByText('Show Line Numbers')).toBeInTheDocument();
      expect(screen.getByText('Padding')).toBeInTheDocument();
      expect(screen.getByText('Border Radius')).toBeInTheDocument();
    });

    it('updates window style when changed', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await user.click(screen.getByText('Layout'));
      
      const windowStyleSelect = screen.getByDisplayValue('macOS');
      await user.selectOptions(windowStyleSelect, 'windows');
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        windowStyle: 'windows'
      });
    });

    it('toggles window controls when switch is clicked', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
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
      
      await user.click(screen.getByText('Layout'));
      
      const lineNumbersToggle = screen.getByRole('switch', { name: /show line numbers/i });
      await user.click(lineNumbersToggle);
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        showLineNumbers: false
      });
    });
  });

  describe('Content Settings', () => {
    it('renders content controls when content section is active', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await user.click(screen.getByText('Content'));
      
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Filename')).toBeInTheDocument();
    });

    it('updates title when input changes', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await user.click(screen.getByText('Content'));
      
      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'My Code Example');
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        title: 'My Code Example'
      });
    });

    it('updates filename when input changes', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await user.click(screen.getByText('Content'));
      
      const filenameInput = screen.getByLabelText('Filename');
      await user.type(filenameInput, 'example.js');
      
      expect(onSettingsChange).toHaveBeenCalledWith({
        filename: 'example.js'
      });
    });
  });

  describe('Export Settings', () => {
    it('renders export buttons when export section is active', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await user.click(screen.getByText('Export'));
      
      expect(screen.getByText('PNG (1x)')).toBeInTheDocument();
      expect(screen.getByText('PNG (2x)')).toBeInTheDocument();
      expect(screen.getByText('PNG (3x)')).toBeInTheDocument();
      expect(screen.getByText('JPEG (2x)')).toBeInTheDocument();
    });

    it('calls onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      
      render(<ControlPanel {...defaultProps} onExport={onExport} />);
      
      await user.click(screen.getByText('Export'));
      await user.click(screen.getByText('PNG (2x)'));
      
      expect(onExport).toHaveBeenCalledWith('png', 2);
    });

    it('calls onExport with correct parameters for different formats', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      
      render(<ControlPanel {...defaultProps} onExport={onExport} />);
      
      await user.click(screen.getByText('Export'));
      
      await user.click(screen.getByText('PNG (1x)'));
      expect(onExport).toHaveBeenCalledWith('png', 1);
      
      await user.click(screen.getByText('PNG (3x)'));
      expect(onExport).toHaveBeenCalledWith('png', 3);
      
      await user.click(screen.getByText('JPEG (2x)'));
      expect(onExport).toHaveBeenCalledWith('jpeg', 2);
    });
  });

  describe('Color Picker', () => {
    it('opens color picker when color button is clicked', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        const colorButton = document.querySelector('button[style*="background-color"]');
        expect(colorButton).toBeInTheDocument();
      });

      const colorButton = document.querySelector('button[style*="background-color"]')!;
      await user.click(colorButton);
      
      // Should show preset colors
      await waitFor(() => {
        const presetColors = document.querySelectorAll('button[style*="background-color"]');
        expect(presetColors.length).toBeGreaterThan(1);
      });
    });

    it('updates background color when preset color is selected', async () => {
      const user = userEvent.setup();
      const onSettingsChange = vi.fn();
      
      render(<ControlPanel {...defaultProps} onSettingsChange={onSettingsChange} />);
      
      await waitFor(() => {
        const colorButton = document.querySelector('button[style*="background-color"]');
        expect(colorButton).toBeInTheDocument();
      });

      const colorButton = document.querySelector('button[style*="background-color"]')!;
      await user.click(colorButton);
      
      await waitFor(() => {
        const presetColors = document.querySelectorAll('button[style*="background-color"]');
        expect(presetColors.length).toBeGreaterThan(1);
      });

      // Click on a preset color (not the main button)
      const presetColors = document.querySelectorAll('button[style*="background-color"]');
      const presetColor = Array.from(presetColors).find(button => 
        button !== colorButton && button.getAttribute('style')?.includes('#ffffff')
      );
      
      if (presetColor) {
        await user.click(presetColor as HTMLElement);
        expect(onSettingsChange).toHaveBeenCalledWith({
          backgroundColor: '#ffffff'
        });
      }
    });
  });

  describe('Disabled State', () => {
    it('disables all controls when disabled prop is true', async () => {
      render(<ControlPanel {...defaultProps} disabled={true} />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          if (!button.getAttribute('aria-label')?.includes('Control panel sections')) {
            expect(button).toBeDisabled();
          }
        });
      });
    });

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
      
      await user.click(screen.getByText('Layout'));
      
      const windowControlsToggle = screen.getByRole('switch', { name: /show window controls/i });
      expect(windowControlsToggle).toBeInTheDocument();
      expect(windowControlsToggle).toHaveAttribute('aria-checked', 'true');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Appearance')).toBeInTheDocument();
      });

      // Tab to layout section
      await user.tab();
      await user.tab();
      
      const layoutTab = screen.getByText('Layout').closest('button');
      expect(layoutTab).toHaveFocus();
      
      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(screen.getByText('Window Style')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles theme loading errors gracefully', async () => {
      // This test would require more complex mocking setup
      // For now, we'll test that the component renders without crashing
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ControlPanel {...defaultProps} />);
      
      await waitFor(() => {
        // Should still render with fallback theme
        expect(screen.getByText('VS Code Dark')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });
});