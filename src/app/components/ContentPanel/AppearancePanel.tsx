import React from 'react';
import { PreviewSettings, FontFamily } from '@/types/preview';
import { Theme } from '@/types/theme';
import { FONT_FAMILIES, FONT_SIZE_RANGE, LINE_HEIGHT_RANGE } from '@/types/constants';
import { ColorPicker, RangeSlider, Select, ThemeSelector } from './FormComponents';

interface AppearancePanelProps {
  settings: PreviewSettings;
  onSettingsChange: (newSettings: Partial<PreviewSettings>) => void;
  availableThemes: Theme[];
  disabled: boolean;
}

const fontFamilyOptions = FONT_FAMILIES.map(font => ({
  value: font,
  label: font
}));

const AppearancePanel: React.FC<AppearancePanelProps> = ({
  settings,
  onSettingsChange,
  availableThemes,
  disabled,
}) => {
  const handleSettingChange = (key: keyof PreviewSettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  const handleThemeChange = (theme: Theme) => {
    handleSettingChange('theme', theme);
    handleSettingChange('backgroundColor', theme.background);
    handleSettingChange('windowStyle', theme.windowStyle);
  };

  return (
    <div className="p-6 rounded-lg shadow-md space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the look and feel of your preview.</p>
      </div>
      <div className="space-y-6">
        <ThemeSelector
          selectedTheme={settings.theme}
          onThemeChange={handleThemeChange}
          themes={availableThemes}
          disabled={disabled}
        />
        <ColorPicker
          value={settings.backgroundColor}
          onChange={(color) => handleSettingChange('backgroundColor', color)}
          label="Background Color"
          disabled={disabled}
        />
        <Select
          value={settings.fontFamily}
          onChange={(font) => handleSettingChange('fontFamily', font as FontFamily)}
          options={fontFamilyOptions}
          label="Font Family"
          disabled={disabled}
        />
        <RangeSlider
          value={settings.fontSize}
          onChange={(size) => handleSettingChange('fontSize', size)}
          min={FONT_SIZE_RANGE.min}
          max={FONT_SIZE_RANGE.max}
          label="Font Size"
          unit="px"
          disabled={disabled}
        />
        <RangeSlider
          value={settings.lineHeight}
          onChange={(height) => handleSettingChange('lineHeight', height)}
          min={LINE_HEIGHT_RANGE.min}
          max={LINE_HEIGHT_RANGE.max}
          step={LINE_HEIGHT_RANGE.step}
          label="Line Height"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default AppearancePanel;