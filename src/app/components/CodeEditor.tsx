'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CodeEditorProps, LanguageSelectorProps } from '../../types/components';
import { createLanguageDetectionService } from '../../services/language-detection';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { LanguageDetectionResult } from '../../types/preview';

/**
 * Modern Language Selector Component with improved styling and UX
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  languages,
  isDetected = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (lang: string) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`
          relative w-full cursor-default rounded-md border border-gray-300 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm
          ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-400' : 'text-gray-900 dark:text-gray-100'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="flex items-center">
          <span className="ml-3 block truncate">
            {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
            {isDetected && <span className="text-gray-500 dark:text-gray-400"> (Auto)</span>}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && !disabled && (
        <ul
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          tabIndex={-1}
          role="listbox"
        >
          {languages.map((lang) => (
            <li
              key={lang}
              className={`
                relative cursor-default select-none py-2 pl-3 pr-9
                ${selectedLanguage === lang ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'}
              `}
              onClick={() => handleSelect(lang)}
            >
              <div className="flex items-center">
                <span className={`block truncate ${selectedLanguage === lang ? 'font-semibold' : 'font-normal'}`}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </span>
                {selectedLanguage === lang && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * CodeEditor component for inputting and editing code with syntax highlighting
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onLanguageChange,
  isLoading = false,
  placeholder = 'Paste your code here...',
  disabled = false,
  className = ''
}) => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [isLanguageManuallySelected, setIsLanguageManuallySelected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout>();

  const languageDetectionService = createLanguageDetectionService();

  // New: Sync internal state with external prop
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    const initializeLanguages = async () => {
      try {
        const languages = languageDetectionService.getSupportedLanguages();
        const allLanguages = Array.from(new Set([...languages])).sort();
        setSupportedLanguages(allLanguages);
      } catch (error) {
        console.error('Failed to load supported languages:', error);
        setSupportedLanguages(['javascript', 'python', 'java', 'html', 'css', 'json', 'plaintext']);
      }
    };
    initializeLanguages();
  }, [languageDetectionService]);

  const detectLanguage = useCallback(async (codeText: string) => {
    if (isLanguageManuallySelected) {
      return;
    }

    if (!codeText.trim() || codeText.length < 10) {
      return;
    }

    setIsDetecting(true);

    try {
      const result = await languageDetectionService.detectLanguage(codeText);
      setDetectionResult(result);

      if (result.confidence > 0.6) {
        setDetectedLanguage(result.language);
        setCurrentLanguage(result.language);
        onLanguageChange(result.language);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [languageDetectionService, onLanguageChange, isLanguageManuallySelected]);

  useEffect(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    if (code.trim()) {
      detectionTimeoutRef.current = setTimeout(() => {
        detectLanguage(code);
      }, 500);
    }

    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [code, detectLanguage]);

  const handleCodeChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setIsLanguageManuallySelected(true);
    setCurrentLanguage(newLanguage);
    onLanguageChange(newLanguage);
  }, [onLanguageChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      event.currentTarget.select();
    }
  }, [code, onChange]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [code]);

  return (
    <div className={`space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 min-w-0">
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <LanguageSelector
            selectedLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            languages={supportedLanguages}
            isDetected={!isLanguageManuallySelected && currentLanguage === detectedLanguage && detectionResult?.confidence > 0.6}
            disabled={disabled || isLoading}
            className="w-full sm:w-48"
          />
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          {isDetecting && (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Detecting...</span>
            </div>
          )}
          {detectionResult && detectionResult.confidence > 0 && !isDetecting && (
            <div className="hidden sm:block">
              <span className="font-semibold">Confidence:</span> {Math.round(detectionResult.confidence * 100)}%
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="code-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Code
        </label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="code-input"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`
              w-full px-4 py-3 text-sm font-mono border rounded-lg shadow-inner
              bg-gray-50 dark:bg-gray-800 dark:border-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              resize-none overflow-hidden transition-colors duration-200
            `}
            style={{ minHeight: '200px' }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{code.length} characters</span>
          <span>{code.split('\n').length} lines</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>
          Tip: Use <kbd>Tab</kbd> for indentation, <kbd>Ctrl/Cmd</kbd>+<kbd>A</kbd> to select all.
        </p>
      </div>
    </div>
  );
};

export default CodeEditor;