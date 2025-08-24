'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSelectorProps } from '@/types/components';
import { Theme } from '@/types/theme';
import { createThemeManager } from '@/services/theme-manager';

/**
 * Color picker component for background color selection
 */
export const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
  label: string;
  disabled?: boolean;
}> = ({ value, onChange, label, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const presetColors = ['#1e1e1e', '#2d2d30', '#0d1117', '#ffffff', '#f6f8fa', '#282c34', '#1a1a1a', '#fafafa', '#f5f5f5', '#e1e4e8'];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105`}
          style={{ backgroundColor: value }}
          aria-label={`Current color: ${value}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="#000000"
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setIsOpen(false); }}
                className={`w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 ${value === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 dark:border-gray-600'}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Range slider component with labels
 */
export const RangeSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  disabled?: boolean;
}> = ({ value, onChange, min, max, step = 1, label, unit = '', disabled = false }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 slider`}
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

/**
 * Theme selector component with preview
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  themes,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // 新增一个状态来存储按类别分组后的主题
  const [categories, setCategories] = useState<Record<string, Theme[]>>({});
  
  const themeManager = useMemo(() => createThemeManager(), []);

  // 修复: 使用 useEffect 异步加载主题分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const themeCategories = await themeManager.getThemeCategories();
        setCategories(themeCategories);
      } catch (error) {
        console.error('Failed to load theme categories:', error);
      }
    };
    
    // 只有当 themes prop 存在时才加载分类
    if (themes && themes.length > 0) {
      loadCategories();
    }
  }, [themeManager, themes]); // 依赖项为 themeManager 和 themes

  const handleThemeSelect = (theme: Theme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: selectedTheme.background }} />
            <span className="font-medium">{selectedTheme.name}</span>
          </div>
          <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* 修复: 遍历 categories 状态而不是实时分组 */}
          {Object.entries(categories).map(([categoryName, categoryThemes]) => (
            categoryThemes.length > 0 && (
              <div key={categoryName} className="p-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{categoryName}</div>
                {categoryThemes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full px-3 py-2 text-left rounded-md transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedTheme.id === theme.id ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: theme.background }} />
                      <span className="text-sm">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Select component for dropdown options
 */
export const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  disabled?: boolean;
}> = ({ value, onChange, options, label, disabled = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {options.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
      </select>
    </div>
  );
};

/**
 * Text input component
 */
export const TextInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, label, placeholder = '', disabled = false }) => {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
};

/**
 * Toggle switch component
 */
export const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};