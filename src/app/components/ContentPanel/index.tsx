'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ControlPanelProps } from '@/types/components';
import { Theme } from '@/types/theme';
import { createThemeManager } from '@/services/theme-manager';
import AppearancePanel from './AppearancePanel';
import LayoutPanel from './LayoutPanel';
import ContentPanel from './ContentPanel';
import ExportPanel from './ExportPanel';

/**
 * ControlPanel component for customizing code preview settings
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onSettingsChange,
  onExport,
  disabled = false,
  className = ''
}) => {
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('appearance');
  
  const themeManager = useMemo(() => createThemeManager(), []);

  // Load available themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        const themes = await themeManager.getAvailableThemes();
        setAvailableThemes(themes);
      } catch (error) {
        console.error('Failed to load themes:', error);
        setAvailableThemes([settings.theme]);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemes();
  }, [themeManager, settings.theme]);

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'export', label: 'Export', icon: '📤' }
  ];

  const renderActivePanel = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <AppearancePanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            availableThemes={availableThemes}
            disabled={disabled}
          />
        );
      case 'layout':
        return (
          <LayoutPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            disabled={disabled}
          />
        );
      case 'content':
        return (
          <ContentPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            disabled={disabled}
          />
        );
      case 'export':
        return (
          <ExportPanel
            onExport={onExport}
            disabled={disabled}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Section Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1 p-2" aria-label="Control panel sections">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              disabled={disabled}
              className={`
                flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${activeSection === section.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span>{section.icon}</span>
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content with 100% height */}
      <div className="flex-grow overflow-y-auto p-6">
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default ControlPanel;