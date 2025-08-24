import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

describe('CodeEditor', () => {
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
    mockLanguageDetectionService.detectLanguage.mockResolvedValue({
      language: 'javascript',
      confidence: 0.8,
      alternatives: [
        { language: 'typescript', confidence: 0.6 }
      ]
    });
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
    await user.type(textarea, 'console.log("hello");');
    
    expect(onChange).toHaveBeenCalledWith('console.log("hello");');
  });

  it('calls onLanguageChange when language is selected', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    
    render(<CodeEditor {...defaultProps} onLanguageChange={onLanguageChange} />);
    
    const languageSelect = screen.getByLabelText(/language/i);
    await user.selectOptions(languageSelect, 'python');
    
    expect(onLanguageChange).toHaveBeenCalledWith('python');
  });

  it('handles Tab key for indentation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<CodeEditor {...defaultProps} code="function test() {" onChange={onChange} />);
    
    const textarea = screen.getByLabelText(/code/i);
    
    // Focus the textarea and position cursor at the end
    await user.click(textarea);
    fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });
    
    expect(onChange).toHaveBeenCalledWith('function test() {  ');
  });

  it('auto-detects language when code is entered', async () => {
    vi.useFakeTimers();
    const onLanguageChange = vi.fn();
    
    render(<CodeEditor {...defaultProps} onLanguageChange={onLanguageChange} />);
    
    const textarea = screen.getByLabelText(/code/i);
    
    // Type some Python code
    fireEvent.change(textarea, { 
      target: { value: 'def hello():\n    print("Hello, World!")' } 
    });
    
    // Fast-forward the debounce timer
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    await waitFor(() => {
      expect(mockLanguageDetectionService.detectLanguage).toHaveBeenCalledWith(
        'def hello():\n    print("Hello, World!")'
      );
    });
    
    vi.useRealTimers();
  });

  it('shows detection status while detecting', async () => {
    vi.useFakeTimers();
    
    // Make detectLanguage return a pending promise
    let resolveDetection: (value: any) => void;
    const detectionPromise = new Promise((resolve) => {
      resolveDetection = resolve;
    });
    mockLanguageDetectionService.detectLanguage.mockReturnValue(detectionPromise);
    
    render(<CodeEditor {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/code/i);
    fireEvent.change(textarea, { 
      target: { value: 'console.log("test");' } 
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/detecting/i)).toBeInTheDocument();
    });
    
    // Resolve the detection
    act(() => {
      resolveDetection!({
        language: 'javascript',
        confidence: 0.9,
        alternatives: []
      });
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/detecting/i)).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('shows confidence score after detection', async () => {
    vi.useFakeTimers();
    
    mockLanguageDetectionService.detectLanguage.mockResolvedValue({
      language: 'javascript',
      confidence: 0.85,
      alternatives: [
        { language: 'typescript', confidence: 0.6 }
      ]
    });
    
    render(<CodeEditor {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/code/i);
    fireEvent.change(textarea, { 
      target: { value: 'const x = 5;' } 
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/confidence: 85%/i)).toBeInTheDocument();
      expect(screen.getByText(/alternatives: typescript/i)).toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('shows auto-detected badge when language is detected', async () => {
    vi.useFakeTimers();
    const onLanguageChange = vi.fn();
    
    mockLanguageDetectionService.detectLanguage.mockResolvedValue({
      language: 'python',
      confidence: 0.9,
      alternatives: []
    });
    
    render(<CodeEditor {...defaultProps} language="python" onLanguageChange={onLanguageChange} />);
    
    const textarea = screen.getByLabelText(/code/i);
    fireEvent.change(textarea, { 
      target: { value: 'def hello(): pass' } 
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/auto/i)).toBeInTheDocument();
    });
    
    vi.useRealTimers();
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

  it('handles Ctrl+A keyboard shortcut', async () => {
    const user = userEvent.setup();
    
    render(<CodeEditor {...defaultProps} code="test code" />);
    
    const textarea = screen.getByLabelText(/code/i) as HTMLTextAreaElement;
    await user.click(textarea);
    
    // Simulate Ctrl+A
    fireEvent.keyDown(textarea, { 
      key: 'a', 
      code: 'KeyA', 
      ctrlKey: true 
    });
    
    // Check if text is selected (in a real browser, this would select all text)
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(textarea.value.length);
  });

  it('handles service initialization errors gracefully', async () => {
    mockLanguageDetectionService.getSupportedLanguages.mockImplementation(() => {
      throw new Error('Service unavailable');
    });
    
    // Should not crash and should render with fallback languages
    render(<CodeEditor {...defaultProps} />);
    
    await waitFor(() => {
      const languageSelect = screen.getByLabelText(/language/i);
      expect(languageSelect).toBeInTheDocument();
    });
  });

  it('handles detection errors gracefully', async () => {
    vi.useFakeTimers();
    
    mockLanguageDetectionService.detectLanguage.mockRejectedValue(
      new Error('Detection failed')
    );
    
    render(<CodeEditor {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/code/i);
    fireEvent.change(textarea, { 
      target: { value: 'some code' } 
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should not crash and should not show detection results
    await waitFor(() => {
      expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('debounces language detection properly', async () => {
    vi.useFakeTimers();
    
    render(<CodeEditor {...defaultProps} />);
    
    const textarea = screen.getByLabelText(/code/i);
    
    // Type multiple times quickly
    fireEvent.change(textarea, { target: { value: 'a' } });
    fireEvent.change(textarea, { target: { value: 'ab' } });
    fireEvent.change(textarea, { target: { value: 'abc' } });
    
    // Advance timer by less than debounce time
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Detection should not have been called yet
    expect(mockLanguageDetectionService.detectLanguage).not.toHaveBeenCalled();
    
    // Advance timer to complete debounce
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Now detection should be called once with the final value
    await waitFor(() => {
      expect(mockLanguageDetectionService.detectLanguage).toHaveBeenCalledTimes(1);
      expect(mockLanguageDetectionService.detectLanguage).toHaveBeenCalledWith('abc');
    });
    
    vi.useRealTimers();
  });

  it('prevents auto-detection after manual language selection', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const onLanguageChange = vi.fn();
    
    mockLanguageDetectionService.detectLanguage.mockResolvedValue({
      language: 'python',
      confidence: 0.9,
      alternatives: []
    });
    
    render(<CodeEditor {...defaultProps} onLanguageChange={onLanguageChange} />);
    
    // Manually select a language
    const languageSelect = screen.getByLabelText(/language/i);
    await user.selectOptions(languageSelect, 'java');
    
    expect(onLanguageChange).toHaveBeenCalledWith('java');
    
    // Now type code that would normally trigger auto-detection
    const textarea = screen.getByLabelText(/code/i);
    fireEvent.change(textarea, { 
      target: { value: 'def hello(): pass' } 
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Detection should run but not change the language
    await waitFor(() => {
      expect(mockLanguageDetectionService.detectLanguage).toHaveBeenCalled();
    });
    
    // Language should not have been auto-changed
    expect(onLanguageChange).toHaveBeenCalledTimes(1); // Only the manual selection
    
    vi.useRealTimers();
  });
});