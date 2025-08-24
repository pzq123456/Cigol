// src/components/ContentPanel.tsx
import React from 'react';
import { PreviewSettings } from '@/types/preview';
import { TextInput } from './FormComponents';

interface ContentPanelProps {
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  disabled: boolean;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ settings, onSettingsChange, disabled }) => {
  const handleSettingChange = (key: keyof PreviewSettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <TextInput
        value={settings.title}
        onChange={(title) => handleSettingChange('title', title)}
        label="Title"
        placeholder="Enter a title for your code"
        disabled={disabled}
      />
      <TextInput
        value={settings.filename}
        onChange={(filename) => handleSettingChange('filename', filename)}
        label="Filename"
        placeholder="example.js"
        disabled={disabled}
      />
    </div>
  );
};

export default ContentPanel;