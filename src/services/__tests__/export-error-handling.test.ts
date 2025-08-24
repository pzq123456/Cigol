import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import html2canvas from 'html2canvas';
import { ExportServiceImpl } from '../export';
import { ExportOptions, ExportError } from '../../types/export';

// Mock html2canvas
vi.mock('html2canvas');
const mockHtml2canvas = vi.mocked(html2canvas);

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(global.URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
});
Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
});

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(global.window, 'open', {
  value: mockWindowOpen,
  writable: true
});

// Mock document.execCommand
const mockExecCommand = vi.fn();
Object.defineProperty(global.document, 'execCommand', {
  value: mockExecCommand,
  writable: true
});

describe('ExportService Error Handling', () => {
  let exportService: ExportServiceImpl;
  let mockElement: HTMLElement;
  let mockCanvas: HTMLCanvasElement;
  let mockBlob: Blob;

  beforeEach(() => {
    exportService = new ExportServiceImpl();
    
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.style.width = '800px';
    mockElement.style.height = '600px';
    
    // Mock getBoundingClientRect
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({ 
      width: 800, 
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    // Create mock blob
    mockBlob = new Blob(['test'], { type: 'image/png' });
    
    // Mock canvas.toBlob
    mockCanvas.toBlob = vi.fn((callback) => {
      setTimeout(() => callback(mockBlob), 0);
    });

    // Reset mocks
    mockHtml2canvas.mockResolvedValue(mockCanvas);
    mockCreateObjectURL.mockReturnValue('blob:test-url');
    mockWindowOpen.mockReturnValue({ close: vi.fn() } as any);
    mockExecCommand.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Export Error Handling', () => {
    const defaultOptions: ExportOptions = {
      format: 'png',
      resolution: 1,
      quality: 90,
      transparent: false,
      filename: 'test.png'
    };

    it('should handle invalid element dimensions', async () => {
      // Mock element with zero dimensions
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({ 
        width: 0, 
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => {}
      });

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'INVALID_DIMENSIONS',
          message: 'Cannot export invisible or zero-sized element. Please ensure the element is visible.'
        });
    });

    it('should handle image too large error', async () => {
      // Mock element with very large dimensions
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({ 
        width: 10000, 
        height: 10000,
        top: 0,
        left: 0,
        bottom: 10000,
        right: 10000,
        x: 0,
        y: 0,
        toJSON: () => {}
      });

      const largeOptions: ExportOptions = {
        ...defaultOptions,
        resolution: 3 // This will make it exceed memory limit
      };

      await expect(exportService.exportToImage(mockElement, largeOptions))
        .rejects.toMatchObject({
          code: 'IMAGE_TOO_LARGE'
        });
    });

    it('should handle html2canvas timeout error', async () => {
      mockHtml2canvas.mockRejectedValue(new Error('Timeout exceeded'));

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_TIMEOUT',
          message: 'Export timed out. Try reducing image size or resolution.'
        });
    }, 10000);

    it('should handle memory errors', async () => {
      mockHtml2canvas.mockRejectedValue(new Error('Out of memory'));

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'MEMORY_ERROR',
          message: 'Not enough memory to generate image. Try reducing resolution or closing other applications.'
        });
    });

    it('should handle network/CORS errors', async () => {
      mockHtml2canvas.mockRejectedValue(new Error('CORS error'));

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'NETWORK_ERROR',
          message: 'Network error occurred during export. Check your internet connection and try again.'
        });
    });

    it('should handle empty canvas error', async () => {
      // Mock canvas with zero dimensions
      const emptyCanvas = document.createElement('canvas');
      emptyCanvas.width = 0;
      emptyCanvas.height = 0;
      mockHtml2canvas.mockResolvedValue(emptyCanvas);

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_FAILED',
          message: 'Failed to generate canvas. Canvas is empty or invalid.'
        });
    }, 10000);

    it('should handle empty blob error', async () => {
      // Mock canvas.toBlob to return empty blob
      mockCanvas.toBlob = vi.fn((callback) => {
        const emptyBlob = new Blob([], { type: 'image/png' });
        setTimeout(() => callback(emptyBlob), 0);
      });

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_FAILED',
          message: 'Failed to generate image blob. Blob is empty or invalid.'
        });
    }, 10000);

    it('should retry on retryable errors', async () => {
      let callCount = 0;
      mockHtml2canvas.mockImplementation(() => {
        callCount++;
        if (callCount < 2) { // Succeed on second attempt
          return Promise.reject(new Error('Failed to generate canvas'));
        }
        return Promise.resolve(mockCanvas);
      });

      const result = await exportService.exportToImage(mockElement, defaultOptions);
      
      expect(callCount).toBe(2);
      expect(result.blob).toBe(mockBlob);
    }, 10000);

    it('should not retry on non-retryable errors', async () => {
      let callCount = 0;
      mockHtml2canvas.mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('Invalid element dimensions'));
      });

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toThrow();
      
      expect(callCount).toBe(1); // Should not retry
    });

    it('should handle cancellation during retry', async () => {
      let callCount = 0;
      mockHtml2canvas.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Cancel after first attempt
          setTimeout(() => exportService.cancelExport(), 10);
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Failed to generate canvas')), 50);
          });
        }
        return Promise.resolve(mockCanvas);
      });

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_CANCELLED'
        });
    });
  });

  describe('Download Error Handling', () => {
    it('should handle download with fallback methods', async () => {
      // Mock primary download to fail
      mockCreateObjectURL.mockImplementationOnce(() => {
        throw new Error('URL creation failed');
      });

      // Mock successful fallback
      mockCreateObjectURL.mockReturnValueOnce('blob:fallback-url');

      await expect(exportService.downloadFileWithFallback(mockBlob, 'test.png'))
        .resolves.toBeUndefined();
    });

    it('should try window.open as final fallback', async () => {
      // Mock document.createElement to fail for anchor element
      const originalCreateElement = document.createElement;
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          throw new Error('Cannot create anchor element');
        }
        return originalCreateElement.call(document, tagName);
      });
      
      mockCreateObjectURL.mockReturnValue('blob:window-url');
      mockWindowOpen.mockReturnValueOnce({ close: vi.fn() } as any);

      await expect(exportService.downloadFileWithFallback(mockBlob, 'test.png'))
        .resolves.toBeUndefined();

      expect(mockWindowOpen).toHaveBeenCalledWith('blob:window-url', '_blank');
    });

    it('should handle popup blocked error', async () => {
      // Mock all methods to fail
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('URL creation failed');
      });

      const errorCallback = vi.fn();
      exportService.onError(errorCallback);

      await expect(exportService.downloadFileWithFallback(mockBlob, 'test.png'))
        .rejects.toMatchObject({
          code: 'DOWNLOAD_FAILED'
        });

      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Clipboard Error Handling', () => {
    it('should try alternative clipboard methods', async () => {
      // Mock primary clipboard to fail
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true
      });

      // Mock legacy execCommand to work
      mockExecCommand.mockReturnValue(true);

      await expect(exportService.copyToClipboardWithFallback(mockBlob))
        .resolves.toBeUndefined();
    });

    it('should handle all clipboard methods failing', async () => {
      // Mock all clipboard methods to fail
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true
      });
      
      Object.defineProperty(global.document, 'execCommand', {
        value: undefined,
        writable: true
      });

      const errorCallback = vi.fn();
      exportService.onError(errorCallback);

      await expect(exportService.copyToClipboardWithFallback(mockBlob))
        .rejects.toMatchObject({
          code: 'CLIPBOARD_FAILED',
          message: expect.stringContaining('Failed to copy to clipboard')
        });

      expect(errorCallback).toHaveBeenCalled();
    });

    it('should handle legacy clipboard failure', async () => {
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true
      });
      
      mockExecCommand.mockReturnValue(false);

      const errorCallback = vi.fn();
      exportService.onError(errorCallback);

      await expect(exportService.copyToClipboardWithFallback(mockBlob))
        .rejects.toMatchObject({
          code: 'CLIPBOARD_FAILED'
        });
    });
  });

  describe('Error Notification', () => {
    it('should notify error callbacks with proper error details', async () => {
      const errorCallback = vi.fn();
      exportService.onError(errorCallback);

      mockHtml2canvas.mockRejectedValue(new Error('Test error'));

      try {
        await exportService.exportToImage(mockElement, {
          format: 'png',
          resolution: 1,
          quality: 90,
          transparent: false,
          filename: 'test.png'
        });
      } catch (error) {
        // Expected to throw
      }

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'EXPORT_FAILED',
          message: 'Test error',
          details: expect.any(Error)
        })
      );
    });

    it('should handle error callback failures gracefully', async () => {
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      exportService.onError(faultyCallback);
      mockHtml2canvas.mockRejectedValue(new Error('Test error'));

      // Should not throw despite callback error
      await expect(exportService.exportToImage(mockElement, {
        format: 'png',
        resolution: 1,
        quality: 90,
        transparent: false,
        filename: 'test.png'
      })).rejects.toBeDefined();

      expect(faultyCallback).toHaveBeenCalled();
    });
  });
});