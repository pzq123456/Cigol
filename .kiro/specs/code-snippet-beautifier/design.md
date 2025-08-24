# 优化后的设计文档

## 概述

代码片段美化器将构建为一个单页面应用程序，使用Next.js 15.5、React 19、TypeScript和Tailwind CSS v4。该应用将在客户端完全运行，无需后端服务器，确保快速响应和用户隐私保护。核心功能围绕代码输入、实时预览和图片生成展开。所有组件均为客户端组件，构建输出为完全静态的HTML/JS/CSS。

## 架构

### 技术栈
- **框架**: Next.js 15.5 (App Router，纯客户端渲染)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4
- **语法高亮**: Shiki (支持VS Code主题，支持按需加载)
- **语言检测**: highlight.js (用于更准确的自动检测)
- **图片生成**: html2canvas + 自定义Canvas API
- **状态管理**: React useState/useReducer (预留Zustand扩展可能)
- **轻量存储**: nanostores (用于组件间状态共享)
- **部署**: Cloudflare Pages (完全静态部署)

### 架构模式
```
┌─────────────────────────────────────────┐
│                 UI Layer                │
│  ┌─────────────┐  ┌─────────────────────┐│
│  │   Editor    │  │      Preview        ││
│  │  Component  │  │     Component       ││
│  └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│              Service Layer              │
│  ┌─────────────┐  ┌─────────────────────┐│
│  │  Highlight  │  │     Export          ││
│  │   Service   │  │     Service         ││
│  └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│               Utility Layer             │
│  ┌─────────────┐  ┌─────────────────────┐│
│  │  Language   │  │      Theme          ││
│  │  Detection  │  │     Manager         ││
│  └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────┘
```

## 组件和接口

### 核心组件

#### 1. CodeEditor 组件
```typescript
interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  isLoading?: boolean;
}
```

#### 2. CodePreview 组件
```typescript
interface CodePreviewProps {
  code: string;
  language: string;
  theme: Theme;
  settings: PreviewSettings;
  isExporting?: boolean;
}
```

#### 3. ControlPanel 组件
```typescript
interface ControlPanelProps {
  settings: PreviewSettings;
  onSettingsChange: (settings: Partial<PreviewSettings>) => void;
  onExport: (format: ExportFormat, resolution: number) => void;
  disabled?: boolean;
}
```

#### 4. ExportModal 组件
```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
}
```

#### 5. ErrorBoundary 组件
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

### 数据模型

#### Theme 接口
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
    number: string;
    operator: string;
  };
  windowStyle: 'macos' | 'windows' | 'none';
  isPreset: boolean;
}
```

#### PreviewSettings 接口
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
  windowStyle: 'macos' | 'windows' | 'none';
  showLineNumbers: boolean;
}
```

#### ExportOptions 接口
```typescript
interface ExportOptions {
  format: 'png' | 'jpeg';
  resolution: 1 | 2 | 3;
  quality: number;
  transparent: boolean;
  filename: string;
}
```

### 服务接口

#### HighlightService
```typescript
interface HighlightService {
  highlightCode(code: string, language: string, theme: Theme): Promise<string>;
  getSupportedLanguages(): string[];
  getAvailableThemes(): Theme[];
  loadLanguage(language: string): Promise<void>;
  loadTheme(themeId: string): Promise<void>;
}
```

#### LanguageDetectionService
```typescript
interface LanguageDetectionService {
  detectLanguage(code: string): string;
  getDetectionConfidence(code: string, language: string): number;
}
```

#### ExportService
```typescript
interface ExportService {
  exportToImage(element: HTMLElement, options: ExportOptions): Promise<Blob>;
  copyToClipboard(blob: Blob): Promise<void>;
  downloadFile(blob: Blob, filename: string): void;
  getExportStatus(): 'idle' | 'processing' | 'success' | 'error';
}
```

## 数据模型

### 应用状态结构
```typescript
interface AppState {
  code: string;
  language: string;
  settings: PreviewSettings;
  isExporting: boolean;
  exportStatus: 'idle' | 'processing' | 'success' | 'error';
  exportModal: {
    isOpen: boolean;
    options: ExportOptions;
  };
  ui: {
    sidebarOpen: boolean;
    previewMode: 'desktop' | 'mobile';
    isLoading: boolean;
  };
}
```

### 预设主题
应用将包含以下预设主题（按需加载）：
- VS Code Dark (默认)
- VS Code Light
- GitHub Dark
- GitHub Light
- Dracula
- Monokai
- Solarized Dark
- Solarized Light

### 支持的编程语言
基于Shiki和highlight.js的语言支持，包括但不限于：
- JavaScript/TypeScript
- Python
- Java
- C/C++
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- HTML/CSS
- SQL
- JSON/YAML
- Shell/Bash
- Markdown

## 错误处理

### 错误类型和处理策略

#### 1. 语法高亮错误
- **场景**: 无法识别的语言或语法错误
- **处理**: 降级到纯文本显示，显示警告信息，提供语言选择建议
- **用户体验**: 不阻断用户操作，提供手动选择选项

#### 2. 图片生成错误
- **场景**: html2canvas失败或内存不足
- **处理**: 重试机制，降低分辨率重试，提供SVG导出备选方案
- **用户体验**: 显示进度条和错误提示，提供解决方案建议

#### 3. 剪贴板操作错误
- **场景**: 浏览器不支持或用户拒绝权限
- **处理**: 降级到下载功能，显示权限请求说明
- **用户体验**: 友好的指引和备选方案

#### 4. 资源加载错误
- **场景**: 主题或语言资源加载失败
- **处理**: 回退到默认主题/语言，重试机制
- **用户体验**: 显示加载状态和错误提示

### 错误边界实现
```typescript
class CodeBeautifierErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 测试策略

### 单元测试
- **工具**: Jest + React Testing Library
- **覆盖范围**: 
  - 所有服务函数 (HighlightService, ExportService, LanguageDetectionService)
  - 工具函数 (语言检测, 主题管理)
  - 自定义Hooks
  - 工具函数(语言检测、主题管理)
- **目标覆盖率**: 90%+

### 组件测试
- **工具**: React Testing Library + MSW (Mock Service Worker)
- **测试内容**:
  - 组件渲染和交互
  - Props传递和状态更新
  - 用户事件处理
  - 可访问性测试
  - 错误边界测试

### 集成测试
- **工具**: Playwright
- **测试场景**:
  - 完整的代码输入到图片生成流程
  - 不同主题和设置的组合测试
  - 移动端响应式行为测试
  - 导出功能的端到端测试
  - 错误处理和恢复测试

### 性能测试
- **工具**: Lighthouse CI + Web Vitals
- **指标监控**:
  - First Contentful Paint < 1.5s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1
  - First Input Delay < 100ms
  - 图片生成时间 < 5s (4K分辨率)

### 可访问性测试
- **工具**: axe-core + WAVE
- **标准**: WCAG 2.1 AA级别
- **重点测试**:
  - 键盘导航和焦点管理
  - 屏幕阅读器兼容性
  - 颜色对比度检查
  - ARIA属性验证

### 浏览器兼容性测试
- **目标浏览器**:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **移动端**:
  - iOS Safari 14+
  - Chrome Mobile 90+
- **特殊考虑**: 剪贴板API和Canvas API的兼容性处理

## SEO和性能优化

### SEO策略
- **Meta标签优化**: 动态生成相关的title、description和keywords
- **结构化数据**: JSON-LD格式的WebApplication schema
- **Open Graph**: 社交媒体分享优化
- **Sitemap**: 自动生成XML sitemap
- **内部链接**: 相关工具和功能的交叉链接

### 性能优化
- **代码分割**: 动态导入非关键组件和语言/主题资源
- **图片优化**: 使用现代图片格式
- **缓存策略**: 静态资源长期缓存，Service Worker缓存关键资源
- **预加载**: 关键资源的预加载和预连接
- **Bundle分析**: 使用Next.js Bundle Analyzer定期分析包大小
- **压缩**: 使用Brotli压缩优化传输大小

### 用户体验优化
- **加载状态**: 所有异步操作的骨架屏和加载指示器
- **错误恢复**: 优雅的错误处理和恢复机制
- **离线支持**: Service Worker实现基本离线功能
- **渐进式增强**: 核心功能在JavaScript禁用时基本可用
- **操作反馈**: 实时预览和即时反馈机制
