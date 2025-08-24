# Type Definitions

This directory contains all TypeScript type definitions for the Code Snippet Beautifier application.

## Structure

### Core Types

- **`theme.ts`** - Theme-related types including `Theme`, `ThemeId`, `WindowStyle`, and `ThemeConfig`
- **`preview.ts`** - Preview settings and language detection types
- **`export.ts`** - Export functionality types including formats, options, and results
- **`services.ts`** - Service interface definitions for highlight, export, and storage services
- **`app-state.ts`** - Application state management types and actions
- **`components.ts`** - React component prop interfaces
- **`utils.ts`** - Utility types and helper interfaces
- **`constants.ts`** - Default values and configuration constants

### Files

| File | Description |
|------|-------------|
| `index.ts` | Main export file - imports all types |
| `theme.ts` | Theme and styling types |
| `preview.ts` | Code preview and language detection types |
| `export.ts` | Image export functionality types |
| `services.ts` | Service interface definitions |
| `app-state.ts` | Application state and action types |
| `components.ts` | React component prop interfaces |
| `utils.ts` | Utility types and helpers |
| `constants.ts` | Default values and constants |
| `validation.ts` | Type validation examples |

## Usage

Import types from the main index file:

```typescript
import {
  Theme,
  PreviewSettings,
  ExportOptions,
  HighlightService,
  AppState,
  CodeEditorProps
} from '@/types';
```

Or import from specific files:

```typescript
import { Theme, ThemeId } from '@/types/theme';
import { ExportFormat, ExportOptions } from '@/types/export';
```

## Key Interfaces

### Theme
Defines the appearance and styling of code snippets:
```typescript
interface Theme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  colors: {
    keyword: string;
    string: string;
    comment: string;
    // ... more color definitions
  };
  windowStyle: 'macos' | 'windows' | 'none';
  isPreset: boolean;
}
```

### PreviewSettings
Configuration for code preview display:
```typescript
interface PreviewSettings {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  title: string;
  filename: string;
  padding: number;
  backgroundColor: string;
  borderRadius: number;
  showWindowControls: boolean;
  windowStyle: WindowStyle;
  showLineNumbers: boolean;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  maxWidth?: number;
  maxHeight?: number;
}
```

### ExportOptions
Options for image export functionality:
```typescript
interface ExportOptions {
  format: 'png' | 'jpeg';
  resolution: 1 | 2 | 3;
  quality: number;
  transparent: boolean;
  filename: string;
  width?: number;
  height?: number;
}
```

### Service Interfaces

#### HighlightService
```typescript
interface HighlightService {
  highlightCode(code: string, language: string, theme: Theme): Promise<string>;
  getSupportedLanguages(): Promise<LanguageInfo[]>;
  getAvailableThemes(): Promise<Theme[]>;
  loadLanguage(language: string): Promise<void>;
  loadTheme(themeId: ThemeId): Promise<Theme>;
  isLanguageSupported(language: string): boolean;
  getTheme(themeId: ThemeId): Promise<Theme>;
}
```

#### ExportService
```typescript
interface ExportService {
  exportToImage(element: HTMLElement, options: ExportOptions): Promise<ExportResult>;
  copyToClipboard(blob: Blob): Promise<void>;
  downloadFile(blob: Blob, filename: string): void;
  getExportStatus(): ExportStatus;
  onProgress(callback: (progress: ExportProgress) => void): () => void;
  onError(callback: (error: ExportError) => void): () => void;
  cancelExport(): void;
}
```

### AppState
Main application state structure:
```typescript
interface AppState {
  code: string;
  language: string;
  isLanguageDetected: boolean;
  settings: PreviewSettings;
  isExporting: boolean;
  exportStatus: ExportStatus;
  exportModal: {
    isOpen: boolean;
    options: ExportOptions;
  };
  ui: {
    sidebarOpen: boolean;
    previewMode: PreviewMode;
    isLoading: boolean;
    activeTab: 'editor' | 'preview' | 'settings';
    showLineNumbers: boolean;
    wordWrap: boolean;
  };
  error?: {
    type: 'highlight' | 'export' | 'storage' | 'network';
    message: string;
    details?: any;
  };
}
```

## Constants

Default values and configuration constants are available:

```typescript
import {
  DEFAULT_PREVIEW_SETTINGS,
  DEFAULT_EXPORT_OPTIONS,
  FONT_FAMILIES,
  THEME_IDS,
  ERROR_MESSAGES
} from '@/types/constants';
```

## Type Validation

The `validation.ts` file contains examples of all types being used correctly. This file serves as both documentation and a compile-time check that all types are properly defined.

## Requirements Coverage

This type system covers the following requirements:

- **Requirement 1.3**: Language detection and selection types
- **Requirement 2.1**: Theme and syntax highlighting types  
- **Requirement 3.1**: Preview customization types
- **Requirement 4.1**: Export functionality types

All service interfaces, component props, and state management types are defined to support the complete feature implementation.