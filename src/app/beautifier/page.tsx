'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CodeEditor from '../components/CodeEditor';
import { CodePreview } from '../components/CodePreview';
import ControlPanel from '../components/ContentPanel'; // 确保这里是正确的路径
import ExportModal from '../components/ExportModal';
import ThemeToggle from '../components/ThemeToggle';
import { PreviewSettings } from '../../types/preview';
import { Theme } from '../../types/theme';
import { ExportOptions, ExportFormat, ExportResolution, ExportProgress } from '../../types/export';
import { exportService } from '../../services/export';
import { createLanguageDetectionService } from '../../services/language-detection';
import { createThemeManager } from '../../services/theme-manager';

// 关键修复: 在父组件的顶层导入并加载所有字体
import { Inter, Fira_Code, Roboto_Mono, JetBrains_Mono, Source_Code_Pro, Victor_Mono, Pacifico } from 'next/font/google';

// 创建字体对象
const interFont = Inter({ subsets: ['latin'], display: 'swap' });
const firaCodeFont = Fira_Code({ subsets: ['latin'], display: 'swap' });
const robotoMonoFont = Roboto_Mono({ subsets: ['latin'], display: 'swap' });
const jetBrainsMonoFont = JetBrains_Mono({ subsets: ['latin'], display: 'swap' });
const sourceCodeProFont = Source_Code_Pro({ subsets: ['latin'], display: 'swap' });
const victorMonoFont = Victor_Mono({ subsets: ['latin'], display: 'swap' });
const pacificoFont = Pacifico({ subsets: ['latin'], display: 'swap', weight: '400' }); // 示例：如果需要更多字体，可以继续添加

// 创建字体类名映射，这是核心改变
const fontMap = {
  'Inter': interFont.className,
  'Fira Code': firaCodeFont.className,
  'Roboto Mono': robotoMonoFont.className,
  'JetBrains Mono': jetBrainsMonoFont.className,
  'Source Code Pro': sourceCodeProFont.className,
  'Victor Mono': victorMonoFont.className,
  'Pacifico': pacificoFont.className, // 示例：如果需要更多字体，可以继续添加
};


/**
 * Code Snippet Beautifier main page
 */
export default function BeautifierPage() {
  // Core state
  const [code, setCode] = useState('// Welcome to Code Snippet Beautifier!\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet("World");');
  const [language, setLanguage] = useState('javascript');
  const [isLanguageDetected, setIsLanguageDetected] = useState(true);
  
  // Theme and settings state
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [settings, setSettings] = useState<PreviewSettings>({
    theme: null as any, // Will be set when themes load
    fontSize: 14,
    fontFamily: 'Fira Code', // 确保这里是单个字体名称
    lineNumbers: true,
    title: '',
    filename: 'example.js',
    padding: 32,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    showWindowControls: true,
    windowStyle: 'macos',
    showLineNumbers: true,
    lineHeight: 1.5,
    tabSize: 2,
    wordWrap: false
  });

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  // 新增状态来存储初始导出选项
  const [exportInitialOptions, setExportInitialOptions] = useState<Partial<ExportOptions>>({});

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize themes and detect mobile
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        const themeManager = createThemeManager();
        const themes = await themeManager.getAvailableThemes();
        setAvailableThemes(themes);
        
        // Set default theme (VS Code Dark)
        const defaultTheme = themes.find(t => t.id === 'vs-dark') || themes[0];
        if (defaultTheme) {
          setCurrentTheme(defaultTheme);
          setSettings(prev => ({ ...prev, theme: defaultTheme }));
        }
      } catch (error) {
        console.error('Failed to initialize themes:', error);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    initializeThemes();
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 修改：当代码变化时，如果未手动选择语言，则自动检测
  useEffect(() => {
    // 只有在是自动检测状态时才执行
    if (code.trim() && isLanguageDetected) {
      const detectLanguage = async () => {
        try {
          const languageDetectionService = createLanguageDetectionService();
          const result = await languageDetectionService.detectLanguage(code);
          
          if (result.language && result.language !== language && result.confidence > 0.5) {
            setLanguage(result.language);
            // 自动检测成功，isLanguageDetected保持true
            
            // Update filename extension
            const extensions: Record<string, string> = {
              javascript: 'js',
              typescript: 'ts',
              python: 'py',
              java: 'java',
              cpp: 'cpp',
              c: 'c',
              go: 'go',
              rust: 'rs',
              php: 'php',
              ruby: 'rb',
              swift: 'swift',
              kotlin: 'kt',
              html: 'html',
              css: 'css',
              json: 'json',
              yaml: 'yml',
              sql: 'sql',
              bash: 'sh',
              markdown: 'md'
            };
            
            const extension = extensions[result.language] || 'txt';
            setSettings(prev => ({
              ...prev,
              filename: `example.${extension}`
            }));
          }
        } catch (error) {
          console.error('Language detection failed:', error);
        }
      };
      
      detectLanguage();
    }
  }, [code, language, isLanguageDetected]); // 添加 isLanguageDetected 到依赖数组

  // Handle code changes
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    // 当代码被清空时，重新启用自动检测
    if (!newCode.trim()) {
      setIsLanguageDetected(true);
    }
  }, []);

  // 修改：当语言手动变化时，禁用自动检测
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    setIsLanguageDetected(false); // <--- 这是关键的修复
  }, []);

  // Handle settings changes
  const handleSettingsChange = useCallback((newSettings: Partial<PreviewSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Update current theme if theme changed
    if (newSettings.theme && newSettings.theme !== currentTheme) {
      setCurrentTheme(newSettings.theme);
    }
  }, [currentTheme]);

  // 新增：处理打开导出模态框并设置初始选项
  const handleOpenExportModal = useCallback((format: ExportFormat, resolution: ExportResolution) => {
    const options: Partial<ExportOptions> = {
      format,
      resolution,
    };
    if (format === 'jpeg') {
        options.transparent = false;
        options.quality = 90;
    } else {
        options.transparent = true;
    }
    setExportInitialOptions(options);
    setIsExportModalOpen(true);
  }, []);

  // Handle export with options
  const handleExportWithOptions = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 200;

    const tryExport = async (): Promise<void> => {
      try {
        const previewElement = document.querySelector('[data-export-target="true"][role="region"]') as HTMLElement;
        
        if (!previewElement) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryExport, retryDelay);
            return;
          } else {
            throw new Error('无法找到代码预览元素。请确保代码预览已正确加载。');
          }
        }

        const rect = previewElement.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        const hasContent = previewElement.textContent && previewElement.textContent.trim().length > 0;

        if (!visible || !hasContent) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryExport, retryDelay);
            return;
          } else {
            throw new Error('预览元素未准备好。请检查预览是否正确显示。');
          }
        }

        const unsubscribeProgress = exportService.onProgress((progress: ExportProgress) => {
          setExportProgress(progress.progress);
        });

        const unsubscribeError = exportService.onError((error) => {
          setExportError(error.message);
        });

        try {
          const result = await exportService.exportToImage(previewElement, options);
          exportService.downloadFile(result.blob, result.filename);
          
          setTimeout(() => {
            setIsExportModalOpen(false);
          }, 1000);
          
        } finally {
          unsubscribeProgress();
          unsubscribeError();
        }

      } catch (error) {
        console.error('Export failed:', error);
        setExportError(error instanceof Error ? error.message : '导出失败');
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    };

    tryExport();
  }, []);

  const handlePreviewReady = useCallback(() => {
    console.log('Preview ready callback triggered');
  }, []);

  const handleModalClose = useCallback(() => {
    if (!isExporting) {
      setIsExportModalOpen(false);
      setExportError(null);
      setExportProgress(0);
    }
  }, [isExporting]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // 关键修复: 确保字体映射正确，并添加类型安全
  const dynamicFontClass = useMemo(() => {
    const font = settings.fontFamily as keyof typeof fontMap;
    // 使用类型守卫确保键存在
    if (font in fontMap) {
      return fontMap[font];
    }
    return ''; // 如果找不到，返回空字符串
  }, [settings.fontFamily]);
  
  if (!currentTheme) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-mono text-sm">C</span>
              </div>
              <span>Code Beautifier</span>
            </Link>
            
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-90' : 'relative w-90'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <ControlPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onExport={handleOpenExportModal} 
              className="h-full"
            />
          </div>
        </aside>

        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Editor</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                code={code}
                language={language}
                onChange={handleCodeChange}
                onLanguageChange={handleLanguageChange}
                className="h-full"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h2>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
              <div className="h-full flex items-center justify-center">
                <CodePreview
                  code={code}
                  language={language}
                  theme={currentTheme}
                  settings={settings}
                  className="max-w-full max-h-full"
                  onPreviewReady={handlePreviewReady}
                  dynamicFontClass={dynamicFontClass} // ⬅️ 将动态类名作为prop传递
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleModalClose}
        onExport={handleExportWithOptions}
        isExporting={isExporting}
        exportProgress={exportProgress}
        initialOptions={exportInitialOptions} 
      />

      {exportError && (
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-white bg-red-500 shadow-lg z-50 transition-opacity duration-300"
          role="alert"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{exportError}</span>
          </div>
        </div>
      )}
    </div>
  );
}