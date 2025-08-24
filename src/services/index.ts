// Language Detection Service
export { 
  LanguageDetectionServiceImpl, 
  createLanguageDetectionService 
} from './language-detection';

// Highlight Service
export { 
  HighlightServiceImpl, 
  createHighlightService 
} from './highlight';

// Theme Manager
export { 
  ThemeManager, 
  createThemeManager 
} from './theme-manager';

// Export Service
export { 
  ExportServiceImpl, 
  exportService 
} from './export';

// Service Types
export type { 
  LanguageDetectionService, 
  HighlightService,
  ExportService 
} from '../types/services';