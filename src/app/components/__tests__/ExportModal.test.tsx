import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportModal from '../ExportModal';
import { ExportOptions } from '../../../types/export';

// Mock props
const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onExport: vi.fn(),
  isExporting: false,
  exportProgress: 0
};

describe('ExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<ExportModal {...defaultProps} />);
      
      expect(screen.getByText('Export Image')).toBeInTheDocument();
      expect(screen.getByText('Format')).toBeInTheDocument();
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText('Filename')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<ExportModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Export Image')).not.toBeInTheDocument();
    });

    it('renders format options correctly', () => {
      render(<ExportModal {...defaultProps} />);
      
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('Lossless, supports transparency')).toBeInTheDocument();
      expect(screen.getByText('JPEG')).toBeInTheDocument();
      expect(screen.getByText('Smaller file size')).toBeInTheDocument();
    });

    it('renders resolution options correctly', () => {
      render(<ExportModal {...defaultProps} />);
      
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('3x')).toBeInTheDocument();
      expect(screen.getByText('Ultra')).toBeInTheDocument();
    });

    it('shows default filename', () => {
      render(<ExportModal {...defaultProps} />);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      expect(filenameInput).toBeInTheDocument();
      expect(screen.getByText('File will be saved as: code-snippet.png')).toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('selects PNG by default', () => {
      render(<ExportModal {...defaultProps} />);
      
      const pngButton = screen.getByText('PNG').closest('button');
      expect(pngButton).toHaveClass('border-blue-500');
    });

    it('switches to JPEG format when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      expect(jpegButton).toHaveClass('border-blue-500');
      expect(screen.getByText('File will be saved as: code-snippet.jpeg')).toBeInTheDocument();
    });

    it('shows quality slider for JPEG format', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Switch to JPEG
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);
      
      expect(screen.getByText('Quality: 90%')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('shows transparency option for PNG format', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);
      
      expect(screen.getByText('Transparent background')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('hides transparency option for JPEG format', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Switch to JPEG
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);
      
      expect(screen.queryByText('Transparent background')).not.toBeInTheDocument();
    });
  });

  describe('Resolution Selection', () => {
    it('selects 2x resolution by default', () => {
      render(<ExportModal {...defaultProps} />);
      
      const resolution2x = screen.getByText('2x').closest('button');
      expect(resolution2x).toHaveClass('border-blue-500');
    });

    it('switches resolution when clicked', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const resolution3x = screen.getByText('3x').closest('button');
      await user.click(resolution3x!);
      
      expect(resolution3x).toHaveClass('border-blue-500');
    });
  });

  describe('Filename Input', () => {
    it('allows changing filename', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      await user.type(filenameInput, 'my-code');
      
      expect(filenameInput).toHaveValue('my-code');
      expect(screen.getByText('File will be saved as: my-code.png')).toBeInTheDocument();
    });

    it('generates timestamp filename when generate button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const generateButton = screen.getByTitle('Generate timestamp filename');
      await user.click(generateButton);
      
      const filenameInput = screen.getByRole('textbox') as HTMLInputElement;
      expect(filenameInput.value).toMatch(/^code-snippet-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });

    it('updates file extension when format changes', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Change filename
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      await user.type(filenameInput, 'test-file');
      
      // Switch to JPEG
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      expect(screen.getByText('File will be saved as: test-file.jpeg')).toBeInTheDocument();
    });
  });

  describe('Advanced Options', () => {
    it('toggles advanced options visibility', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const advancedButton = screen.getByText('Advanced Options');
      
      // Initially hidden
      expect(screen.queryByText('Transparent background')).not.toBeInTheDocument();
      
      // Show advanced options
      await user.click(advancedButton);
      expect(screen.getByText('Transparent background')).toBeInTheDocument();
      
      // Hide advanced options
      await user.click(advancedButton);
      expect(screen.queryByText('Transparent background')).not.toBeInTheDocument();
    });

    it('adjusts JPEG quality with slider', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Switch to JPEG
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);
      
      // Adjust quality
      const qualitySlider = screen.getByRole('slider');
      fireEvent.change(qualitySlider, { target: { value: '75' } });
      
      expect(screen.getByText('Quality: 75%')).toBeInTheDocument();
    });

    it('toggles PNG transparency', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Open advanced options
      const advancedButton = screen.getByText('Advanced Options');
      await user.click(advancedButton);
      
      const transparencyCheckbox = screen.getByRole('checkbox');
      expect(transparencyCheckbox).toBeChecked();
      
      await user.click(transparencyCheckbox);
      expect(transparencyCheckbox).not.toBeChecked();
    });
  });

  describe('Export Functionality', () => {
    it('calls onExport with correct options when export button is clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      render(<ExportModal {...defaultProps} onExport={onExport} />);
      
      // Change some settings
      const jpegButton = screen.getByText('JPEG').closest('button');
      await user.click(jpegButton!);
      
      const resolution3x = screen.getByText('3x').closest('button');
      await user.click(resolution3x!);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      await user.type(filenameInput, 'test-export');
      
      // Click export
      const exportButton = screen.getByText('Export');
      await user.click(exportButton);
      
      expect(onExport).toHaveBeenCalledWith({
        format: 'jpeg',
        resolution: 3,
        quality: 90,
        transparent: false,
        filename: 'test-export.jpeg'
      });
    });

    it('disables export button when filename is empty', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeDisabled();
    });

    it('shows export progress when isExporting is true', () => {
      render(<ExportModal {...defaultProps} isExporting={true} exportProgress={50} />);
      
      expect(screen.getAllByText('Exporting...')).toHaveLength(2); // Progress message and button text
      expect(screen.getByText('50%')).toBeInTheDocument();
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('disables all controls when exporting', () => {
      render(<ExportModal {...defaultProps} isExporting={true} />);
      
      // Format buttons should be disabled
      const pngButton = screen.getByText('PNG').closest('button');
      const jpegButton = screen.getByText('JPEG').closest('button');
      expect(pngButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(jpegButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      
      // Resolution buttons should be disabled
      const resolution1x = screen.getByText('1x').closest('button');
      expect(resolution1x).toHaveClass('opacity-50', 'cursor-not-allowed');
      
      // Filename input should be disabled
      const filenameInput = screen.getByDisplayValue('code-snippet');
      expect(filenameInput).toBeDisabled();
      
      // Export button should show "Exporting..."
      expect(screen.getAllByText('Exporting...')).toHaveLength(2); // Progress message and button text
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} />);
      
      const backdrop = document.querySelector('.fixed.inset-0');
      await user.click(backdrop!);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close when modal content is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} />);
      
      const modalContent = screen.getByText('Export Image').closest('.bg-white');
      await user.click(modalContent!);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes on Escape key press', async () => {
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close when exporting', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ExportModal {...defaultProps} onClose={onClose} isExporting={true} />);
      
      // Try clicking backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      await user.click(backdrop!);
      
      // Try pressing Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Close button should not be visible
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
      
      // Cancel button should be disabled
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('resets form when modal opens', () => {
      const { rerender } = render(<ExportModal {...defaultProps} isOpen={false} />);
      
      // Open modal
      rerender(<ExportModal {...defaultProps} isOpen={true} />);
      
      // Check default values
      expect(screen.getByDisplayValue('code-snippet')).toBeInTheDocument();
      expect(screen.getByText('PNG').closest('button')).toHaveClass('border-blue-500');
      expect(screen.getByText('2x').closest('button')).toHaveClass('border-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ExportModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByLabelText('Filename')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      // Tab through elements
      await user.tab();
      expect(screen.getByLabelText('Close modal')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('PNG').closest('button')).toHaveFocus();
    });

    it('has proper form labels', () => {
      render(<ExportModal {...defaultProps} />);
      
      expect(screen.getByText('Format')).toBeInTheDocument();
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText('Filename')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty filename gracefully', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeDisabled();
    });

    it('handles whitespace-only filename', async () => {
      const user = userEvent.setup();
      render(<ExportModal {...defaultProps} />);
      
      const filenameInput = screen.getByDisplayValue('code-snippet');
      await user.clear(filenameInput);
      await user.type(filenameInput, '   ');
      
      const exportButton = screen.getByText('Export');
      expect(exportButton).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<ExportModal {...defaultProps} className="custom-modal" />);
      
      const modal = document.querySelector('.fixed.inset-0');
      expect(modal).toHaveClass('custom-modal');
    });
  });
});