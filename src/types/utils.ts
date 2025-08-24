/**
 * Utility types for the application
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit properties recursively
 */
export type DeepOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P] extends object
    ? DeepOmit<T[P], K>
    : T[P];
};

/**
 * Extract function parameters
 */
export type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

/**
 * Create a type with all properties as strings (for form handling)
 */
export type StringifyValues<T> = {
  [K in keyof T]: string;
};

/**
 * Event handler types
 */
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;
export type KeyboardHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;

/**
 * Async function type
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

/**
 * Callback function type
 */
export type Callback<T extends any[] = any[], R = void> = (...args: T) => R;

/**
 * Subscription cleanup function
 */
export type Unsubscribe = () => void;

/**
 * Generic API response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * File information type
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Dimensions type
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Position type
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rectangle type
 */
export interface Rectangle extends Position, Dimensions {}

/**
 * Color type (hex, rgb, hsl)
 */
export type Color = string;

/**
 * Timeout ID type
 */
export type TimeoutId = ReturnType<typeof setTimeout>;

/**
 * Interval ID type
 */
export type IntervalId = ReturnType<typeof setInterval>;

/**
 * Environment type
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Generic error type
 */
export interface AppError {
  name: string;
  message: string;
  code?: string;
  stack?: string;
  cause?: Error;
}