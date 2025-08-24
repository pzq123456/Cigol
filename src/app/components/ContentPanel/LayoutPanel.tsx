// src/components/LayoutPanel.tsx
import React from 'react';
import { PreviewSettings } from '@/types/preview';
import { WindowStyle } from '@/types/theme';
import { PADDING_RANGE, BORDER_RADIUS_RANGE, TAB_SIZE_OPTIONS } from '@/types/constants';
import { RangeSlider, Select, Toggle } from './FormComponents';

interface LayoutPanelProps {
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  disabled: boolean;
}

const windowStyleOptions = [
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'none', label: 'None' }
];

const tabSizeOptions = TAB_SIZE_OPTIONS.map(size => ({
  value: size.toString(),
  label: `${size} spaces`
}));

const LayoutPanel: React.FC<LayoutPanelProps> = ({ settings, onSettingsChange, disabled }) => {
  const handleSettingChange = (key: keyof PreviewSettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <Select
        value={settings.windowStyle}
        onChange={(style) => handleSettingChange('windowStyle', style as WindowStyle)}
        options={windowStyleOptions}
        label="Window Style"
        disabled={disabled}
      />
      <Toggle
        checked={settings.showWindowControls}
        onChange={(show) => handleSettingChange('showWindowControls', show)}
        label="Show Window Controls"
        disabled={disabled}
      />
      <Toggle
        checked={settings.showLineNumbers}
        onChange={(show) => handleSettingChange('showLineNumbers', show)}
        label="Show Line Numbers"
        disabled={disabled}
      />
      <RangeSlider
        value={settings.padding}
        onChange={(padding) => handleSettingChange('padding', padding)}
        min={PADDING_RANGE.min}
        max={PADDING_RANGE.max}
        label="Padding"
        unit="px"
        disabled={disabled}
      />
      <RangeSlider
        value={settings.borderRadius}
        onChange={(radius) => handleSettingChange('borderRadius', radius)}
        min={BORDER_RADIUS_RANGE.min}
        max={BORDER_RADIUS_RANGE.max}
        label="Border Radius"
        unit="px"
        disabled={disabled}
      />
      <Select
        value={settings.tabSize.toString()}
        onChange={(size) => handleSettingChange('tabSize', parseInt(size))}
        options={tabSizeOptions}
        label="Tab Size"
        disabled={disabled}
      />
      <Toggle
        checked={settings.wordWrap}
        onChange={(wrap) => handleSettingChange('wordWrap', wrap)}
        label="Word Wrap"
        disabled={disabled}
      />
    </div>
  );
};

export default LayoutPanel;