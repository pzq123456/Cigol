import React from 'react';
import { Theme } from './theme';
import { PreviewSettings, PreviewMode } from './preview';
import { ExportOptions, ExportFormat, ExportResolution } from './export';

/**
 * CodeEditor component props
 */
export interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * CodePreview component props
 */
export interface CodePreviewProps {
  code: string;
  language: string;
  theme: Theme;
  settings: PreviewSettings;
  isExporting?: boolean;
  className?: string;
  onPreviewReady?: () => void;
}

/**
 * ControlPanel component props
 */
export interface ControlPanelProps {
  settings: PreviewSettings;
  onSettingsChange: (settings: Partial<PreviewSettings>) => void;
  onExport: (format: ExportFormat, resolution: ExportResolution) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * ExportModal component props
 */
export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
  exportProgress?: number;
  className?: string;
  initialOptions?: Partial<ExportOptions>;
}

/**
 * ThemeSelector component props
 */
export interface ThemeSelectorProps {
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  themes: Theme[];
  disabled?: boolean;
  className?: string;
}

/**
 * LanguageSelector component props
 */
export interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: string[];
  isDetected?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * ErrorBoundary component props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary component state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

/**
 * Modal component props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input component props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Select component props
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}