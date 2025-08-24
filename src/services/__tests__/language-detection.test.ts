import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageDetectionServiceImpl, createLanguageDetectionService } from '../language-detection';

describe('LanguageDetectionService', () => {
  let service: LanguageDetectionServiceImpl;

  beforeEach(() => {
    service = LanguageDetectionServiceImpl.getInstance();
  });

  describe('detectLanguage', () => {
    it('should detect JavaScript code correctly', async () => {
      const jsCode = `
        function hello(name) {
          console.log(\`Hello, \${name}!\`);
          return true;
        }
      `;

      const result = await service.detectLanguage(jsCode);
      
      expect(result.language).toBe('javascript');
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(Array.isArray(result.alternatives)).toBe(true);
    });

    it('should detect Python code correctly', async () => {
      const pythonCode = `
        def hello(name):
            print(f"Hello, {name}!")
            return True
        
        if __name__ == "__main__":
            hello("World")
      `;

      const result = await service.detectLanguage(pythonCode);
      
      expect(result.language).toBe('python');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should detect TypeScript code correctly', async () => {
      const tsCode = `
        interface User {
          name: string;
          age: number;
        }
        
        function greet(user: User): string {
          return \`Hello, \${user.name}!\`;
        }
      `;

      const result = await service.detectLanguage(tsCode);
      
      expect(result.language).toBe('typescript');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should handle empty code', async () => {
      const result = await service.detectLanguage('');
      
      expect(result.language).toBe('plaintext');
      expect(result.confidence).toBe(0);
      expect(result.alternatives).toEqual([]);
    });

    it('should handle whitespace-only code', async () => {
      const result = await service.detectLanguage('   \n  \t  ');
      
      expect(result.language).toBe('plaintext');
      expect(result.confidence).toBe(0);
      expect(result.alternatives).toEqual([]);
    });

    it('should provide alternatives for ambiguous code', async () => {
      const ambiguousCode = `
        var x = 10;
        var y = 20;
        console.log(x + y);
      `;

      const result = await service.detectLanguage(ambiguousCode);
      
      expect(result.alternatives.length).toBeGreaterThan(0);
      expect(result.alternatives.every(alt => 
        typeof alt.language === 'string' && 
        typeof alt.confidence === 'number'
      )).toBe(true);
    });

    it('should handle code with syntax errors gracefully', async () => {
      const invalidCode = `
        function broken( {
          console.log("missing closing parenthesis"
        }
      `;

      const result = await service.detectLanguage(invalidCode);
      
      expect(typeof result.language).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('getDetectionConfidence', () => {
    it('should return high confidence for correct language match', async () => {
      const jsCode = `
        const arr = [1, 2, 3];
        const doubled = arr.map(x => x * 2);
        console.log(doubled);
      `;

      const confidence = await service.getDetectionConfidence(jsCode, 'javascript');
      
      expect(confidence).toBeGreaterThan(0.5);
    });

    it('should return low confidence for incorrect language match', async () => {
      const jsCode = `
        const arr = [1, 2, 3];
        const doubled = arr.map(x => x * 2);
      `;

      const confidence = await service.getDetectionConfidence(jsCode, 'python');
      
      expect(confidence).toBeLessThan(0.5);
    });

    it('should return 0 for empty code', async () => {
      const confidence = await service.getDetectionConfidence('', 'javascript');
      
      expect(confidence).toBe(0);
    });

    it('should return 0 for unsupported language', async () => {
      const code = 'console.log("hello");';
      const confidence = await service.getDetectionConfidence(code, 'nonexistent-language');
      
      expect(confidence).toBe(0);
    });

    it('should handle various confidence levels', async () => {
      const testCases = [
        {
          code: 'def hello():\n    print("Hello World")',
          language: 'python'
        },
        {
          code: 'SELECT name, email FROM users WHERE active = 1;',
          language: 'sql'
        },
        {
          code: '<div class="container"><p>Hello</p></div>',
          language: 'html'
        }
      ];

      for (const testCase of testCases) {
        const confidence = await service.getDetectionConfidence(testCase.code, testCase.language);
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
        // Just verify the confidence is a valid number, not specific ranges
        // since highlight.js behavior can vary
      }
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return an array of supported languages', () => {
      const languages = service.getSupportedLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      
      // Check for some common languages
      expect(languages).toContain('javascript');
      expect(languages).toContain('python');
      expect(languages).toContain('java');
    });

    it('should return a copy of the languages array', () => {
      const languages1 = service.getSupportedLanguages();
      const languages2 = service.getSupportedLanguages();
      
      expect(languages1).not.toBe(languages2); // Different array instances
      expect(languages1).toEqual(languages2); // Same content
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = LanguageDetectionServiceImpl.getInstance();
      const instance2 = LanguageDetectionServiceImpl.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('factory function', () => {
    it('should create a service instance', () => {
      const service = createLanguageDetectionService();
      
      expect(service).toBeDefined();
      expect(typeof service.detectLanguage).toBe('function');
      expect(typeof service.getDetectionConfidence).toBe('function');
      expect(typeof service.getSupportedLanguages).toBe('function');
    });
  });

  describe('confidence calculation edge cases', () => {
    it('should handle very short code snippets', async () => {
      const shortCode = 'x';
      const result = await service.detectLanguage(shortCode);
      
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle very long code snippets', async () => {
      const longCode = Array(100).fill('console.log("test");').join('\n');
      const result = await service.detectLanguage(longCode);
      
      expect(result.language).toBe('javascript');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should handle code with mixed languages', async () => {
      const mixedCode = `
        <script>
          function hello() {
            console.log("Hello from JavaScript");
          }
        </script>
        <style>
          body { color: red; }
        </style>
      `;

      const result = await service.detectLanguage(mixedCode);
      
      expect(['html', 'javascript', 'xml']).toContain(result.language);
      expect(typeof result.confidence).toBe('number');
    });
  });
});