import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CodeEditor } from '../CodeEditor';
import { createLanguageDetectionService } from '../../../services/language-detection';
import { createHighlightService } from '../../../services/highlight';

// Mock the services
vi.mock('../../../services/language-detection');
vi.mock('../../../services/highlight');

const mockLanguageDetectionService = {
  detectLanguage: vi.fn(),
  getDetectionConfidence: vi.fn(),
  getSupportedLanguages: vi.fn()
};

const mockHighlightService = {
  highlightCode: vi.fn(),
  getSupportedLanguages: vi.fn(),
  getAvailableThemes: vi.fn(),
  loadLanguage: vi.fn(),
  loadTheme: vi.fn(),
  isLanguageSupported: vi.fn(),
  getTheme: vi.fn()
};

(createLanguageDetectionService as any).mockReturnValue(mockLanguageDetectionService);
(createHighlightService as any).mockReturnValue(mockHighlightService);

describe('CodeEditor - Basic Functionality', () => {
  const defaultProps = {
    code: '',
    language: 'javascript',
    onChange: vi.fn(),
    onLanguageChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguageDetectionService.getSupportedLanguages.mockReturnValue([
      'javascript', 'typescript', 'python', 'java', 'html', 'css', 'json', 'plaintext'
    ]);
  });

  it('renders correctly with default props', () => {
    render(<CodeEditor {...defaultProps} />);
    
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paste your code here/i)).toBeInTheDocument();
  });

  it('displays the correct language in selector', () => {
    render(<CodeEditor {...defaultProps} language="python" />);
    
    const languageSelect = screen.getByDisplayValue('Python');
    expect(languageSelect).toBeInTheDocument();
  });

  it('calls onChange when code is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<CodeEditor {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByLabelText(/code/i);
    await user.type(textarea, 'hello');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onLanguageChange when language is selected', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    
    render(<CodeEditor {...defaultProps} onLanguageChange={onLanguageChange} />);
    
    const languageSelect = screen.getByLabelText(/language/i);
    await user.selectOptions(languageSelect, 'python');
    
    expect(onLanguageChange).toHaveBeenCalledWith('python');
  });

  it('handles Tab key for indentation', () => {
    const onChange = vi.fn();
    const code = "function test() {";
    
    render(<CodeEditor {...defaultProps} code={code} onChange={onChange} />);
    
    const textarea = screen.getByLabelText(/code/i) as HTMLTextAreaElement;
    
    // Set cursor position to the end
    textarea.selectionStart = code.length;
    textarea.selectionEnd = code.length;
    
    // Simulate Tab key press
    fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });
    
    expect(onChange).toHaveBeenCalledWith('function test() {  ');
  });

  it('displays character and line count', () => {
    const code = 'line 1\nline 2\nline 3';
    render(<CodeEditor {...defaultProps} code={code} />);
    
    expect(screen.getByText('20 characters')).toBeInTheDocument();
    expect(screen.getByText('3 lines')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    render(<CodeEditor {...defaultProps} disabled={true} />);
    
    const textarea = screen.getByLabelText(/code/i);
    const languageSelect = screen.getByLabelText(/language/i);
    
    expect(textarea).toBeDisabled();
    expect(languageSelect).toBeDisabled();
  });

  it('handles loading state correctly', () => {
    render(<CodeEditor {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    
    const textarea = screen.getByLabelText(/code/i);
    const languageSelect = screen.getByLabelText(/language/i);
    
    expect(textarea).toBeDisabled();
    expect(languageSelect).toBeDisabled();
  });

  it('uses custom placeholder text', () => {
    const customPlaceholder = 'Enter your code snippet here...';
    render(<CodeEditor {...defaultProps} placeholder={customPlaceholder} />);
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-editor-class';
    render(<CodeEditor {...defaultProps} className={customClass} />);
    
    const container = screen.getByLabelText(/code/i).closest('.space-y-4');
    expect(container).toHaveClass(customClass);
  });

  it('handles Ctrl+A keyboard shortcut', () => {
    render(<CodeEditor {...defaultProps} code="test code" />);
    
    const textarea = screen.getByLabelText(/code/i) as HTMLTextAreaElement;
    
    // Focus the textarea first
    textarea.focus();
    
    // Simulate Ctrl+A
    fireEvent.keyDown(textarea, { 
      key: 'a', 
      code: 'KeyA', 
      ctrlKey: true 
    });
    
    // The event should be prevented (no actual selection in test environment)
    // We just verify the event handler doesn't crash
    expect(textarea).toBeInTheDocument();
  });

  it('shows help text', () => {
    render(<CodeEditor {...defaultProps} />);
    
    expect(screen.getByText(/tip: use tab for indentation/i)).toBeInTheDocument();
    expect(screen.getByText(/language will be auto-detected/i)).toBeInTheDocument();
  });

  it('handles empty code gracefully', () => {
    render(<CodeEditor {...defaultProps} code="" />);
    
    expect(screen.getByText('0 characters')).toBeInTheDocument();
    expect(screen.getByText('1 lines')).toBeInTheDocument();
  });

  it('handles service initialization errors gracefully', async () => {
    mockLanguageDetectionService.getSupportedLanguages.mockImplementation(() => {
      throw new Error('Service unavailable');
    });
    
    // Should not crash and should render with fallback languages
    render(<CodeEditor {...defaultProps} />);
    
    // Should still render the basic structure
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code/i)).toBeInTheDocument();
  });
});