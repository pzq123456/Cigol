import hljs from 'highlight.js';
import { LanguageDetectionService } from '../types/services';
import { LanguageDetectionResult } from '../types/preview';

/**
 * Language detection service implementation using highlight.js
 */
export class LanguageDetectionServiceImpl implements LanguageDetectionService {
  private static instance: LanguageDetectionServiceImpl;
  private supportedLanguages: string[];

  private constructor() {
    // Get all registered languages from highlight.js
    this.supportedLanguages = hljs.listLanguages();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LanguageDetectionServiceImpl {
    if (!LanguageDetectionServiceImpl.instance) {
      LanguageDetectionServiceImpl.instance = new LanguageDetectionServiceImpl();
    }
    return LanguageDetectionServiceImpl.instance;
  }

  /**
   * Detect programming language from code with confidence scoring
   */
  public async detectLanguage(code: string): Promise<LanguageDetectionResult> {
    if (!code.trim()) {
      return {
        language: 'plaintext',
        confidence: 0,
        alternatives: []
      };
    }

    try {
      // Use highlight.js auto-detection with a subset of languages for better accuracy
      const commonLanguages = [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'csharp',
        'html', 'css', 'json', 'yaml', 'xml', 'sql', 'bash', 'shell',
        'markdown', 'plaintext'
      ];
      
      const result = hljs.highlightAuto(code, commonLanguages);
      
      // Get the detected language
      let detectedLanguage = result.language || 'plaintext';
      
      // Apply heuristics for better detection
      detectedLanguage = this.applyDetectionHeuristics(code, detectedLanguage);
      
      // Calculate confidence based on relevance score
      const confidence = this.calculateConfidence(result.relevance || 0);
      
      // Get alternative languages with their confidence scores
      const alternatives = await this.getAlternativeLanguages(code, detectedLanguage);
      
      return {
        language: detectedLanguage,
        confidence,
        alternatives
      };
    } catch (error) {
      console.warn('Language detection failed:', error);
      return {
        language: 'plaintext',
        confidence: 0,
        alternatives: []
      };
    }
  }

  /**
   * Get detection confidence for a specific language
   */
  public async getDetectionConfidence(code: string, language: string): Promise<number> {
    if (!code.trim() || !this.isLanguageSupported(language)) {
      return 0;
    }

    try {
      // Try to highlight with the specific language
      const result = hljs.highlight(code, { language });
      
      // Calculate confidence based on how well the highlighting worked
      return this.calculateConfidence(result.relevance || 0);
    } catch (error) {
      // If highlighting fails, the language is likely incorrect
      return 0;
    }
  }

  /**
   * Get list of supported languages for detection
   */
  public getSupportedLanguages(): string[] {
    return [...this.supportedLanguages];
  }

  /**
   * Check if a language is supported
   */
  private isLanguageSupported(language: string): boolean {
    return this.supportedLanguages.includes(language);
  }

  /**
   * Calculate confidence score from highlight.js relevance
   * Relevance typically ranges from 0-10, we normalize to 0-1
   */
  private calculateConfidence(relevance: number): number {
    // Normalize relevance score to 0-1 range
    const normalized = Math.min(relevance / 10, 1);
    
    // Apply confidence thresholds
    if (normalized < 0.1) return 0; // Very low confidence
    if (normalized < 0.3) return 0.3; // Low confidence
    if (normalized < 0.6) return 0.6; // Medium confidence
    if (normalized < 0.8) return 0.8; // High confidence
    return 0.95; // Very high confidence (cap at 95%)
  }

  /**
   * Apply heuristics to improve language detection accuracy
   */
  private applyDetectionHeuristics(code: string, detectedLanguage: string): string {
    const codeLines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // JavaScript/TypeScript heuristics
    if (code.includes('console.log') || code.includes('function ') || code.includes('=>') || code.includes('const ') || code.includes('let ')) {
      if (code.includes(': string') || code.includes(': number') || code.includes('interface ') || code.includes('type ')) {
        return 'typescript';
      }
      return 'javascript';
    }
    
    // Python heuristics
    if (code.includes('def ') || code.includes('print(') || code.includes('if __name__') || code.includes('import ')) {
      return 'python';
    }
    
    // Java heuristics
    if (code.includes('public class') || code.includes('public static void main') || code.includes('System.out.println')) {
      return 'java';
    }
    
    // HTML heuristics
    if (code.includes('<div') || code.includes('<html') || code.includes('<body') || code.includes('</')) {
      return 'html';
    }
    
    // CSS heuristics
    if (code.includes('{') && code.includes('}') && code.includes(':') && !code.includes('function')) {
      const hasSelectors = /[.#][\w-]+\s*{/.test(code) || /\w+\s*{/.test(code);
      if (hasSelectors) {
        return 'css';
      }
    }
    
    // SQL heuristics
    if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(code)) {
      return 'sql';
    }
    
    // JSON heuristics
    if (code.trim().startsWith('{') && code.trim().endsWith('}') && code.includes('"')) {
      try {
        JSON.parse(code);
        return 'json';
      } catch {
        // Not valid JSON, continue with original detection
      }
    }
    
    return detectedLanguage;
  }

  /**
   * Get alternative language suggestions
   */
  private async getAlternativeLanguages(
    code: string, 
    excludeLanguage: string
  ): Promise<Array<{ language: string; confidence: number }>> {
    const alternatives: Array<{ language: string; confidence: number }> = [];
    
    // Test a subset of common languages to avoid performance issues
    const commonLanguages = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'csharp',
      'html', 'css', 'json', 'yaml', 'xml', 'sql', 'bash', 'shell'
    ];

    for (const lang of commonLanguages) {
      if (lang === excludeLanguage || !this.isLanguageSupported(lang)) {
        continue;
      }

      try {
        const confidence = await this.getDetectionConfidence(code, lang);
        if (confidence > 0.2) { // Only include reasonable alternatives
          alternatives.push({ language: lang, confidence });
        }
      } catch (error) {
        // Skip languages that cause errors
        continue;
      }
    }

    // Sort by confidence and return top 3
    return alternatives
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
}

/**
 * Factory function to create language detection service
 */
export function createLanguageDetectionService(): LanguageDetectionService {
  return LanguageDetectionServiceImpl.getInstance();
}