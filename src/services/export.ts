import html2canvas from 'html2canvas-pro'; // 更改这一行
import {
  ExportService,
} from '../types/services';
import {
  ExportOptions,
  ExportResult,
  ExportStatus,
  ExportProgress,
  ExportError,
  ExportFormat,
  ExportResolution
} from '../types/export';

/**
 * Implementation of ExportService for image generation and download
 */
export class ExportServiceImpl implements ExportService {
  private status: ExportStatus = 'idle';
  private progressCallbacks: ((progress: ExportProgress) => void)[] = [];
  private errorCallbacks: ((error: ExportError) => void)[] = [];
  private abortController: AbortController | null = null;
  private maxRetries = 3;

  /**
   * Exports an HTML element to an image using html2canvas with full CSS support and retry logic.
   * Handles state management and error propagation.
   * @param element The HTML element to export.
   * @param options The export options.
   * @returns A promise that resolves with the export result.
   */
  async exportToImage(element: HTMLElement, options: ExportOptions): Promise<ExportResult> {
    if (this.status === 'processing') {
      console.warn('Export already in progress.');
      throw new Error('Export already in progress');
    }
    
    console.log('[DEBUG] 🏁 Starting exportToImage process...');
    this.status = 'processing';
    this.abortController = new AbortController();

    try {
      let retryCount = 0;
      while (retryCount <= this.maxRetries) {
        try {
          // Attempt the export and return the result if successful
          return await this.attemptExport(element, options, retryCount);
        } catch (error) {
          // Check if the error is retryable and we haven't reached max retries
          if (this.isRetryableError(error) && retryCount < this.maxRetries) {
            console.warn(`[DEBUG] Export attempt failed, retrying (${retryCount + 1}/${this.maxRetries}):`, error);
            retryCount++;
            // Exponential backoff delay
            const delay = 1000 * Math.pow(2, retryCount - 1);
            console.log(`[DEBUG] Waiting for ${delay}ms before next retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            if (this.abortController?.signal.aborted) {
              // Re-throw if the user has cancelled during the delay
              throw new Error('Export cancelled');
            }
          } else {
            // Throw the error if it's not retryable or we've run out of attempts
            throw error;
          }
        }
      }
      throw new Error('Export failed after maximum retries');
    } catch (error) {
      // Catch any final errors and notify callbacks
      this.status = 'error';
      const exportError = this.createExportError(error);
      this.notifyError(exportError);
      console.error('[DEBUG] ❌ Final export failed:', exportError);
      throw exportError;
    } finally {
      // Reset the state after the process is complete
      this.abortController = null;
      // Use a brief timeout to allow for UI updates
      setTimeout(() => {
        if (this.status !== 'processing') {
          this.status = 'idle';
          console.log('[DEBUG] ✅ Export process finished, status is now idle.');
        }
      }, 2000);
    }
  }

  /**
   * The core logic for exporting an element to a canvas and then to an image blob.
   */
  private async attemptExport(element: HTMLElement, options: ExportOptions, retryCount: number): Promise<ExportResult> {
    // --- DEBUG LOGIC START ---
    console.log(`\n[DEBUG] 🚀 Starting attemptExport for attempt #${retryCount + 1}`);
    console.log('[DEBUG] 📥 Export Options:', options);
    console.log('[DEBUG] 📦 Element to export:', element);
    
    // Check for 'lab(' in the element's inner HTML
    const innerHtml = element.innerHTML;
    const hasLab = innerHtml.includes('lab(');
    console.log(`[DEBUG] 🤔 Does the element's inner HTML contain 'lab('?`, hasLab);
    if (hasLab) {
      console.log("[DEBUG] Content with 'lab(' found, this might be a source of rendering issues.");
    }
    // --- DEBUG LOGIC END ---

    this.validateExportOptions(options);

    // Calculate dimensions based on resolution
    const rect = element.getBoundingClientRect();
    const baseWidth = options.width || rect.width;
    const baseHeight = options.height || rect.height;
    
    console.log(`[DEBUG] 📏 Element dimensions: ${rect.width}x${rect.height}`);
    console.log(`[DEBUG] 📈 Calculated scaled dimensions: ${baseWidth}x${baseHeight} at resolution ${options.resolution}`);

    if (baseWidth <= 0 || baseHeight <= 0) {
      const errMsg = 'Invalid element dimensions';
      console.error(`[DEBUG] ❌ Error: ${errMsg}`);
      throw new Error(errMsg);
    }
    const scaledWidth = baseWidth * options.resolution;
    const scaledHeight = baseHeight * options.resolution;

    // Notify progress
    this.notifyProgress({
      stage: 'preparing',
      progress: 0,
      message: retryCount > 0 ? `Retrying export (${retryCount}/${this.maxRetries})...` : 'Preparing export...'
    });

    if (this.abortController?.signal.aborted) {
      console.warn('[DEBUG] Export cancelled during preparation.');
      throw new Error('Export cancelled');
    }

    this.notifyProgress({
      stage: 'rendering',
      progress: 25,
      message: 'Rendering HTML to canvas...'
    });
    console.log('[DEBUG] 🎨 Calling html2canvas...');

    // html2canvas configuration
    const canvasOptions = {
      width: scaledWidth,
      height: scaledHeight,
      scale: options.resolution,
      backgroundColor: options.transparent && options.format === 'png' ? null : '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false,
      // 启用 html2canvas-pro 新特性
      // 开启 CSS 颜色函数支持
      enableColorFunctions: true,
      // 开启 <img/> 的 object-fit 支持
      enableObjectFit: true
    };
    
    console.log('[DEBUG] ⚙️ html2canvas options:', canvasOptions);

    const canvas = await html2canvas(element, canvasOptions);

    console.log('[DEBUG] ✨ html2canvas finished.');
    console.log('[DEBUG] 🖼️ Generated canvas:', canvas);

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      const errMsg = 'Failed to generate canvas. Canvas is empty or invalid.';
      console.error(`[DEBUG] ❌ Error: ${errMsg}`);
      throw new Error(errMsg);
    }

    this.notifyProgress({
      stage: 'generating',
      progress: 75,
      message: 'Generating image file...'
    });
    
    console.log('[DEBUG] 💾 Converting canvas to blob...');

    if (this.abortController?.signal.aborted) {
      console.warn('[DEBUG] Export cancelled during blob generation.');
      throw new Error('Export cancelled');
    }

    const blob = await this.canvasToBlob(canvas, options);
    
    console.log('[DEBUG] ✅ Blob generated:', blob);
    if (!blob || blob.size === 0) {
      const errMsg = 'Failed to generate image blob. Blob is empty or invalid.';
      console.error(`[DEBUG] ❌ Error: ${errMsg}`);
      throw new Error(errMsg);
    }

    this.notifyProgress({
      stage: 'finalizing',
      progress: 100,
      message: 'Export complete!'
    });

    this.status = 'success';
    const result = {
      blob,
      filename: options.filename,
      format: options.format,
      resolution: options.resolution,
      size: {
        width: scaledWidth,
        height: scaledHeight
      }
    };
    console.log('[DEBUG] ✅ Export complete! Result:', result);
    return result;
  }

  /**
   * Converts a canvas to an image blob based on the specified format and quality.
   */
  private async canvasToBlob(canvas: HTMLCanvasElement, options: ExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const callback = (blob: Blob | null) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      };

      if (options.format === 'png') {
        canvas.toBlob(callback, 'image/png');
      } else if (options.format === 'jpeg') {
        const quality = Math.max(0, Math.min(1, options.quality / 100));
        canvas.toBlob(callback, 'image/jpeg', quality);
      } else {
        reject(new Error(`Unsupported format: ${options.format}`));
      }
    });
  }

  /**
   * Validates the provided export options.
   */
  private validateExportOptions(options: ExportOptions): void {
    const validFormats: ExportFormat[] = ['png', 'jpeg'];
    const validResolutions: ExportResolution[] = [1, 2, 3];

    if (!validFormats.includes(options.format)) {
      throw new Error(`Invalid format: ${options.format}. Supported formats: ${validFormats.join(', ')}`);
    }

    if (!validResolutions.includes(options.resolution)) {
      throw new Error(`Invalid resolution: ${options.resolution}. Supported resolutions: ${validResolutions.join(', ')}`);
    }

    if (options.format === 'jpeg' && (options.quality < 0 || options.quality > 100)) {
      throw new Error('JPEG quality must be between 0 and 100');
    }

    if (!options.filename || options.filename.trim() === '') {
      throw new Error('Filename is required');
    }
  }

  /**
   * Copies the generated image blob to the user's clipboard.
   */
  async copyToClipboard(blob: Blob): Promise<void> {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not supported');
      }
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      const message = error instanceof Error && error.message.includes('Clipboard API not supported') ?
        'Clipboard API not supported' :
        'Failed to copy to clipboard. Please try downloading instead.';
      const exportError: ExportError = {
        code: 'CLIPBOARD_FAILED',
        message,
        details: error
      };
      this.notifyError(exportError);
      throw exportError;
    }
  }

  /**
   * Initiates a file download for the generated image blob.
   */
  downloadFile(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const exportError: ExportError = {
        code: 'DOWNLOAD_FAILED',
        message: 'Failed to download file',
        details: error
      };
      this.notifyError(exportError);
      throw exportError;
    }
  }

  /**
   * Returns the current status of the export process.
   */
  getExportStatus(): ExportStatus {
    return this.status;
  }

  /**
   * Subscribes a callback to receive progress updates.
   */
  onProgress(callback: (progress: ExportProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribes a callback to receive error notifications.
   */
  onError(callback: (error: ExportError) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cancels the current export process.
   */
  cancelExport(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.status = 'idle';
  }

  /**
   * Notifies all subscribed progress callbacks.
   */
  private notifyProgress(progress: ExportProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Notifies all subscribed error callbacks.
   */
  private notifyError(error: ExportError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Creates a standardized ExportError object from a raw error.
   */
  private createExportError(error: unknown): ExportError {
    if (error instanceof Error) {
      if (error.message.includes('Export cancelled')) {
        return {
          code: 'EXPORT_CANCELLED',
          message: 'Export was cancelled by user',
          details: error
        };
      }
      if (error.message.includes('Invalid element dimensions')) {
        return {
          code: 'INVALID_DIMENSIONS',
          message: 'Cannot export invisible or zero-sized element. Please ensure the element is visible.',
          details: error
        };
      }
    }
    return {
      code: 'EXPORT_FAILED',
      message: error instanceof Error ? error.message : 'An unexpected error occurred during export',
      details: error
    };
  }

  /**
   * Determines if a given error is transient and can be retried.
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const message = error.message.toLowerCase();
    const nonRetryableErrors = [
      'export cancelled',
      'invalid element dimensions',
      'invalid format',
      'invalid resolution',
      'filename is required'
    ];
    if (nonRetryableErrors.some(err => message.includes(err))) {
      return false;
    }
    const retryableErrors = [
      'timeout',
      'network',
      'failed to generate',
      'canvas is empty',
      'blob is empty'
    ];
    return retryableErrors.some(err => message.includes(err));
  }
}

/**
 * Default export service instance
 */
export const exportService = new ExportServiceImpl();