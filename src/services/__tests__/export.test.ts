import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import html2canvas from 'html2canvas';
import { ExportServiceImpl } from '../export';
import { ExportOptions, ExportError, ExportProgress } from '../../types/export';

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

// Mock ClipboardItem
global.ClipboardItem = vi.fn().mockImplementation((data) => ({ data }));

// Mock navigator.clipboard
const mockClipboardWrite = vi.fn();
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    write: mockClipboardWrite
  },
  writable: true
});

describe('ExportServiceImpl', () => {
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

    // Reset clipboard mock to working state
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        write: mockClipboardWrite
      },
      writable: true
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
    mockClipboardWrite.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToImage', () => {
    const defaultOptions: ExportOptions = {
      format: 'png',
      resolution: 1,
      quality: 90,
      transparent: false,
      filename: 'test.png'
    };

    it('should export element to PNG image successfully', async () => {
      const result = await exportService.exportToImage(mockElement, defaultOptions);

      expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        width: 800,
        height: 600,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      }));

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png');
      
      expect(result).toEqual({
        blob: mockBlob,
        filename: 'test.png',
        format: 'png',
        resolution: 1,
        size: {
          width: 800,
          height: 600
        }
      });
    });

    it('should export element to JPEG image with quality', async () => {
      const jpegOptions: ExportOptions = {
        ...defaultOptions,
        format: 'jpeg',
        filename: 'test.jpg',
        quality: 80
      };

      await exportService.exportToImage(mockElement, jpegOptions);

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function), 
        'image/jpeg', 
        0.8
      );
    });

    it('should handle different resolutions correctly', async () => {
      const highResOptions: ExportOptions = {
        ...defaultOptions,
        resolution: 2
      };

      await exportService.exportToImage(mockElement, highResOptions);

      expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        width: 1600,
        height: 1200,
        scale: 2
      }));
    });

    it('should handle transparent PNG correctly', async () => {
      const transparentOptions: ExportOptions = {
        ...defaultOptions,
        transparent: true
      };

      await exportService.exportToImage(mockElement, transparentOptions);

      expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        backgroundColor: null
      }));
    });

    it('should validate export options', async () => {
      const invalidOptions: ExportOptions = {
        ...defaultOptions,
        format: 'svg' as any // Invalid format
      };

      await expect(exportService.exportToImage(mockElement, invalidOptions))
        .rejects.toThrow('Invalid format: svg');
    });

    it('should validate resolution options', async () => {
      const invalidOptions: ExportOptions = {
        ...defaultOptions,
        resolution: 5 as any // Invalid resolution
      };

      await expect(exportService.exportToImage(mockElement, invalidOptions))
        .rejects.toThrow('Invalid resolution: 5');
    });

    it('should validate JPEG quality', async () => {
      const invalidOptions: ExportOptions = {
        ...defaultOptions,
        format: 'jpeg',
        quality: 150 // Invalid quality
      };

      await expect(exportService.exportToImage(mockElement, invalidOptions))
        .rejects.toThrow('JPEG quality must be between 0 and 100');
    });

    it('should validate filename', async () => {
      const invalidOptions: ExportOptions = {
        ...defaultOptions,
        filename: '' // Empty filename
      };

      await expect(exportService.exportToImage(mockElement, invalidOptions))
        .rejects.toThrow('Filename is required');
    });

    it('should handle html2canvas errors', async () => {
      const error = new Error('Canvas generation failed');
      mockHtml2canvas.mockRejectedValue(error);

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_FAILED',
          message: 'Canvas generation failed'
        });
    });

    it('should handle canvas.toBlob errors', async () => {
      mockCanvas.toBlob = vi.fn((callback) => {
        setTimeout(() => callback(null), 0);
      });

      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toMatchObject({
          code: 'EXPORT_FAILED',
          message: 'Failed to generate image blob'
        });
    });

    it('should prevent concurrent exports', async () => {
      const promise1 = exportService.exportToImage(mockElement, defaultOptions);
      
      await expect(exportService.exportToImage(mockElement, defaultOptions))
        .rejects.toThrow('Export already in progress');

      await promise1; // Wait for first export to complete
    });

    it('should support export cancellation', async () => {
      // Test that cancellation sets status to idle
      exportService.cancelExport();
      expect(exportService.getExportStatus()).toBe('idle');
    });
  });

  describe('copyToClipboard', () => {
    it('should copy blob to clipboard successfully', async () => {
      await exportService.copyToClipboard(mockBlob);

      expect(mockClipboardWrite).toHaveBeenCalledWith([
        expect.objectContaining({
          data: { 'image/png': mockBlob }
        })
      ]);
    });

    it('should handle clipboard API not supported', async () => {
      // Remove clipboard API
      Object.defineProperty(global.navigator, 'clipboard', {
        value: undefined,
        writable: true
      });

      await expect(exportService.copyToClipboard(mockBlob))
        .rejects.toMatchObject({
          code: 'CLIPBOARD_FAILED',
          message: 'Clipboard API not supported'
        });
    });

    it('should handle clipboard write errors', async () => {
      const error = new Error('Permission denied');
      mockClipboardWrite.mockRejectedValue(error);

      try {
        await exportService.copyToClipboard(mockBlob);
      } catch (err: any) {
        expect(err.code).toBe('CLIPBOARD_FAILED');
        expect(err.message).toBe('Failed to copy to clipboard. Please try downloading instead.');
      }
    });
  });

  describe('downloadFile', () => {
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
      mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
    });

    it('should download file successfully', () => {
      exportService.downloadFile(mockBlob, 'test.png');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe('blob:test-url');
      expect(mockLink.download).toBe('test.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should handle download errors', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('URL creation failed');
      });

      expect(() => exportService.downloadFile(mockBlob, 'test.png'))
        .toThrow();
    });
  });

  describe('status and progress tracking', () => {
    it('should track export status correctly', async () => {
      expect(exportService.getExportStatus()).toBe('idle');

      const exportPromise = exportService.exportToImage(mockElement, {
        format: 'png',
        resolution: 1,
        quality: 90,
        transparent: false,
        filename: 'test.png'
      });

      expect(exportService.getExportStatus()).toBe('processing');

      await exportPromise;

      expect(exportService.getExportStatus()).toBe('success');
    });

    it('should notify progress callbacks', async () => {
      const progressCallback = vi.fn();
      const unsubscribe = exportService.onProgress(progressCallback);

      await exportService.exportToImage(mockElement, {
        format: 'png',
        resolution: 1,
        quality: 90,
        transparent: false,
        filename: 'test.png'
      });

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'preparing',
          progress: 0
        })
      );

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'finalizing',
          progress: 100
        })
      );

      unsubscribe();
    });

    it('should notify error callbacks', async () => {
      const errorCallback = vi.fn();
      const unsubscribe = exportService.onError(errorCallback);

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
          message: 'Test error'
        })
      );

      unsubscribe();
    });

    it('should handle callback errors gracefully', async () => {
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      exportService.onProgress(faultyCallback);
      
      // Should not throw despite callback error
      await expect(exportService.exportToImage(mockElement, {
        format: 'png',
        resolution: 1,
        quality: 90,
        transparent: false,
        filename: 'test.png'
      })).resolves.toBeDefined();
    });
  });
});