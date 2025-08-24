/**
 * Export format options
 */
export type ExportFormat = 'png' | 'jpeg';

/**
 * Export resolution multiplier
 */
export type ExportResolution = 1 | 2 | 3;

/**
 * Export options for image generation
 */
export interface ExportOptions {
  format: ExportFormat;
  resolution: ExportResolution;
  quality: number; // 0-100 for JPEG, ignored for PNG
  transparent: boolean; // Only for PNG
  filename: string;
  width?: number;
  height?: number;
}

/**
 * Export status states
 */
export type ExportStatus = 'idle' | 'processing' | 'success' | 'error';

/**
 * Export result
 */
export interface ExportResult {
  blob: Blob;
  filename: string;
  format: ExportFormat;
  resolution: ExportResolution;
  size: {
    width: number;
    height: number;
  };
}

/**
 * Export error information
 */
export interface ExportError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Export progress information
 */
export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'generating' | 'finalizing';
  progress: number; // 0-100
  message?: string;
}